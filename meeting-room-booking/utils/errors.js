export class AppError extends Error {
  constructor(status, error, message) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

export function validationError(message) {
  return new AppError(400, "ValidationError", message);
}

export function notFoundError(message) {
  return new AppError(404, "NotFoundError", message);
}

export function conflictError(message) {
  return new AppError(409, "ConflictError", message);
}
