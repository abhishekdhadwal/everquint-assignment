import { body, param, query } from "express-validator";
import {
  getDurationMinutes,
  getLocalDateParts,
  isWithinBusinessHours,
} from "../../utils/timeUtils.js";

function withMessage(result, message) {
  if (!result) {
    throw new Error(message);
  }
  return true;
}

function validateIsoRange(startField, endField) {
  return body(endField).custom((endValue, { req }) => {
    const startValue = req.body[startField];
    const start = getLocalDateParts(startValue);
    const end = getLocalDateParts(endValue);

    withMessage(
      start && end,
      `${startField} and ${endField} must be valid ISO-8601 timestamps with timezone`,
    );
    withMessage(start.instant < end.instant, `${startField} must be before ${endField}`);

    const durationMinutes = getDurationMinutes(startValue, endValue);
    withMessage(
      durationMinutes >= 15 && durationMinutes <= 240,
      "booking duration must be between 15 minutes and 4 hours",
    );
    withMessage(
      isWithinBusinessHours(startValue, endValue),
      "bookings are only allowed Monday-Friday between 08:00 and 20:00 in the supplied local time",
    );

    return true;
  });
}

export const createBookingValidators = [
  body("roomId").isInt().withMessage("roomId must be an integer").toInt(),
  body("title").isString().trim().notEmpty().withMessage("title is required"),
  body("organizerEmail")
    .isEmail()
    .withMessage("organizerEmail must be a valid email")
    .normalizeEmail(),
  body("startTime").notEmpty(),
  body("endTime").notEmpty(),
  validateIsoRange("startTime", "endTime"),
];

export const bookingListValidators = [
  query("roomId").optional().isInt().withMessage("roomId must be an integer").toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit must be a positive integer")
    .toInt(),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be an integer >= 0")
    .toInt(),
];

export const cancelBookingValidators = [
  param("id").isInt().withMessage("booking id must be an integer").toInt(),
];
