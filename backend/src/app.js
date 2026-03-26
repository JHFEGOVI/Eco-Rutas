const express = require('express');
const cors = require('cors');
require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Router de prueba
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API EcoRutas funcionando' });
});

// Middleware de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
