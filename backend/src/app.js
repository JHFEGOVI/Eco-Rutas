const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const vehiculosRoutes = require('./modules/vehiculos/vehiculos.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const rutasRoutes = require('./modules/rutas/rutas.routes');
const asignacionesRoutes = require('./modules/asignaciones/asignaciones.routes');
const recorridosRoutes = require('./modules/recorridos/recorridos.routes');

const app = express();

// Configuración de Swagger
const opcionesSwagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoRutas API',
      description: 'API REST para el sistema de optimización de recolección de residuos en Buenaventura',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor de desarrollo' },
      { url: 'http://72.62.168.15:3000', description: 'Servidor de producción' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const especificacionSwagger = swaggerJsdoc(opcionesSwagger);

// Middlewares globales
app.use(cors());
app.use(express.json());

// Documentación Swagger disponible en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(especificacionSwagger));

// Rutas
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API EcoRutas funcionando' });
});
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/recorridos', recorridosRoutes);

// Middleware de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
