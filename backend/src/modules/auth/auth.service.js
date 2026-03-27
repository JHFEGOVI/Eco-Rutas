const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

const login = async (username, password) => {
  const resultado = await pool.query(
    'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
    [username]
  );

  const usuario = resultado.rows[0];

  if (!usuario) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);

  if (!coincide) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const carga = {
    id: usuario.id,
    username: usuario.username,
    rol: usuario.rol,
    nombre: usuario.nombre,
  };

  const token = jwt.sign(carga, process.env.JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    user: { id: usuario.id, username: usuario.username, rol: usuario.rol, nombre: usuario.nombre },
  };
};

module.exports = { login };
