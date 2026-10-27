const { body, query } = require("express-validator");
const {
  idParam,
  idBody,
  amountBody,
  referenceIdBody,
  descriptionBody,
  forbiddenBody,
  paginationQuery,
  typeQuery,
  searchQuery,
} = require("../common.validation");

const createTransactionRules = [
  ...forbiddenBody(["id", "created_at", "balance_after", "transfer_id"]),
  idBody("account_id"),
  body("type")
    .exists({ values: "null" })
    .withMessage("type is required")
    .bail()
    .isString()
    .withMessage('type must be either "credit" or "debit"')
    .bail()
    .trim()
    .toLowerCase()
    .isIn(["credit", "debit"])
    .withMessage('type must be either "credit" or "debit"'),
  amountBody("amount"),
  descriptionBody(),
  referenceIdBody({ reservedPrefix: "TRF-" }),
];

const listTransactionsRules = [
  typeQuery(),
  query("account_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Invalid account_id: must be a positive integer")
    .toInt(),
  searchQuery(),
  ...paginationQuery(),
];

const transactionIdRules = [idParam("id", "transaction id")];

module.exports = { createTransactionRules, listTransactionsRules, transactionIdRules };
