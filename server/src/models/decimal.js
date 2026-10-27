const { DataTypes } = require("sequelize");

/** mysql2 returns BIGINT and DECIMAL as strings; expose them as JS numbers. */
const numberGetter = (field) =>
  function get() {
    const raw = this.getDataValue(field);
    return raw === null || raw === undefined ? raw : Number(raw);
  };

/** DECIMAL(18,2) money column; 2-decimal values are exact as numbers well beyond our limits. */
const moneyColumn = (field, options = {}) => ({
  type: DataTypes.DECIMAL(18, 2),
  ...options,
  get: numberGetter(field),
});

module.exports = { moneyColumn, numberGetter };
