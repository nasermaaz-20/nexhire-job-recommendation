export function validate(schema) {
  return (req, res, next) => {
    const options = { abortEarly: false, stripUnknown: true };
    const { error, value } = schema.validate(
      { body: req.body, params: req.params, query: req.query },
      options
    );

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.details.map((d) => ({
            field: d.path.join("."),
            message: d.message
          }))
        }
      });
    }

    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;
    return next();
  };
}

export const validateInDB = (validatorFn) => {
  return async (req, res, next) => {
    try {
      const errors = await validatorFn(req.body, req.user);

      if (errors && errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid data - some IDs do not exist in database",
            details: errors
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

