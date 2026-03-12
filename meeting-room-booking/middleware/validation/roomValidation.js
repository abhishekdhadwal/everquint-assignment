import { body, query } from "express-validator";

export const createRoomValidators = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("name is required"),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("capacity must be an integer >= 1")
    .toInt(),
  body("floor")
    .isInt()
    .withMessage("floor must be an integer")
    .toInt(),
  body("amenities")
    .isArray()
    .withMessage("amenities must be an array of strings"),
  body("amenities.*").isString().trim().notEmpty(),
];

export const roomListValidators = [
  query("minCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("minCapacity must be an integer >= 1")
    .toInt(),
  query("amenity").optional().isString().trim(),
];
