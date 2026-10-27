require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const app = require("./app");
const { sequelize } = require("./src/models");

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error(
      `\n[ledger-api] Cannot connect to MySQL: ${error.message}\n` +
        "Check DB_* values in server/.env and make sure MySQL is running.\n",
    );
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[ledger-api] Listening on http://localhost:${PORT}/api`);
  });

  const shutdown = () => {
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start();
