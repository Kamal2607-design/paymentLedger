const { DataTypes } = require("sequelize");
const { moneyColumn, numberGetter } = require("./decimal");

module.exports = (sequelize) =>
  sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        get: numberGetter("id"),
      },
      account_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        get: numberGetter("account_id"),
      },
      type: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
      },
      amount: moneyColumn("amount", { allowNull: false }),
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      balance_after: moneyColumn("balance_after", { allowNull: false }),
      transfer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        get: numberGetter("transfer_id"),
      },
      created_at: { type: DataTypes.DATE(3) },
    },
    {
      tableName: "transactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
