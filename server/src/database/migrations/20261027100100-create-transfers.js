"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transfers", {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      from_account_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: "accounts", key: "id" },
        onUpdate: "RESTRICT",
        onDelete: "RESTRICT",
      },
      to_account_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: "accounts", key: "id" },
        onUpdate: "RESTRICT",
        onDelete: "RESTRICT",
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
      created_at: {
        type: Sequelize.DATE(3),
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(3)"),
      },
    });

    await queryInterface.addConstraint("transfers", {
      fields: ["from_account_id", "reference_id"],
      type: "unique",
      name: "uq_transfers_from_account_reference",
    });
    await queryInterface.addIndex("transfers", ["to_account_id"], {
      name: "idx_transfers_to_account",
    });
    await queryInterface.addIndex("transfers", ["created_at"], {
      name: "idx_transfers_created_at",
    });

    await queryInterface.sequelize.query(
      "ALTER TABLE transfers ADD CONSTRAINT chk_transfers_amount_positive CHECK (amount > 0)",
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE transfers ADD CONSTRAINT chk_transfers_distinct_accounts CHECK (from_account_id <> to_account_id)",
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("transfers");
  },
};
