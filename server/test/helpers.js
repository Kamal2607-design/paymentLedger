const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../src/models");

const api = () => request(app);

/** TRUNCATE bypasses the immutability triggers (they only fire on UPDATE/DELETE). */
const resetDatabase = () =>
  sequelize.transaction(async (t) => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction: t });
    for (const table of ["transactions", "transfers", "accounts"]) {
      await sequelize.query(`TRUNCATE TABLE ${table}`, { transaction: t });
    }
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction: t });
  });

const createAccount = async (name = "Test User") => {
  const res = await api().post("/api/accounts").send({ name });
  return res.body.data;
};

let refCounter = 0;
const postTransaction = (account_id, type, amount, overrides = {}) =>
  api()
    .post("/api/transactions")
    .send({ account_id, type, amount, description: `${type} ${amount}`, reference_id: `REF-${++refCounter}`, ...overrides });

const getBalance = async (id) => (await api().get(`/api/accounts/${id}/balance`)).body.data.balance;

module.exports = { api, sequelize, resetDatabase, createAccount, postTransaction, getBalance };
