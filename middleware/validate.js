const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      allowUnknown: false,   // ❗ block extra fields
    });
  
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
  
    req.body = value; 
    next();
  };
  
  module.exports = validate;