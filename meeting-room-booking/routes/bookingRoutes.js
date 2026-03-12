import express from "express";
import bookingController from "../controllers/bookingController.js";
import {
  bookingListValidators,
  cancelBookingValidators,
  createBookingValidators,
} from "../middleware/validation/bookingValidation.js";
import { handleValidationResult } from "../middleware/validation/commonValidation.js";

const router = express.Router();

router.post("/", createBookingValidators, handleValidationResult, bookingController.createBooking);
router.get("/", bookingListValidators, handleValidationResult, bookingController.getBookings);
router.post(
  "/:id/cancel",
  cancelBookingValidators,
  handleValidationResult,
  bookingController.cancelBooking,
);

export default router;
