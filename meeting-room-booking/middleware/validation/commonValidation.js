import { matchedData, validationResult } from "express-validator";

export function handleValidationResult(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: "ValidationError",
    message: result.array()[0].msg,
  });
}

export function getValidatedData(req, locations) {
  return matchedData(req, {
    includeOptionals: true,
    locations,
  });
}
