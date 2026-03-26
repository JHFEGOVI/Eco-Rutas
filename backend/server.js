require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
