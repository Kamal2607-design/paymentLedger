const { UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require("sequelize");
const ERR = require("../constants/errorCodes");
const { errorResponse } = require("../utils/response");

const MYSQL_CHECK_CONSTRAINT_VIOLATED = 3819;

const notFoundHandler = (req, res) =>
  errorResponse(res, {
    code: 404,
    errCode: ERR.ROUTE_NOT_FOUND,
    errorMessage: `Route ${req.method} ${req.originalUrl} not found`,
  });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.name === "AppError") {
    return errorResponse(res, {
      code: err.statusCode,
      errCode: err.errCode,
      errorMessage: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  // Malformed JSON from express.json()
  if (err.type === "entity.parse.failed") {
    return errorResponse(res, {
      code: 400,
      errCode: ERR.INVALID_REQUEST_BODY,
      errorMessage: "Malformed JSON in request body",
    });
  }
  if (err.type === "entity.too.large") {
    return errorResponse(res, {
      code: 413,
      errCode: ERR.INVALID_REQUEST_BODY,
      errorMessage: "Request body is too large",
    });
  }

  if (err instanceof UniqueConstraintError) {
    return errorResponse(res, {
      code: 409,
      errCode: ERR.DUPLICATE_TRANSACTION,
      errorMessage: "A record with the same unique reference already exists",
    });
  }
  if (err instanceof ForeignKeyConstraintError) {
    return errorResponse(res, {
      code: 404,
      errCode: ERR.ACCOUNT_NOT_FOUND,
      errorMessage: "Referenced account does not exist",
    });
  }
  if (err instanceof DatabaseError) {
    const original = err.original || {};
    if (original.errno === MYSQL_CHECK_CONSTRAINT_VIOLATED) {
      return errorResponse(res, {
        code: 422,
        errCode: ERR.INSUFFICIENT_BALANCE,
        errorMessage: "Operation rejected by ledger constraints (balance cannot go negative)",
      });
    }
    if (original.sqlState === "45000" && /LEDGER_IMMUTABLE/.test(original.sqlMessage || "")) {
      return errorResponse(res, {
        code: 405,
        errCode: ERR.TRANSACTION_IMMUTABLE,
        errorMessage: "Ledger records are immutable",
      });
    }
  }

  console.error("[unhandled error]", err);
  return errorResponse(res, {
    code: 500,
    errCode: ERR.INTERNAL_ERROR,
    errorMessage: "Something went wrong. Please try again later.",
  });
};

module.exports = { notFoundHandler, errorHandler };
