const { Router } = require('express');
const { loginController } = require('./auth.controller');

const router = Router();

router.post('/login', loginController);

module.exports = router;
