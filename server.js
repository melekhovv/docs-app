const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(` Сервер: http://localhost:${PORT}`));
