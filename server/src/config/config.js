const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "payment_ledger",
  DB_NAME_TEST,
} = process.env;

const base = {
  username: DB_USER,
  password: DB_PASSWORD || null,
  database: DB_NAME,
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "mysql",
  timezone: "+00:00",
  logging: false,
  define: {
    underscored: true,
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

module.exports = {
  development: base,
  production: base,
  test: {
    ...base,
    database: DB_NAME_TEST || `${DB_NAME}_test`,
  },
};
