class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
  
      this.statusCode = statusCode; // ✅ number
      this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error"; // ✅ string
  
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;