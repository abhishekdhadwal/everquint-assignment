import express from "express";
import roomController from "../controllers/roomController.js";
import {
  createRoomValidators,
  roomListValidators,
} from "../middleware/validation/roomValidation.js";
import { handleValidationResult } from "../middleware/validation/commonValidation.js";

const router = express.Router();

router.post("/", createRoomValidators, handleValidationResult, roomController.createRoom);
router.get("/", roomListValidators, handleValidationResult, roomController.getRooms);

export default router;
