const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

const login = async (username, password) => {
  const result = await pool.query(
    'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
    [username]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const payload = {
    id: user.id,
    username: user.username,
    rol: user.rol,
    nombre: user.nombre,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    user: { id: user.id, username: user.username, rol: user.rol, nombre: user.nombre },
  };
};

module.exports = { login };
