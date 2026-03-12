# Design Notes

## Stack

- Express
- Sequelize ORM
- PostgreSQL
- Swagger UI for API documentation
- Jest + Supertest for integration testing

## Architecture

The project is split into standard backend layers:

- `routes/`: route declarations
- `controllers/`: HTTP request/response handling
- `services/`: business rules
- `repositories/`: persistence calls
- `models/`: Sequelize models and associations

This keeps business logic out of the routing layer and makes the data access details replaceable.

## Database And Migrations

Database connection lives in `config/database.js`.

Schema management is handled through standard Sequelize CLI migrations:

- `20260312170000-create-rooms.cjs`
- `20260312170100-create-bookings.cjs`
- `20260312170200-create-idempotency-records.cjs`

I used migrations rather than `sequelize.sync()` because migrations are more explicit, reviewable, and production-like for a backend take-home.

## Data Model

### Room

- `id`
- `name`
- `capacity`
- `floor`
- `amenities`
- `createdAt`
- `updatedAt`

### Booking

- `id`
- `roomId`
- `title`
- `organizerEmail`
- `startTime`
- `endTime`
- `status`
- `cancelledAt`
- `createdAt`
- `updatedAt`

### IdempotencyRecord

- `key`
- `bookingId`
- `fingerprint`
- `createdAt`
- `updatedAt`

## Why PostgreSQL

The prompt strongly favors a persistence-backed solution for:

- restart-safe idempotency
- concurrency discussion
- clear transactional behavior

PostgreSQL is a better fit than an in-memory store because the database becomes the source of truth for bookings and idempotency records.

## How Booking Overlap Is Enforced

Booking creation runs in a Sequelize transaction.

Within that transaction the service:

1. loads the room
2. checks the idempotency key
3. checks overlapping confirmed bookings for the same room
4. inserts the booking
5. inserts the idempotency record

Overlap rule:

`startA < endB && startB < endA`

Cancelled bookings do not block future bookings.

## Idempotency

`POST /bookings` accepts the `Idempotency-Key` header.

Behavior:

- same key + same payload => return original booking
- same key + different payload => `409 Conflict`

The idempotency record is persisted in PostgreSQL and uniquely keyed by `idempotency_records.key`.

## Concurrency

This implementation uses database transactions instead of relying on an in-memory lock.

That is a stronger fit for the assignment because it:

- survives process restarts
- keeps idempotency data in the database
- uses DB-backed coordination rather than process-local state

For an even stricter production-grade overlap guarantee, I would consider one of:

- PostgreSQL advisory locking per room
- PostgreSQL exclusion constraints for time-range conflicts

## Error Handling

The API returns a consistent JSON shape:

```json
{
  "error": "ValidationError",
  "message": "..."
}
```

Used status codes:

- `400` validation errors
- `404` unknown room or booking
- `409` overlap or idempotency conflicts

## Utilization Formula

For each room:

`utilizationPercent = booked business minutes inside [from, to] / total business minutes inside [from, to]`

Assumptions:

- business hours are Monday-Friday, 08:00-20:00
- report business hours use the timezone offset encoded in `from` and `to`
- booking validation uses the timezone offset encoded in the booking timestamps

## Testing Approach

Tests are integration-style API tests using Jest and Supertest against PostgreSQL.

Before each test run:

1. test tables are reset
2. migrations are applied
3. the API is exercised through HTTP requests

This verifies the actual request/validation/service/repository/database path instead of only unit-level behavior.
