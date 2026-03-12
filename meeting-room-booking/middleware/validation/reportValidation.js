import { query } from "express-validator";
import { getLocalDateParts } from "../../utils/timeUtils.js";

function withMessage(result, message) {
  if (!result) {
    throw new Error(message);
  }
  return true;
}

export const reportValidators = [
  query("from")
    .notEmpty()
    .withMessage("from and to query parameters are required"),
  query("to")
    .notEmpty()
    .withMessage("from and to query parameters are required"),
  query("to").custom((toValue, { req }) => {
    const fromValue = req.query.from;
    const start = getLocalDateParts(fromValue);
    const end = getLocalDateParts(toValue);

    withMessage(
      start && end,
      "from and to must be valid ISO-8601 timestamps with timezone",
    );
    withMessage(
      start.offsetMinutes === end.offsetMinutes,
      "from and to must use the same timezone offset",
    );
    withMessage(start.instant < end.instant, "from must be before to");
    return true;
  }),
];
