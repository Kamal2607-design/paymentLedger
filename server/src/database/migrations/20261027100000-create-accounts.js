"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("accounts", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      balance: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE(3),
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)"),
      },
      updated_at: {
        type: Sequelize.DATE(3),
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)"),
      },
    });

    await queryInterface.addIndex("accounts", ["name"], {
      name: "idx_accounts_name",
    });
    await queryInterface.addIndex("accounts", ["created_at"], {
      name: "idx_accounts_created_at",
    });

    // Enforced by MySQL 8.0.16+; the service layer also guards against overdrafts.
    await queryInterface.sequelize.query(
      "ALTER TABLE accounts ADD CONSTRAINT chk_accounts_balance_non_negative CHECK (balance >= 0)",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("accounts");
  },
};
