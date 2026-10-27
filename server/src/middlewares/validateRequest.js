const { validationResult } = require("express-validator");
const ERR = require("../constants/errorCodes");
const { errorResponse } = require("../utils/response");

// Field-specific codes so clients can branch on the kind of validation failure.
const FIELD_ERROR_CODES = {
  amount: ERR.INVALID_AMOUNT,
  type: ERR.INVALID_TRANSACTION_TYPE,
  page: ERR.INVALID_PAGINATION,
  limit: ERR.INVALID_PAGINATION,
  accountId: ERR.INVALID_ACCOUNT_ID,
  account_id: ERR.INVALID_ACCOUNT_ID,
  from_account_id: ERR.INVALID_ACCOUNT_ID,
  to_account_id: ERR.INVALID_ACCOUNT_ID,
};

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    location: e.location,
    message: e.msg,
  }));
  const first = errors[0];

  return errorResponse(res, {
    code: 400,
    errCode: FIELD_ERROR_CODES[first.field] || ERR.VALIDATION_ERROR,
    errorMessage: first.message,
    errors,
  });
};

/** Rejects missing, non-JSON or non-object bodies before field validation runs. */
const requireJsonObjectBody = (req, res, next) => {
  const body = req.body;
  if (!req.is("application/json") || !body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse(res, {
      code: 400,
      errCode: ERR.INVALID_REQUEST_BODY,
      errorMessage: "Request body must be a JSON object (Content-Type: application/json)",
    });
  }
  return next();
};

module.exports = { validateRequest, requireJsonObjectBody };
