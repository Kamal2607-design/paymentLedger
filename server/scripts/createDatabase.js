/**
 * Creates the configured MySQL database if it does not exist.
 * Usage: node scripts/createDatabase.js [--test]
 */
const mysql = require("mysql2/promise");
const configs = require("../src/config/config");

const createDatabase = async (env = process.env.NODE_ENV || "development") => {
  const { host, port, username, password, database } = configs[env];
  const connection = await mysql.createConnection({ host, port, user: username, password: password || "" });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, "")}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    const [[{ version }]] = await connection.query("SELECT VERSION() AS version");
    return { database, version };
  } finally {
    await connection.end();
  }
};

if (require.main === module) {
  const env = process.argv.includes("--test") ? "test" : process.env.NODE_ENV || "development";
  createDatabase(env)
    .then(({ database, version }) => console.log(`[db] Database "${database}" is ready (MySQL ${version})`))
    .catch((error) => {
      console.error(`[db] Could not create database: ${error.message}`);
      process.exit(1);
    });
}

module.exports = createDatabase;
