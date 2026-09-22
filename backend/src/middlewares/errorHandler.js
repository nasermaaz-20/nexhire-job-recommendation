export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const code = err.code || (status === 400 ? "VALIDATION_ERROR" : "INTERNAL_ERROR");

  return res.status(status).json({
    success: false,
    error: {
      code,
      message: err.message || "Internal server error",
      details: err.details || null
    }
  });
}

