import crypto from "crypto";
import { Op } from "sequelize";
import { Booking, IdempotencyRecord } from "../models/index.js";
import { rangesOverlap } from "../utils/timeUtils.js";

class BookingRepository {
  async create(bookingData, options = {}) {
    return Booking.create(bookingData, options);
  }

  async findById(id, options = {}) {
    return Booking.findByPk(id, options);
  }

  async findOverlappingConfirmed(roomId, startTime, endTime, options = {}) {
    const candidates = await Booking.findAll({
      ...options,
      where: {
        roomId,
        status: "confirmed",
        startTime: { [Op.lt]: new Date(endTime) },
        endTime: { [Op.gt]: new Date(startTime) },
      },
    });

    return candidates.filter((booking) =>
      rangesOverlap(
        new Date(startTime),
        new Date(endTime),
        new Date(booking.startTime),
        new Date(booking.endTime),
      ),
    );
  }

  async list(filters = {}) {
    const where = {};

    if (filters.roomId !== undefined) {
      where.roomId = filters.roomId;
    }

    if (filters.from || filters.to) {
      const clauses = [];

      if (filters.from && filters.to) {
        clauses.push(
          { startTime: { [Op.lt]: new Date(filters.to) } },
          { endTime: { [Op.gt]: new Date(filters.from) } },
        );
      } else if (filters.from) {
        clauses.push({ endTime: { [Op.gt]: new Date(filters.from) } });
      } else {
        clauses.push({ startTime: { [Op.lt]: new Date(filters.to) } });
      }

      where[Op.and] = clauses;
    }

    const result = await Booking.findAndCountAll({
      where,
      order: [["startTime", "ASC"]],
      limit: filters.limit,
      offset: filters.offset,
    });

    return {
      total: result.count,
      items: result.rows,
    };
  }

  async update(id, patch, options = {}) {
    const booking = await Booking.findByPk(id, options);
    if (!booking) {
      return null;
    }

    return booking.update(patch, options);
  }

  async findIdempotencyRecord(key, options = {}) {
    return IdempotencyRecord.findByPk(key, options);
  }

  async saveIdempotencyRecord(key, payload, bookingId, options = {}) {
    return IdempotencyRecord.create(
      {
        key,
        bookingId,
        fingerprint: this.buildFingerprint(payload),
      },
      options,
    );
  }

  buildFingerprint(payload) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");
  }
}

export default new BookingRepository();
