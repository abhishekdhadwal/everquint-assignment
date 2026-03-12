import reportService from "../services/reportService.js";
import { validateReportRange } from "../utils/validators.js";

class ReportController {
  async getRoomUtilization(req, res) {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({
          error: "ValidationError",
          message: "from and to query parameters are required",
        });
      }

      const validation = validateReportRange(from, to);
      if (!validation.valid) {
        return res.status(400).json({
          error: "ValidationError",
          message: validation.message,
        });
      }

      const report = await reportService.generateUtilizationReport(from, to);
      return res.json(report);
    } catch (error) {
      return res.status(500).json({
        error: "InternalServerError",
        message: "failed to generate utilization report",
      });
    }
  }
}

export default new ReportController();
