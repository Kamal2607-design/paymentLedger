const { DataTypes } = require("sequelize");
const { moneyColumn, numberGetter } = require("./decimal");

module.exports = (sequelize) =>
  sequelize.define(
    "Account",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        get: numberGetter("id"),
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [1, 100] },
      },
      balance: moneyColumn("balance", { allowNull: false, defaultValue: 0 }),
      created_at: { type: DataTypes.DATE(3) },
      updated_at: { type: DataTypes.DATE(3) },
    },
    {
      tableName: "accounts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
