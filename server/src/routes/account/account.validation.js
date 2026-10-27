const { body } = require("express-validator");
const { idParam, forbiddenBody, paginationQuery, typeQuery, searchQuery } = require("../common.validation");

const createAccountRules = [
  ...forbiddenBody(["id", "created_at", "updated_at"]),
  body("balance")
    .not()
    .exists()
    .withMessage("balance cannot be set by the client; new accounts always start with a balance of 0"),
  body("name")
    .exists({ values: "null" })
    .withMessage("name is required")
    .bail()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("name must be at most 100 characters"),
];

const listAccountsRules = [...paginationQuery(), searchQuery()];

const accountIdRules = [idParam("accountId", "account id")];

const accountTransactionsRules = [idParam("accountId", "account id"), typeQuery(), ...paginationQuery()];

module.exports = { createAccountRules, listAccountsRules, accountIdRules, accountTransactionsRules };
