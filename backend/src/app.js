const express = require('express');
const cors = require('cors');
require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const vehiculosRoutes = require('./modules/vehiculos/vehiculos.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API EcoRutas funcionando' });
});
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);

// Middleware de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
