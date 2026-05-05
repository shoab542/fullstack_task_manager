const AppError = require("../utils/AppError");
const log = require('../utils/logger')

const handleJWTError = () =>
  new AppError("Invalid token. Please login again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please login again.", 401);

const errorHandler = (err, req, res, next) => {
  log(`${err.message} | ${req.method} ${req.originalUrl}`);
  let error = err; 

  // JWT errors
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // MySQL errors
  if (err.code === "ER_DUP_ENTRY") {
    error = new AppError("Duplicate field value", 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    status: error.status || "error",
    message: error.message || "Something went wrong",
  });
};

module.exports = errorHandler;