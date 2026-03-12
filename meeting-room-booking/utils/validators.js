import {
  getDurationMinutes,
  getLocalDateParts,
  isWithinBusinessHours,
} from "./timeUtils.js";

export function normalizeRoomPayload(payload) {
  return {
    name: typeof payload.name === "string" ? payload.name.trim() : payload.name,
    capacity: payload.capacity,
    floor: payload.floor,
    amenities: Array.isArray(payload.amenities)
      ? payload.amenities.map((item) => String(item).trim()).filter(Boolean)
      : payload.amenities,
  };
}

export function validateRoomPayload(payload) {
  const room = normalizeRoomPayload(payload);

  if (!room.name) {
    return { valid: false, message: "name is required" };
  }

  if (!Number.isInteger(room.capacity) || room.capacity < 1) {
    return { valid: false, message: "capacity must be an integer >= 1" };
  }

  if (!Number.isInteger(room.floor)) {
    return { valid: false, message: "floor must be an integer" };
  }

  if (!Array.isArray(room.amenities)) {
    return { valid: false, message: "amenities must be an array of strings" };
  }

  return { valid: true, value: room };
}

export function normalizeBookingPayload(payload) {
  return {
    roomId: payload.roomId,
    title: typeof payload.title === "string" ? payload.title.trim() : payload.title,
    organizerEmail:
      typeof payload.organizerEmail === "string"
        ? payload.organizerEmail.trim().toLowerCase()
        : payload.organizerEmail,
    startTime: payload.startTime,
    endTime: payload.endTime,
  };
}

export function validateBookingPayload(payload) {
  const booking = normalizeBookingPayload(payload);

  if (!Number.isInteger(booking.roomId)) {
    return { valid: false, message: "roomId must be an integer" };
  }

  if (!booking.title) {
    return { valid: false, message: "title is required" };
  }

  if (!validateEmail(booking.organizerEmail)) {
    return { valid: false, message: "organizerEmail must be a valid email" };
  }

  const start = getLocalDateParts(booking.startTime);
  const end = getLocalDateParts(booking.endTime);

  if (!start || !end) {
    return {
      valid: false,
      message: "startTime and endTime must be valid ISO-8601 timestamps with timezone",
    };
  }

  if (start.instant >= end.instant) {
    return { valid: false, message: "startTime must be before endTime" };
  }

  const durationMinutes = getDurationMinutes(booking.startTime, booking.endTime);
  if (durationMinutes < 15 || durationMinutes > 240) {
    return {
      valid: false,
      message: "booking duration must be between 15 minutes and 4 hours",
    };
  }

  if (!isWithinBusinessHours(booking.startTime, booking.endTime)) {
    return {
      valid: false,
      message: "bookings are only allowed Monday-Friday between 08:00 and 20:00 in the supplied local time",
    };
  }

  return { valid: true, value: booking };
}

export function parsePagination(query) {
  const limit =
    query.limit === undefined ? 50 : Number.parseInt(query.limit, 10);
  const offset =
    query.offset === undefined ? 0 : Number.parseInt(query.offset, 10);

  if (!Number.isInteger(limit) || limit < 1) {
    return { valid: false, message: "limit must be a positive integer" };
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return { valid: false, message: "offset must be an integer >= 0" };
  }

  return { valid: true, value: { limit, offset } };
}

export function validateReportRange(from, to) {
  const start = getLocalDateParts(from);
  const end = getLocalDateParts(to);

  if (!start || !end) {
    return {
      valid: false,
      message: "from and to must be valid ISO-8601 timestamps with timezone",
    };
  }

  if (start.offsetMinutes !== end.offsetMinutes) {
    return {
      valid: false,
      message: "from and to must use the same timezone offset",
    };
  }

  if (start.instant >= end.instant) {
    return { valid: false, message: "from must be before to" };
  }

  return { valid: true };
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}
