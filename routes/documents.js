const router = require('express').Router();
const db = require('../database');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

/* ===== ПУБЛИЧНЫЕ РОУТЫ ДЛЯ ФАЙЛОВ (БЕЗ AUTH) ===== */
// Имя файла в URL — уникальный хеш, поэтому авторизация не нужна

// Просмотр файла inline (для <img>, <iframe>, открытия в браузере)
router.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Файл не найден' });
    }
    res.sendFile(filePath);
});

// Скачивание файла с оригинальным именем
router.get('/files/:filename/download', (req, res) => {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Файл не найден' });
    }
    // Получаем оригинальное имя из БД
    const doc = db.prepare(
        'SELECT file_name FROM documents WHERE file_url LIKE ?'
    ).get(`%${req.params.filename}`);
    const originalName = doc?.file_name || req.params.filename;
    res.download(filePath, originalName);
});

/* ===== ЗАЩИЩЁННЫЕ РОУТЫ (ТРЕБУЮТ AUTH) ===== */
router.use(auth);

// Получить все документы
router.get('/', (req, res) => {
    const { status, type, search } = req.query;
    let where = ['1=1'];
    const params = [];

    if (status && status !== 'all') { where.push('d.status = ?'); params.push(status); }
    if (type && type !== 'all')     { where.push('d.type = ?');   params.push(type); }
    if (search)                     { where.push('d.title LIKE ?'); params.push(`%${search}%`); }

    if (req.user.role !== 'admin') {
        where.push('(d.author_id = ? OR d.responsible_id = ?)');
        params.push(req.user.id, req.user.id);
    }

    const sql = `
    SELECT d.*, u1.name AS author_name, u2.name AS responsible_name
    FROM documents d
    LEFT JOIN users u1 ON u1.id = d.author_id
    LEFT JOIN users u2 ON u2.id = d.responsible_id
    WHERE ${where.join(' AND ')}
    ORDER BY d.updated_at DESC
    `;
    res.json(db.prepare(sql).all(...params));
});

// Получить один документ
router.get('/:id', (req, res) => {
    const doc = db.prepare(`
    SELECT d.*, u1.name AS author_name, u2.name AS responsible_name
    FROM documents d
    LEFT JOIN users u1 ON u1.id = d.author_id
    LEFT JOIN users u2 ON u2.id = d.responsible_id
    WHERE d.id = ?
    `).get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Не найдено' });

    const comments = db.prepare(`
    SELECT c.*, u.name AS user_name FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.document_id = ? ORDER BY c.created_at ASC
    `).all(req.params.id);

    res.json({ ...doc, comments });
});

// Создать документ
router.post('/', upload.single('file'), (req, res) => {
    const { title, type, description, responsible_id } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'Название и тип обязательны' });

    const file_url = req.file ? `/api/documents/files/${req.file.filename}` : null;
    const file_name = req.file ? req.file.originalname : null;

    const result = db.prepare(`
    INSERT INTO documents (title, type, description, status, author_id, responsible_id, file_url, file_name)
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?)
    `).run(title, type, description || null, req.user.id, responsible_id || null, file_url, file_name);

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(doc);
});

// Обновить документ
router.put('/:id', upload.single('file'), (req, res) => {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Не найдено' });

    const { title, type, description, responsible_id, remove_file } = req.body;

    let file_url = doc.file_url;
    let file_name = doc.file_name;

    // Удаление файла
    if (remove_file === '1' || remove_file === 'true') {
        if (doc.file_url) {
            const oldPath = path.join(__dirname, '..', 'uploads', path.basename(doc.file_url));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        file_url = null;
        file_name = null;
    }

    // Замена файла
    if (req.file) {
        if (doc.file_url) {
            const oldPath = path.join(__dirname, '..', 'uploads', path.basename(doc.file_url));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        file_url = `/api/documents/files/${req.file.filename}`;
        file_name = req.file.originalname;
    }

    db.prepare(`
    UPDATE documents
    SET title=?, type=?, description=?, responsible_id=?, file_url=?, file_name=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
    `).run(title, type, description || null, responsible_id || null, file_url, file_name, req.params.id);

    res.json({ success: true });
});

// Сменить статус
router.post('/:id/status', (req, res) => {
    const { status } = req.body;
    const allowed = ['draft', 'pending', 'approved', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' });

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Не найдено' });

    db.prepare('UPDATE documents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, req.params.id);

    db.prepare(`
    INSERT INTO status_history (document_id, user_id, from_status, to_status)
    VALUES (?, ?, ?, ?)
    `).run(req.params.id, req.user.id, doc.status, status);

    res.json({ success: true });
});

// Удалить документ
router.delete('/:id', (req, res) => {
    const doc = db.prepare('SELECT file_url FROM documents WHERE id = ?').get(req.params.id);
    if (doc?.file_url) {
        const filePath = path.join(__dirname, '..', 'uploads', path.basename(doc.file_url));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Добавить комментарий
router.post('/:id/comments', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Пустой комментарий' });
    db.prepare('INSERT INTO comments (document_id, user_id, text) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, text);
    res.status(201).json({ success: true });
});

module.exports = router;
