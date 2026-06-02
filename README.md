# 📄 ДокиПросто - Система документооборота

Современная веб-система для управления документами с удобным интерфейсом и мощным функционалом.

## Возможности

- **Авторизация пользователей** с JWT-токенами
- **CRUD операции** с документами (создание, чтение, обновление, удаление)
- **Загрузка файлов** (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT до 20 МБ)
- **Workflow статусов**: Черновик → На согласовании → Утверждён/Отклонён
- **Комментарии** к документам
- **Дашборд** со статистикой и активностью
- **Фильтры и поиск** по документам
- **Назначение ответственных** за документы
- **Адаптивный дизайн** для всех устройств

## Технологический стек

### Backend
- **Node.js** + **Express** - веб-фреймворк
- **SQLite** (better-sqlite3) - база данных
- **JWT** (jsonwebtoken) - аутентификация
- **Bcrypt** - хеширование паролей
- **Multer** - загрузка файлов

### Frontend
- **HTML5** + **CSS3** - разметка и стили
- **Vanilla JavaScript** - клиентская логика
- **Flexbox/Grid** - адаптивная вёрстка

## Установка

### Требования
- Node.js 18+ 
- npm или yarn

### Шаги установки

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/melekhovv/docs-app.git
cd docs-app
```

2. **Установите зависимости**
```bash
npm install
```

3. **Инициализируйте базу данных**
```bash
node migration.js
```

4. **Добавьте тестовые данные** (опционально)
```bash
npm run seed
```

5. **Запустите сервер**
```bash
npm start
```

Сервер будет доступен по адресу: **http://localhost:3000**

## Использование

### Тестовый вход
- **Email:** `admin@docs.ru`
- **Пароль:** `123456`

### Основные сценарии

1. **Создание документа**
   - Нажмите "+ Новый документ"
   - Заполните название, тип, описание
   - Прикрепите файл (опционально)
   - Назначьте ответственного
   - Сохраните

2. **Работа с документами**
   - Просмотр списка документов
   - Фильтрация по статусу и типу
   - Поиск по названию
   - Изменение статуса (Отправить → Утвердить/Отклонить)

3. **Комментарии**
   - Откройте документ
   - Добавьте комментарий
   - Отслеживайте историю изменений

## Структура проекта

```
docs-app/
├── middleware/          # Промежуточное ПО
│   ├── auth.js         # JWT аутентификация
│   └── upload.js       # Загрузка файлов
├── routes/             # API маршруты
│   ├── auth.js         # Авторизация
│   └── documents.js    # Документы и файлы
├── public/             # Фронтенд
│   └── index.html      # Основной HTML + JS + CSS
├── database.js         # Подключение к БД
├── schema.sql          # Схема базы данных
├── migration.js        # Миграции БД
├── seed.js             # Тестовые данные
├── server.js           # Точка входа
├── package.json        # Зависимости
└── README.md           # Документация
```

## API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход в систему

### Документы
- `GET /api/documents` - Получить все документы
- `GET /api/documents/:id` - Получить документ по ID
- `POST /api/documents` - Создать документ
- `PUT /api/documents/:id` - Обновить документ
- `DELETE /api/documents/:id` - Удалить документ
- `POST /api/documents/:id/status` - Изменить статус
- `POST /api/documents/:id/comments` - Добавить комментарий

### Файлы
- `GET /api/documents/files/:filename` - Просмотр файла
- `GET /api/documents/files/:filename/download` - Скачать файл

##  База данных

### Таблицы

**users** - Пользователи
- id, name, email, password_hash, role, created_at

**documents** - Документы
- id, title, type, description, status, author_id, responsible_id, file_url, file_name, created_at, updated_at

**comments** - Комментарии
- id, document_id, user_id, text, created_at

**status_history** - История статусов
- id, document_id, user_id, from_status, to_status, created_at

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT-токены для аутентификации
- Валидация загружаемых файлов
- Защита от SQL-инъекций (prepared statements)
- CORS настроен для безопасности

##  Переменные окружения

Создайте файл `.env` (опционально):

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

## Скрипты

- `npm start` - Запуск сервера
- `npm run seed` - Добавление тестовых данных



## 👤 Автор

**melekhovv**

GitHub: [@melekhovv](https://github.com/melekhovv)

Qwen: https://chat.qwen.ai


