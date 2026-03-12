import bookingService from "../services/bookingService.js";
import { AppError } from "../utils/errors.js";
import {
  normalizeBookingPayload,
  parsePagination,
  validateBookingPayload,
} from "../utils/validators.js";

class BookingController {
  async createBooking(req, res) {
    try {
      const validation = validateBookingPayload(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          error: "ValidationError",
          message: validation.message,
        });
      }

      const booking = await bookingService.createBooking(
        normalizeBookingPayload(req.body),
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
      const pagination = parsePagination(req.query);
      if (!pagination.valid) {
        return res.status(400).json({
          error: "ValidationError",
          message: pagination.message,
        });
      }

      const filters = {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
      };

      if (req.query.roomId !== undefined) {
        const roomId = Number.parseInt(req.query.roomId, 10);
        if (!Number.isInteger(roomId)) {
          return res.status(400).json({
            error: "ValidationError",
            message: "roomId must be an integer",
          });
        }
        filters.roomId = roomId;
      }

      if (req.query.from) {
        filters.from = req.query.from;
      }

      if (req.query.to) {
        filters.to = req.query.to;
      }

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
      const bookingId = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(bookingId)) {
        return res.status(400).json({
          error: "ValidationError",
          message: "booking id must be an integer",
        });
      }

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
