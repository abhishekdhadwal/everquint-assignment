import { UniqueConstraintError } from "sequelize";
import bookingRepository from "../repositories/bookingRepository.js";
import roomRepository from "../repositories/roomRepository.js";
import { sequelize } from "../config/database.js";
import {
  conflictError,
  notFoundError,
  validationError,
} from "../utils/errors.js";
import { getBusinessMinutesInRange, getOverlapMinutes } from "../utils/timeUtils.js";

class BookingService {
  async createBooking(bookingData, idempotencyKey) {
    try {
      return await sequelize.transaction(async (transaction) => {
        const room = await roomRepository.findById(bookingData.roomId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!room) {
          throw notFoundError("room not found");
        }

        if (idempotencyKey) {
          const existingRecord = await bookingRepository.findIdempotencyRecord(
            idempotencyKey,
            { transaction },
          );

          if (existingRecord) {
            const fingerprint = bookingRepository.buildFingerprint(bookingData);
            if (existingRecord.fingerprint !== fingerprint) {
              throw conflictError(
                "idempotency key has already been used with a different request payload",
              );
            }

            return bookingRepository.findById(existingRecord.bookingId, { transaction });
          }
        }

        const overlaps = await bookingRepository.findOverlappingConfirmed(
          bookingData.roomId,
          bookingData.startTime,
          bookingData.endTime,
          { transaction, lock: transaction.LOCK.UPDATE },
        );

        if (overlaps.length > 0) {
          throw conflictError("room already has a confirmed booking in that time range");
        }

        const booking = await bookingRepository.create(
          {
            ...bookingData,
            status: "confirmed",
          },
          { transaction },
        );

        if (idempotencyKey) {
          await bookingRepository.saveIdempotencyRecord(
            idempotencyKey,
            bookingData,
            booking.id,
            { transaction },
          );
        }

        return booking;
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw conflictError("idempotency key has already been used");
      }

      throw error;
    }
  }

  async listBookings(filters) {
    return bookingRepository.list(filters);
  }

  async cancelBooking(bookingId) {
    return sequelize.transaction(async (transaction) => {
      const booking = await bookingRepository.findById(bookingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!booking) {
        throw notFoundError("booking not found");
      }

      if (booking.status === "cancelled") {
        return booking;
      }

      const cancellationDeadline =
        new Date(booking.startTime).getTime() - 60 * 60 * 1000;
      if (Date.now() > cancellationDeadline) {
        throw validationError(
          "booking can only be cancelled up to 1 hour before startTime",
        );
      }

      return bookingRepository.update(
        bookingId,
        {
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
        },
        { transaction },
      );
    });
  }

  async buildUtilizationReport(from, to, rooms) {
    const { items: bookings } = await bookingRepository.list({
      from,
      to,
      limit: 1000,
      offset: 0,
    });
    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed",
    );
    const totalBusinessMinutes = getBusinessMinutesInRange(from, to);

    return rooms.map((room) => {
      const totalMinutes = confirmedBookings
        .filter((booking) => booking.roomId === room.id)
        .reduce((sum, booking) => {
          return (
            sum +
            getOverlapMinutes(
              new Date(booking.startTime),
              new Date(booking.endTime),
              new Date(from),
              new Date(to),
            )
          );
        }, 0);

      return {
        roomId: room.id,
        roomName: room.name,
        totalBookingHours: Number((totalMinutes / 60).toFixed(2)),
        utilizationPercent:
          totalBusinessMinutes === 0
            ? 0
            : Number((totalMinutes / totalBusinessMinutes).toFixed(4)),
      };
    });
  }
}

export default new BookingService();
