const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const blacklistedTokens= require('../utils/tokenBlacklist')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Token not found", 401));
    }

    const token = authHeader.split(" ")[1];

    if(blacklistedTokens.includes(token)){
      throw new AppError("Token has been logged out", 401);
    }

    // ❌ Invalid token → will throw JsonWebTokenError
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    

    next();
  } catch (err) {
    next(err); 
  }
};

module.exports = authMiddleware;