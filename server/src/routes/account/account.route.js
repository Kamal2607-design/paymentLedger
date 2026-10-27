const express = require("express");
const asyncHandler = require("../../middlewares/asyncHandler");
const { validateRequest, requireJsonObjectBody } = require("../../middlewares/validateRequest");
const controller = require("../../controllers/account.controller");
const {
  createAccountRules,
  listAccountsRules,
  accountIdRules,
  accountTransactionsRules,
} = require("./account.validation");

const router = express.Router();

router
  .route("/")
  .get(listAccountsRules, validateRequest, asyncHandler(controller.listAccounts))
  .post(requireJsonObjectBody, createAccountRules, validateRequest, asyncHandler(controller.createAccount));

router.get("/:accountId", accountIdRules, validateRequest, asyncHandler(controller.getAccount));

router.get("/:accountId/balance", accountIdRules, validateRequest, asyncHandler(controller.getAccountBalance));

router.get(
  "/:accountId/transactions",
  accountTransactionsRules,
  validateRequest,
  asyncHandler(controller.getAccountTransactions),
);

module.exports = router;
