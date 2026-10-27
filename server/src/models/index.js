const { Sequelize } = require("sequelize");
const config = require("../config/config")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const Account = require("./account.model")(sequelize);
const Transaction = require("./transaction.model")(sequelize);
const Transfer = require("./transfer.model")(sequelize);

Account.hasMany(Transaction, { foreignKey: "account_id", as: "transactions" });
Transaction.belongsTo(Account, { foreignKey: "account_id", as: "account" });

Transfer.belongsTo(Account, { foreignKey: "from_account_id", as: "fromAccount" });
Transfer.belongsTo(Account, { foreignKey: "to_account_id", as: "toAccount" });
Transfer.hasMany(Transaction, { foreignKey: "transfer_id", as: "entries" });
Transaction.belongsTo(Transfer, { foreignKey: "transfer_id", as: "transfer" });

module.exports = { sequelize, Sequelize, Account, Transaction, Transfer };
