// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;
