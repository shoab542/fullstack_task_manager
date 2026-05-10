const AppError = require("../utils/AppError");
const log = require("../utils/logger");

const handleJWTError = () =>
  new AppError("Invalid token. Please login again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please login again.", 401);

const errorHandler = (err, req, res, next) => {
  // 📝 Log error
  log(`${err.message} | ${req.method} ${req.originalUrl}`);

  let error = err;

  // 🔐 JWT errors
  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  // 🗄 MySQL duplicate error
  if (err.code === "ER_DUP_ENTRY") {
    error = new AppError("Duplicate field value", 400);
  }

  // ✅ Convert unknown errors to AppError
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );
  }

  // 🚀 Development response
  if (process.env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: err.stack,
    });
  }

  // 🔒 Production response
  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
  });
};

module.exports = errorHandler;