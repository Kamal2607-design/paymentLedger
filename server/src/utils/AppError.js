class AppError extends Error {
  /**
   * @param {number} statusCode HTTP status
   * @param {string} errCode    Stable machine-readable code (see constants/errorCodes)
   * @param {string} message    Human-readable message
   * @param {object} [extra]    Optional { data, errors } merged into the response body
   */
  constructor(statusCode, errCode, message, extra = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errCode = errCode;
    this.data = extra.data;
    this.errors = extra.errors;
  }
}

module.exports = AppError;
