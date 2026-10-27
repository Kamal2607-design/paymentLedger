const DashboardService = require("../services/dashboard.service");
const { successResponse } = require("../utils/response");

const getSummary = async (req, res) => {
  const summary = await DashboardService.getSummary({
    tzOffsetMinutes: req.query.tz_offset ?? 0,
  });
  return successResponse(res, summary);
};

module.exports = { getSummary };
