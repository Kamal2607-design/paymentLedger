const { Op, fn, col } = require("sequelize");
const { Account, Transaction } = require("../models");
const AppError = require("../utils/AppError");
const ERR = require("../constants/errorCodes");
const { parsePagination, buildPagination } = require("../utils/pagination");

const accountNotFound = (id) =>
  new AppError(404, ERR.ACCOUNT_NOT_FOUND, `Account with id ${id} does not exist`);

const getAccountOrThrow = async (id, options = {}) => {
  const account = await Account.findByPk(id, options);
  if (!account) throw accountNotFound(id);
  return account;
};

const createAccount = async ({ name }) => {
  // balance always starts at 0 (DB default); clients cannot set it.
  const account = await Account.create({ name: name.trim() });
  await account.reload();
  return account;
};

const listAccounts = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const search = query.search?.trim();

  const where = {};
  if (search) {
    where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    if (/^\d+$/.test(search)) where[Op.or].push({ id: Number(search) });
  }

  const { rows, count } = await Account.findAndCountAll({
    where,
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
    limit,
    offset,
  });

  return {
    accounts: rows,
    pagination: buildPagination({ page, limit, total: count }),
  };
};

const getAccountStats = async (accountId) => {
  const rows = await Transaction.findAll({
    attributes: [
      "type",
      [fn("COUNT", col("id")), "count"],
      [fn("COALESCE", fn("SUM", col("amount")), 0), "total"],
      [fn("MAX", col("created_at")), "last_at"],
    ],
    where: { account_id: accountId },
    group: ["type"],
    raw: true,
  });

  const stats = {
    total_credit: 0,
    total_debit: 0,
    credit_count: 0,
    debit_count: 0,
    transaction_count: 0,
    last_transaction_at: null,
  };

  for (const row of rows) {
    stats[`total_${row.type}`] = Number(row.total);
    stats[`${row.type}_count`] = Number(row.count);
    stats.transaction_count += Number(row.count);
    if (!stats.last_transaction_at || new Date(row.last_at) > new Date(stats.last_transaction_at)) {
      stats.last_transaction_at = row.last_at;
    }
  }
  return stats;
};

const getAccountDetails = async (id) => {
  const account = await getAccountOrThrow(id);
  const stats = await getAccountStats(account.id);
  return { ...account.toJSON(), stats };
};

const getBalance = async (id) => {
  const account = await getAccountOrThrow(id, { attributes: ["id", "name", "balance"] });
  return {
    account_id: account.id,
    name: account.name,
    balance: account.balance,
  };
};

module.exports = {
  accountNotFound,
  getAccountOrThrow,
  createAccount,
  listAccounts,
  getAccountDetails,
  getBalance,
};
