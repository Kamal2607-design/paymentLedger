const express = require("express");
const asyncHandler = require("../../middlewares/asyncHandler");
const { validateRequest, requireJsonObjectBody } = require("../../middlewares/validateRequest");
const controller = require("../../controllers/transaction.controller");
const {
  createTransactionRules,
  listTransactionsRules,
  transactionIdRules,
} = require("./transaction.validation");

const router = express.Router();

router
  .route("/")
  .get(listTransactionsRules, validateRequest, asyncHandler(controller.listTransactions))
  .post(requireJsonObjectBody, createTransactionRules, validateRequest, asyncHandler(controller.createTransaction));

router
  .route("/:id")
  .get(transactionIdRules, validateRequest, asyncHandler(controller.getTransaction))
  .put(asyncHandler(controller.rejectMutation))
  .patch(asyncHandler(controller.rejectMutation))
  .delete(asyncHandler(controller.rejectMutation));

module.exports = router;
