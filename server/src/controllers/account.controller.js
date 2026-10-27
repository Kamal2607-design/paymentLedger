const AccountService = require("../services/account.service");
const TransactionService = require("../services/transaction.service");
const { successResponse } = require("../utils/response");

const createAccount = async (req, res) => {
  const account = await AccountService.createAccount({ name: req.body.name });
  return successResponse(res, account, 201, "Account created successfully");
};

const listAccounts = async (req, res) => {
  const result = await AccountService.listAccounts(req.query);
  return successResponse(res, result);
};

const getAccount = async (req, res) => {
  const account = await AccountService.getAccountDetails(req.params.accountId);
  return successResponse(res, account);
};

const getAccountBalance = async (req, res) => {
  const balance = await AccountService.getBalance(req.params.accountId);
  return successResponse(res, balance);
};

const getAccountTransactions = async (req, res) => {
  const result = await TransactionService.getAccountTransactions(req.params.accountId, req.query);
  return successResponse(res, result);
};

module.exports = {
  createAccount,
  listAccounts,
  getAccount,
  getAccountBalance,
  getAccountTransactions,
};
