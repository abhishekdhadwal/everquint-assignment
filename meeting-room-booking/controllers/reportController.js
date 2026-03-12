import reportService from "../services/reportService.js";
import { getValidatedData } from "../middleware/validation/commonValidation.js";

class ReportController {
  async getRoomUtilization(req, res) {
    try {
      const { from, to } = getValidatedData(req, ["query"]);
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
