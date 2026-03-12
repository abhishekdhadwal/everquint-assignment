# Meeting Room Booking Service

Backend assignment implementation using `Express`, `Sequelize`, and `PostgreSQL`.

## What Is Included

- PostgreSQL-backed persistence
- Sequelize models
- standard Sequelize CLI migrations
- REST API for rooms, bookings, cancellation, and utilization report
- Swagger docs at `/api-docs`
- Jest + Supertest API tests
- `README.md` and `DESIGN.md`

## Environment

Create a `.env` file from `.env.example`.

Required variables:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`

Example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:Admin123@localhost:5432/meeting_room_booking
```

## Project Structure

- `server.js`: app entrypoint
- `config/database.js`: Sequelize database connection
- `config/config.cjs`: Sequelize CLI config
- `.sequelizerc`: Sequelize CLI path mapping
- `models/`: Sequelize models and associations
- `migrations/`: schema migrations
- `controllers/`, `services/`, `repositories/`: request, business, and data layers
- `tests/`: integration/API tests

## Endpoints

### `POST /rooms`

Request body:

```json
{
  "name": "Atlas",
  "capacity": 8,
  "floor": 4,
  "amenities": ["tv", "whiteboard"]
}
```

### `GET /rooms`

Optional query params:

- `minCapacity`
- `amenity`

### `POST /bookings`

Optional header:

- `Idempotency-Key`

Request body:

```json
{
  "roomId": 1,
  "title": "Design review",
  "organizerEmail": "owner@example.com",
  "startTime": "2026-03-16T09:00:00Z",
  "endTime": "2026-03-16T10:00:00Z"
}
```

Rules enforced:

- `startTime < endTime`
- booking duration between 15 minutes and 4 hours
- Monday-Friday, 08:00-20:00 in the supplied local time
- no overlapping confirmed bookings for the same room

### `GET /bookings`

Optional query params:

- `roomId`
- `from`
- `to`
- `limit`
- `offset`

### `POST /bookings/:id/cancel`

- cancellation allowed until 1 hour before `startTime`
- re-cancelling an already cancelled booking returns the cancelled booking

### `GET /reports/room-utilization`

Required query params:

- `from`
- `to`

## Run

```bash
npm install
npm run db:migrate
npm start
```

Swagger UI:

- `http://localhost:3000/api-docs`

## Test

```bash
npm test
```

Current test flow:

1. reset the test database tables
2. run Sequelize migrations
3. run Jest API tests

## Notes

- schema is managed through migration files in `migrations/`
- `server.js` is the only runtime entrypoint
- tests run against PostgreSQL, not an in-memory substitute
- design details and tradeoffs are documented in `DESIGN.md`
