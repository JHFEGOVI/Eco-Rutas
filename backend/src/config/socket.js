const { Server } = require('socket.io');

let io = null;

/**
 * Inicializa el servidor Socket.io sobre el servidor HTTP dado.
 * @param {import('http').Server} server - Servidor HTTP de Node.js
 */
const inicializarSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  console.log('Socket.io inicializado');
  return io;
};

/**
 * Emite un evento a todos los clientes conectados.
 * @param {string} evento - Nombre del evento
 * @param {object} datos - Datos a enviar
 */
const emitirEvento = (evento, datos) => {
  if (!io) {
    console.warn(`[Socket] No se pudo emitir "${evento}": Socket.io no inicializado`);
    return;
  }
  io.emit(evento, datos);
};

module.exports = { inicializarSocket, emitirEvento };
