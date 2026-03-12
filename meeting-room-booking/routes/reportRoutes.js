import express from "express";
import reportController from "../controllers/reportController.js";

const router = express.Router();

router.get("/room-utilization", reportController.getRoomUtilization);

export default router;
