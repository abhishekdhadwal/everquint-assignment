import express from "express";
import reportController from "../controllers/reportController.js";
import { reportValidators } from "../middleware/validation/reportValidation.js";
import { handleValidationResult } from "../middleware/validation/commonValidation.js";

const router = express.Router();

router.get(
  "/room-utilization",
  reportValidators,
  handleValidationResult,
  reportController.getRoomUtilization,
);

export default router;
