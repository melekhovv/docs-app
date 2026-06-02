// migration.js — запускаем ОДИН РАЗ, чтобы добавить поле для файла
const db = require('./database');

try {
    // Добавляем поле file_url в существующую таблицу
    db.exec(`ALTER TABLE documents ADD COLUMN file_url TEXT DEFAULT NULL`);
    db.exec(`ALTER TABLE documents ADD COLUMN file_name TEXT DEFAULT NULL`);
    console.log('✅ Поля file_url и file_name добавлены');
} catch (e) {
    if (e.message.includes('duplicate column')) {
        console.log('ℹ️ Поля уже существуют, пропускаем');
    } else {
        throw e;
    }
}

// Создаём папку для файлов
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('✅ Папка uploads/ создана');
}
