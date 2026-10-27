const TransactionService = require("../services/transaction.service");
const AppError = require("../utils/AppError");
const ERR = require("../constants/errorCodes");
const { successResponse } = require("../utils/response");

const createTransaction = async (req, res) => {
  const { account_id, type, amount, description, reference_id } = req.body;
  const transaction = await TransactionService.createTransaction({
    account_id,
    type,
    amount,
    description,
    reference_id,
  });
  return successResponse(res, transaction, 201, "Transaction created successfully");
};

const listTransactions = async (req, res) => {
  const result = await TransactionService.listTransactions(req.query);
  return successResponse(res, result);
};

const getTransaction = async (req, res) => {
  const transaction = await TransactionService.getTransactionById(req.params.id);
  return successResponse(res, transaction);
};

const rejectMutation = () => {
  throw new AppError(
    405,
    ERR.TRANSACTION_IMMUTABLE,
    "Transactions are immutable and cannot be edited or deleted. Post a reversing transaction instead.",
  );
};

module.exports = { createTransaction, listTransactions, getTransaction, rejectMutation };
