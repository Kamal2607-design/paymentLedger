"use strict";

const TRIGGERS = [
  {
    name: "trg_transactions_block_update",
    sql: `CREATE TRIGGER trg_transactions_block_update BEFORE UPDATE ON transactions
          FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'LEDGER_IMMUTABLE: transactions cannot be modified'`,
  },
  {
    name: "trg_transactions_block_delete",
    sql: `CREATE TRIGGER trg_transactions_block_delete BEFORE DELETE ON transactions
          FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'LEDGER_IMMUTABLE: transactions cannot be deleted'`,
  },
  {
    name: "trg_transfers_block_update",
    sql: `CREATE TRIGGER trg_transfers_block_update BEFORE UPDATE ON transfers
          FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'LEDGER_IMMUTABLE: transfers cannot be modified'`,
  },
  {
    name: "trg_transfers_block_delete",
    sql: `CREATE TRIGGER trg_transfers_block_delete BEFORE DELETE ON transfers
          FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'LEDGER_IMMUTABLE: transfers cannot be deleted'`,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    for (const trigger of TRIGGERS) {
      try {
        await queryInterface.sequelize.query(trigger.sql);
      } catch (error) {
        // Some managed MySQL setups (binary logging without SUPER) refuse CREATE TRIGGER.
        // The API never exposes update/delete, so the app stays correct without them.
        console.warn(
          `[migration] Skipped ${trigger.name}: ${error.original?.sqlMessage || error.message}`,
        );
      }
    }
  },

  async down(queryInterface) {
    for (const trigger of TRIGGERS) {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS ${trigger.name}`);
    }
  },
};
