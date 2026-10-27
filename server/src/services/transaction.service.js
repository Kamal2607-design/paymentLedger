const { Op, UniqueConstraintError } = require("sequelize");
const { sequelize, Account, Transaction } = require("../models");
const AppError = require("../utils/AppError");
const ERR = require("../constants/errorCodes");
const { toMinor, fromMinor, minorToDecimalString } = require("../utils/money");
const { parsePagination, buildPagination } = require("../utils/pagination");
const { accountNotFound, getAccountOrThrow } = require("./account.service");

const HISTORY_ORDER = [
  ["created_at", "DESC"],
  ["id", "DESC"],
];

const duplicateTransactionError = (existing) =>
  new AppError(
    409,
    ERR.DUPLICATE_TRANSACTION,
    `A transaction with reference_id "${existing.reference_id}" already exists for account ${existing.account_id}`,
    { data: existing },
  );

const insufficientBalanceError = (account, amountMinor) =>
  new AppError(
    422,
    ERR.INSUFFICIENT_BALANCE,
    `Insufficient balance: account ${account.id} has ${Number(account.balance).toFixed(2)}, debit requested ${fromMinor(amountMinor).toFixed(2)}`,
    {
      data: {
        account_id: account.id,
        balance: account.balance,
        requested_amount: fromMinor(amountMinor),
      },
    },
  );

/**
 * Posts one ledger entry against an account that is already row-locked
 * (SELECT ... FOR UPDATE) inside the caller's DB transaction.
 */
const postEntry = async (account, { type, amount, description, reference_id, transfer_id = null }, t) => {
  const amountMinor = toMinor(amount);
  const currentMinor = toMinor(account.balance);
  const nextMinor = type === "credit" ? currentMinor + amountMinor : currentMinor - amountMinor;

  if (nextMinor < 0) throw insufficientBalanceError(account, amountMinor);

  const entry = await Transaction.create(
    {
      account_id: account.id,
      type,
      amount: minorToDecimalString(amountMinor),
      description: description ?? null,
      reference_id,
      balance_after: minorToDecimalString(nextMinor),
      transfer_id,
    },
    { transaction: t },
  );

  await account.update({ balance: minorToDecimalString(nextMinor) }, { transaction: t });
  return entry;
};

const findByReference = (account_id, reference_id, options = {}) =>
  Transaction.findOne({ where: { account_id, reference_id }, ...options });

const createTransaction = async ({ account_id, type, amount, description, reference_id }) => {
  try {
    const entry = await sequelize.transaction(async (t) => {
      // Row lock serialises concurrent writes to the same account.
      const account = await Account.findByPk(account_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!account) throw accountNotFound(account_id);

      const existing = await findByReference(account_id, reference_id, { transaction: t });
      if (existing) throw duplicateTransactionError(existing);

      return postEntry(account, { type, amount, description, reference_id }, t);
    });
    await entry.reload();
    return entry;
  } catch (error) {
    // Safety net: the unique (account_id, reference_id) index wins any race.
    if (error instanceof UniqueConstraintError) {
      const existing = await findByReference(account_id, reference_id);
      if (existing) throw duplicateTransactionError(existing);
    }
    throw error;
  }
};

const getAccountTransactions = async (accountId, query) => {
  await getAccountOrThrow(accountId, { attributes: ["id"] });

  const { page, limit, offset } = parsePagination(query);
  const where = { account_id: accountId };
  if (query.type) where.type = query.type;

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    order: HISTORY_ORDER,
    limit,
    offset,
  });

  return {
    account_id: Number(accountId),
    filters: { type: query.type || null },
    transactions: rows,
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const listTransactions = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.type) where.type = query.type;
  if (query.account_id) where.account_id = Number(query.account_id);

  const search = query.search?.trim();
  if (search) {
    where[Op.or] = [
      { reference_id: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { "$account.name$": { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include: [{ model: Account, as: "account", attributes: ["id", "name"] }],
    order: HISTORY_ORDER,
    limit,
    offset,
    subQuery: false,
  });

  return {
    filters: { type: query.type || null, account_id: query.account_id ? Number(query.account_id) : null },
    transactions: rows,
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getTransactionById = async (id) => {
  const entry = await Transaction.findByPk(id, {
    include: [{ model: Account, as: "account", attributes: ["id", "name"] }],
  });
  if (!entry) {
    throw new AppError(404, ERR.TRANSACTION_NOT_FOUND, `Transaction with id ${id} does not exist`);
  }
  return entry;
};

module.exports = {
  postEntry,
  createTransaction,
  getAccountTransactions,
  listTransactions,
  getTransactionById,
};
