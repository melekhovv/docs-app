const db = require('./database');
const bcrypt = require('bcryptjs');

const users = [
    { name: 'Алексей Иванов',     email: 'admin@docs.ru', role: 'admin' },
{ name: 'Мария Петрова',      email: 'maria@docs.ru', role: 'user'  },
{ name: 'Дмитрий Козлов',     email: 'dmitry@docs.ru', role: 'user' },
{ name: 'Елена Сидорова',     email: 'elena@docs.ru', role: 'user'  },
{ name: 'Ольга Новикова',     email: 'olga@docs.ru', role: 'user'   },
];

const insertUser = db.prepare(`
INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
`);

const passwordHash = bcrypt.hashSync('123456', 10);
for (const u of users) insertUser.run(u.name, u.email, passwordHash, u.role);

const docs = [
    { title: 'Договор поставки №1', type: 'contract', status: 'approved', author_id: 1, responsible_id: 2, description: 'Поставка оборудования' },
{ title: 'Приказ об отпуске',   type: 'order',    status: 'pending',  author_id: 2, responsible_id: 1, description: 'Отпуск сотрудника' },
{ title: 'Акт выполненных работ', type: 'act', status: 'draft', author_id: 3, responsible_id: 1, description: 'Акт за июнь' },
{ title: 'Счёт на оплату №42',  type: 'invoice',  status: 'rejected', author_id: 4, responsible_id: 1, description: 'Счёт от подрядчика' },
];

const insertDoc = db.prepare(`
INSERT INTO documents (title, type, status, author_id, responsible_id, description)
VALUES (?, ?, ?, ?, ?, ?)
`);
for (const d of docs) insertDoc.run(d.title, d.type, d.status, d.author_id, d.responsible_id, d.description);

console.log('✅ Тестовые данные добавлены');
