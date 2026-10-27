const TransferService = require("../services/transfer.service");
const { successResponse } = require("../utils/response");

const createTransfer = async (req, res) => {
  const { from_account_id, to_account_id, amount, description, reference_id } = req.body;
  const transfer = await TransferService.createTransfer({
    from_account_id,
    to_account_id,
    amount,
    description,
    reference_id,
  });
  return successResponse(res, transfer, 201, "Transfer completed successfully");
};

const listTransfers = async (req, res) => {
  const result = await TransferService.listTransfers(req.query);
  return successResponse(res, result);
};

module.exports = { createTransfer, listTransfers };
