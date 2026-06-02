const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
                                   filename: (req, file, cb) => {
                                       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                                       // Декодируем имя файла (исправление кракозябр)
                                       let originalName = file.originalname;
                                       try {
                                           originalName = decodeURIComponent(originalName);
                                       } catch (e) { /* уже декодировано */ }
                                       // Оставляем только безопасные символы + кириллицу
                                       const safeName = originalName
                                       .replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s\-_.]/g, '_')
                                       .replace(/\s+/g, '_')
                                       .trim();
                                       const ext = path.extname(originalName).toLowerCase();
                                       cb(null, uniqueSuffix + '_' + safeName);
                                   }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый формат. Разрешены: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = upload;
