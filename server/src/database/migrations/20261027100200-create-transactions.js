"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transactions", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      account_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: "accounts", key: "id" },
        onUpdate: "RESTRICT",
        onDelete: "RESTRICT",
      },
      type: {
        type: Sequelize.ENUM("credit", "debit"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      reference_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      transfer_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: "transfers", key: "id" },
        onUpdate: "RESTRICT",
        onDelete: "RESTRICT",
      },
      created_at: {
        type: Sequelize.DATE(3),
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)"),
      },
    });

    await queryInterface.addConstraint("transactions", {
      fields: ["account_id", "reference_id"],
      type: "unique",
      name: "uq_transactions_account_reference",
    });
    // Covers history queries: WHERE account_id = ? [AND type = ?] ORDER BY created_at DESC
    await queryInterface.addIndex(
      "transactions",
      ["account_id", "type", "created_at"],
      { name: "idx_transactions_account_type_created" },
    );
    await queryInterface.addIndex("transactions", ["account_id", "created_at"], {
      name: "idx_transactions_account_created",
    });
    await queryInterface.addIndex("transactions", ["created_at"], {
      name: "idx_transactions_created_at",
    });

    await queryInterface.sequelize.query(
      "ALTER TABLE transactions ADD CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0)",
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE transactions ADD CONSTRAINT chk_transactions_balance_after_non_negative CHECK (balance_after >= 0)",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("transactions");
  },
};
