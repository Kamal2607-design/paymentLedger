const { DataTypes } = require("sequelize");
const { moneyColumn, numberGetter } = require("./decimal");

module.exports = (sequelize) =>
  sequelize.define(
    "Transfer",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        get: numberGetter("id"),
      },
      from_account_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        get: numberGetter("from_account_id"),
      },
      to_account_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        get: numberGetter("to_account_id"),
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
      created_at: { type: DataTypes.DATE(3) },
    },
    {
      tableName: "transfers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
