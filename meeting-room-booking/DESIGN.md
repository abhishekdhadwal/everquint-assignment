# Design Notes

## Stack

- Express
- Sequelize
- PostgreSQL

## Data model

- `Room`: `id`, `name`, `capacity`, `floor`, `amenities`
- `Booking`: `id`, `roomId`, `title`, `organizerEmail`, `startTime`, `endTime`, `status`, `cancelledAt`
- `IdempotencyRecord`: `key`, `bookingId`, `fingerprint`

## Why PostgreSQL

The prompt explicitly points toward a DB-backed solution for persistence, idempotency, and concurrency. PostgreSQL gives a cleaner answer than an in-memory solution because both booking state and idempotency records survive restarts and can be coordinated with transactions.

## How overlaps are prevented

Booking creation runs inside a Sequelize transaction:

1. read and lock the room
2. check the idempotency record
3. check overlapping confirmed bookings
4. insert booking
5. insert idempotency record

Overlap rule:

`startA < endB && startB < endA`

Cancelled bookings do not block future bookings.

## Idempotency

`POST /bookings` accepts `Idempotency-Key`.

- same key + same payload => return original booking
- same key + different payload => `409`

The key is persisted in PostgreSQL with a unique constraint on `idempotency_records.key`.

## Concurrency

This version uses database transactions rather than only an in-memory lock. That makes it a much stronger fit for the assignment.

For an even stricter production-grade overlap guarantee, I would consider advisory locks per room or a PostgreSQL exclusion constraint.

## Error handling

The API returns:

```json
{
  "error": "ValidationError",
  "message": "..."
}
```

Used status codes:

- `400` validation problems
- `404` unknown room or booking
- `409` overlap or idempotency conflicts

## Utilization formula

For each room:

`utilizationPercent = booked business minutes inside [from, to] / total business minutes inside [from, to]`

Assumptions:

- business hours are Monday-Friday, 08:00-20:00
- report business hours use the timezone offset encoded in `from` and `to`
- booking validation uses the timezone offset encoded in the booking timestamps
