const successResponse = (res, data, code = 200, message) =>
  res.status(code).json({
    success: true,
    code,
    ...(message ? { message } : {}),
    data,
  });

const errorResponse = (res, { code = 500, errCode, errorMessage, errors, data }) =>
  res.status(code).json({
    success: false,
    code,
    errCode,
    errorMessage,
    ...(errors ? { errors } : {}),
    ...(data !== undefined ? { data } : {}),
  });

module.exports = { successResponse, errorResponse };
