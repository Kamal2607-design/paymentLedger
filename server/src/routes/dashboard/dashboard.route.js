const express = require("express");
const { query } = require("express-validator");
const asyncHandler = require("../../middlewares/asyncHandler");
const { validateRequest } = require("../../middlewares/validateRequest");
const controller = require("../../controllers/dashboard.controller");

const router = express.Router();

router.get(
  "/summary",
  query("tz_offset")
    .optional()
    .isInt({ min: -840, max: 840 })
    .withMessage("tz_offset must be minutes east of UTC between -840 and 840")
    .toInt(),
  validateRequest,
  asyncHandler(controller.getSummary),
);

module.exports = router;
