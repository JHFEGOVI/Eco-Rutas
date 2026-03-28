const roles = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para esta acción',
      });
    }
    next();
  };
};

module.exports = roles;
