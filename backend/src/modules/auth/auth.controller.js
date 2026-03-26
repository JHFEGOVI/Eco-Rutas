const { login } = require('./auth.service');

const loginController = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos',
      });
    }

    const data = await login(username, password);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginController };
