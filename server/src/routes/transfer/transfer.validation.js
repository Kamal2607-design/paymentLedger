const { query } = require("express-validator");
const {
  idBody,
  amountBody,
  referenceIdBody,
  descriptionBody,
  forbiddenBody,
  paginationQuery,
} = require("../common.validation");

const createTransferRules = [
  ...forbiddenBody(["id", "created_at"]),
  idBody("from_account_id"),
  idBody("to_account_id"),
  amountBody("amount"),
  descriptionBody(),
  referenceIdBody(),
];

const listTransfersRules = [
  query("account_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Invalid account_id: must be a positive integer")
    .toInt(),
  ...paginationQuery(),
];

module.exports = { createTransferRules, listTransfersRules };
