const { Op, UniqueConstraintError } = require("sequelize");
const { sequelize, Account, Transfer, Transaction } = require("../models");
const AppError = require("../utils/AppError");
const ERR = require("../constants/errorCodes");
const { minorToDecimalString, toMinor } = require("../utils/money");
const { parsePagination, buildPagination } = require("../utils/pagination");
const { accountNotFound } = require("./account.service");
const { postEntry } = require("./transaction.service");

const TRANSFER_INCLUDE = [
  { model: Account, as: "fromAccount", attributes: ["id", "name"] },
  { model: Account, as: "toAccount", attributes: ["id", "name"] },
];

const duplicateTransferError = (existing) =>
  new AppError(
    409,
    ERR.DUPLICATE_TRANSFER,
    `A transfer with reference_id "${existing.reference_id}" already exists for account ${existing.from_account_id}`,
    { data: existing },
  );

const getTransferWithEntries = (id) =>
  Transfer.findByPk(id, {
    include: [...TRANSFER_INCLUDE, { model: Transaction, as: "entries" }],
  });

const createTransfer = async ({ from_account_id, to_account_id, amount, description, reference_id }) => {
  if (Number(from_account_id) === Number(to_account_id)) {
    throw new AppError(400, ERR.SAME_ACCOUNT_TRANSFER, "from_account_id and to_account_id must be different accounts");
  }

  try {
    const transferId = await sequelize.transaction(async (t) => {
      // Lock both rows in ascending id order so opposite-direction transfers cannot deadlock.
      const accounts = await Account.findAll({
        where: { id: [from_account_id, to_account_id] },
        order: [["id", "ASC"]],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });
      const source = accounts.find((a) => a.id === Number(from_account_id));
      const destination = accounts.find((a) => a.id === Number(to_account_id));
      if (!source) throw accountNotFound(from_account_id);
      if (!destination) throw accountNotFound(to_account_id);

      const existing = await Transfer.findOne({
        where: { from_account_id, reference_id },
        transaction: t,
      });
      if (existing) throw duplicateTransferError(existing);

      const transfer = await Transfer.create(
        {
          from_account_id,
          to_account_id,
          amount: minorToDecimalString(toMinor(amount)),
          description: description ?? null,
          reference_id,
        },
        { transaction: t },
      );

      // Any failure below (e.g. insufficient balance) rolls back the transfer row and both legs.
      await postEntry(
        source,
        {
          type: "debit",
          amount,
          description: description || `Transfer to account #${destination.id}`,
          reference_id: `TRF-${transfer.id}-OUT`,
          transfer_id: transfer.id,
        },
        t,
      );
      await postEntry(
        destination,
        {
          type: "credit",
          amount,
          description: description || `Transfer from account #${source.id}`,
          reference_id: `TRF-${transfer.id}-IN`,
          transfer_id: transfer.id,
        },
        t,
      );

      return transfer.id;
    });

    return getTransferWithEntries(transferId);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const existing = await Transfer.findOne({ where: { from_account_id, reference_id } });
      if (existing) throw duplicateTransferError(existing);
    }
    throw error;
  }
};

const listTransfers = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.account_id) {
    const id = Number(query.account_id);
    where[Op.or] = [{ from_account_id: id }, { to_account_id: id }];
  }

  const { rows, count } = await Transfer.findAndCountAll({
    where,
    include: TRANSFER_INCLUDE,
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
    limit,
    offset,
  });

  return {
    transfers: rows,
    pagination: buildPagination({ page, limit, total: count }),
  };
};

module.exports = { createTransfer, listTransfers };
