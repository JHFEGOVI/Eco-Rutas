require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { inicializarSocket } = require('./src/config/socket');
const { suspenderRecorridosVencidos } = require('./src/modules/recorridos/recorridos.service');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
inicializarSocket(server);

server.listen(PORT, (err) => {
  if (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
  console.log(`Servidor corriendo en el puerto ${PORT}`);

  // Limpieza inicial al arrancar
  suspenderRecorridosVencidos();

  // Mantenimiento cada hora (60 min x 60 seg x 1000 ms)
  setInterval(() => {
    suspenderRecorridosVencidos();
  }, 60 * 60 * 1000);
});
