import express from "express";
import bookingController from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.post("/:id/cancel", bookingController.cancelBooking);

export default router;
