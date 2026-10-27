const { fn, col, QueryTypes } = require("sequelize");
const { sequelize, Account, Transaction, Transfer } = require("../models");

const VOLUME_DAYS = 14;

/**
 * Daily credit/debit totals for the last VOLUME_DAYS days, bucketed in the
 * caller's timezone (offset in minutes east of UTC, e.g. 330 for IST).
 */
const getDailyVolume = async (tzOffsetMinutes) => {
  const rows = await sequelize.query(
    `SELECT DATE(DATE_ADD(created_at, INTERVAL :offset MINUTE)) AS day,
            type,
            SUM(amount) AS total,
            COUNT(*) AS count
       FROM transactions
      WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL :days DAY)
      GROUP BY day, type
      ORDER BY day ASC`,
    {
      replacements: { offset: tzOffsetMinutes, days: VOLUME_DAYS },
      type: QueryTypes.SELECT,
    },
  );

  const byDay = new Map();
  const today = new Date(Date.now() + tzOffsetMinutes * 60_000);
  for (let i = VOLUME_DAYS - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { date: key, credit: 0, debit: 0, credit_count: 0, debit_count: 0 });
  }

  for (const row of rows) {
    const key =
      row.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row.day).slice(0, 10);
    const bucket = byDay.get(key);
    if (!bucket) continue;
    bucket[row.type] = Number(row.total);
    bucket[`${row.type}_count`] = Number(row.count);
  }

  return [...byDay.values()];
};

const getSummary = async ({ tzOffsetMinutes = 0 } = {}) => {
  const [totalAccounts, totalBalance, totalsByType, transferCount, recent, topAccounts, dailyVolume] =
    await Promise.all([
      Account.count(),
      Account.sum("balance"),
      Transaction.findAll({
        attributes: ["type", [fn("COUNT", col("id")), "count"], [fn("SUM", col("amount")), "total"]],
        group: ["type"],
        raw: true,
      }),
      Transfer.count(),
      Transaction.findAll({
        include: [{ model: Account, as: "account", attributes: ["id", "name"] }],
        order: [
          ["created_at", "DESC"],
          ["id", "DESC"],
        ],
        limit: 8,
      }),
      Account.findAll({
        order: [
          ["balance", "DESC"],
          ["id", "ASC"],
        ],
        limit: 5,
      }),
      getDailyVolume(tzOffsetMinutes),
    ]);

  const totals = { credit: { count: 0, total: 0 }, debit: { count: 0, total: 0 } };
  for (const row of totalsByType) {
    totals[row.type] = { count: Number(row.count), total: Number(row.total) };
  }

  return {
    total_accounts: totalAccounts,
    total_balance: Number(totalBalance || 0),
    total_credit: totals.credit.total,
    total_debit: totals.debit.total,
    credit_count: totals.credit.count,
    debit_count: totals.debit.count,
    transaction_count: totals.credit.count + totals.debit.count,
    transfer_count: transferCount,
    recent_transactions: recent,
    top_accounts: topAccounts,
    daily_volume: dailyVolume,
  };
};

module.exports = { getSummary };
