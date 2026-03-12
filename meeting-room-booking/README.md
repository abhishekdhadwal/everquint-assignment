# Meeting Room Booking Service

Backend assignment implementation using `Express + Sequelize + PostgreSQL`.

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

## Endpoints

### `POST /rooms`

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

```json
{
  "roomId": 1,
  "title": "Design review",
  "organizerEmail": "owner@example.com",
  "startTime": "2026-03-16T09:00:00Z",
  "endTime": "2026-03-16T10:00:00Z"
}
```

### `GET /bookings`

Optional query params:

- `roomId`
- `from`
- `to`
- `limit`
- `offset`

### `POST /bookings/:id/cancel`

### `GET /reports/room-utilization`

Required query params:

- `from`
- `to`

## Run

```bash
npm install
npm run db:migrate
npm test
npm start
```

Swagger UI:

- `http://localhost:3000/api-docs`

## Notes

- schema is managed through migration files in `migrations/`
- use `npm run db:migrate` before starting the app
- tests run against PostgreSQL and truncate tables between cases
- design decisions are documented in `DESIGN.md`
