const { login, obtenerUsuarioActual, adminResetPasswordDirecto } = require('./auth.service');

const loginController = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'El usuario y la contraseña son requeridos',
      });
    }

    const datos = await login(username, password);

    res.status(200).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const obtenerUsuarioActualController = async (req, res, next) => {
  try {
    const usuario = await obtenerUsuarioActual(req.user.id);
    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    next(error);
  }
};


/**
 * Controlador para restablecer contraseña de admin directamente con username.
 * POST /auth/admin-reset
 * Flujo simplificado: username + nueva contraseña, sin tokens ni emails.
 */
const adminResetPasswordController = async (req, res, next) => {
  const inicio = Date.now();
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario y la nueva contraseña son requeridos',
      });
    }

    const resultado = await adminResetPasswordDirecto(username, password);

    console.log(`[Controller] Enviando respuesta... tiempo desde inicio: ${Date.now() - inicio}ms`);

    // Forzar headers para evitar cache y cerrar conexión inmediatamente
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Connection', 'close');

    // Enviar respuesta JSON
    res.status(200).json({
      success: true,
      message: resultado.mensaje,
      data: resultado.usuario
    });

    // Forzar flush si está disponible (compresión)
    if (res.flush) {
      res.flush();
      console.log(`[Controller] Respuesta flushed. Total: ${Date.now() - inicio}ms`);
    } else {
      console.log(`[Controller] Respuesta enviada. Total: ${Date.now() - inicio}ms`);
    }
  } catch (error) {
    console.log(`[Controller] Error capturado después de: ${Date.now() - inicio}ms`);
    next(error);
  }
};

module.exports = {
  loginController,
  obtenerUsuarioActualController,
  adminResetPasswordController
};
