const express = require("express");
const { sequelize } = require("../models");
const { successResponse } = require("../utils/response");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

router.get(
  "/health",
  asyncHandler(async (req, res) => {
    await sequelize.authenticate();
    return successResponse(res, { status: "ok", database: "connected" });
  }),
);

router.use("/accounts", require("./account/account.route"));
router.use("/transactions", require("./transaction/transaction.route"));
router.use("/transfers", require("./transfer/transfer.route"));
router.use("/dashboard", require("./dashboard/dashboard.route"));

module.exports = router;
