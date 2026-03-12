import bookingService from "../services/bookingService.js";
import { AppError } from "../utils/errors.js";
import { getValidatedData } from "../middleware/validation/commonValidation.js";

class BookingController {
  async createBooking(req, res) {
    try {
      const bookingPayload = getValidatedData(req, ["body"]);
      const booking = await bookingService.createBooking(
        bookingPayload,
        req.get("Idempotency-Key"),
      );

      return res.status(201).json(booking);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.status).json({
          error: error.error,
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "InternalServerError",
        message: "failed to create booking",
      });
    }
  }

  async getBookings(req, res) {
    try {
      const validated = getValidatedData(req, ["query"]);
      const filters = {
        limit: validated.limit ?? 50,
        offset: validated.offset ?? 0,
        roomId: validated.roomId,
        from: validated.from,
        to: validated.to,
      };

      const result = await bookingService.listBookings(filters);
      return res.json({
        items: result.items,
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error) {
      return res.status(500).json({
        error: "InternalServerError",
        message: "failed to list bookings",
      });
    }
  }

  async cancelBooking(req, res) {
    try {
      const { id: bookingId } = getValidatedData(req, ["params"]);
      const booking = await bookingService.cancelBooking(bookingId);
      return res.json(booking);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.status).json({
          error: error.error,
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "InternalServerError",
        message: "failed to cancel booking",
      });
    }
  }
}

export default new BookingController();
