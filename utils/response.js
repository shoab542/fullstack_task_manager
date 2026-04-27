exports.successResponse = (res, data = null, message = "Success") => {
    res.json({
      success: true,
      data,
      message,
    });
  };
  
  exports.errorResponse = (res, message = "Error", status = 500) => {
    res.status(status).json({
      success: false,
      data: null,
      message,
    });
  };