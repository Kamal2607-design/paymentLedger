const express = require("express");
const asyncHandler = require("../../middlewares/asyncHandler");
const { validateRequest, requireJsonObjectBody } = require("../../middlewares/validateRequest");
const controller = require("../../controllers/transfer.controller");
const { createTransferRules, listTransfersRules } = require("./transfer.validation");

const router = express.Router();

router
  .route("/")
  .get(listTransfersRules, validateRequest, asyncHandler(controller.listTransfers))
  .post(requireJsonObjectBody, createTransferRules, validateRequest, asyncHandler(controller.createTransfer));

module.exports = router;
