import request from "supertest";
import app from "../server.js";
import {
  closeDatabase,
  initDatabase,
  resetAllData,
} from "../repositories/dataStore.js";

function roomPayload(overrides = {}) {
  return {
    name: "Atlas",
    capacity: 8,
    floor: 4,
    amenities: ["tv", "whiteboard"],
    ...overrides,
  };
}

function bookingPayload(overrides = {}) {
  return {
    roomId: 1,
    title: "Design review",
    organizerEmail: "owner@example.com",
    startTime: "2026-03-16T09:00:00Z",
    endTime: "2026-03-16T10:00:00Z",
    ...overrides,
  };
}

beforeAll(async () => {
  await initDatabase();
});

beforeEach(async () => {
  await resetAllData();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Meeting room booking assignment", () => {
  test("creates a room with the required fields", async () => {
    const response = await request(app).post("/rooms").send(roomPayload()).expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      name: "Atlas",
      capacity: 8,
      floor: 4,
      amenities: ["tv", "whiteboard"],
    });
  });

  test("enforces case-insensitive unique room names", async () => {
    await request(app).post("/rooms").send(roomPayload({ name: "Ocean" })).expect(201);

    const response = await request(app)
      .post("/rooms")
      .send(roomPayload({ name: "ocean" }))
      .expect(409);

    expect(response.body.error).toBe("ConflictError");
  });

  test("lists rooms filtered by amenity and minCapacity", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    await request(app)
      .post("/rooms")
      .send(roomPayload({ name: "Focus", capacity: 4, amenities: ["phone"] }))
      .expect(201);

    const response = await request(app)
      .get("/rooms?minCapacity=6&amenity=tv")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Atlas");
  });

  test("creates a confirmed booking", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);

    const response = await request(app)
      .post("/bookings")
      .send(bookingPayload())
      .expect(201);

    expect(response.body.status).toBe("confirmed");
    expect(response.body.organizerEmail).toBe("owner@example.com");
  });

  test("rejects overlapping confirmed bookings", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    await request(app).post("/bookings").send(bookingPayload()).expect(201);

    const response = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          title: "Overlap",
          startTime: "2026-03-16T09:30:00Z",
          endTime: "2026-03-16T10:30:00Z",
        }),
      )
      .expect(409);

    expect(response.body.error).toBe("ConflictError");
  });

  test("rejects bookings outside working hours", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);

    const response = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          startTime: "2026-03-16T07:45:00Z",
          endTime: "2026-03-16T08:30:00Z",
        }),
      )
      .expect(400);

    expect(response.body.message).toContain("Monday-Friday");
  });

  test("rejects invalid booking durations", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);

    const response = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          endTime: "2026-03-16T09:10:00Z",
        }),
      )
      .expect(400);

    expect(response.body.message).toContain("between 15 minutes and 4 hours");
  });

  test("uses Idempotency-Key on POST /bookings", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);

    const first = await request(app)
      .post("/bookings")
      .set("Idempotency-Key", "key-1")
      .send(bookingPayload())
      .expect(201);

    const second = await request(app)
      .post("/bookings")
      .set("Idempotency-Key", "key-1")
      .send(bookingPayload())
      .expect(201);

    expect(first.body.id).toBe(second.body.id);

    const list = await request(app).get("/bookings").expect(200);
    expect(list.body.total).toBe(1);
  });

  test("cancels a booking before the 1 hour cutoff and allows rebooking", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    const created = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          startTime: "2099-03-16T10:00:00Z",
          endTime: "2099-03-16T11:00:00Z",
        }),
      )
      .expect(201);

    const cancelled = await request(app)
      .post(`/bookings/${created.body.id}/cancel`)
      .expect(200);

    expect(cancelled.body.status).toBe("cancelled");

    const replacement = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          title: "Replacement",
          startTime: "2099-03-16T10:00:00Z",
          endTime: "2099-03-16T11:00:00Z",
        }),
      )
      .expect(201);

    expect(replacement.body.status).toBe("confirmed");
  });

  test("returns the same cancelled booking when cancellation is retried", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    const created = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          startTime: "2099-03-16T12:00:00Z",
          endTime: "2099-03-16T13:00:00Z",
        }),
      )
      .expect(201);

    await request(app).post(`/bookings/${created.body.id}/cancel`).expect(200);
    const second = await request(app)
      .post(`/bookings/${created.body.id}/cancel`)
      .expect(200);

    expect(second.body.status).toBe("cancelled");
  });

  test("rejects cancellation inside the cutoff window", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    const soon = new Date(Date.now() + 30 * 60 * 1000);
    const end = new Date(soon.getTime() + 30 * 60 * 1000);

    const created = await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          startTime: soon.toISOString(),
          endTime: end.toISOString(),
        }),
      )
      .expect(201);

    const response = await request(app)
      .post(`/bookings/${created.body.id}/cancel`)
      .expect(400);

    expect(response.body.error).toBe("ValidationError");
  });

  test("lists bookings with overlap filtering and pagination", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    await request(app)
      .post("/bookings")
      .send(bookingPayload({ title: "Morning" }))
      .expect(201);
    await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          title: "Noon",
          startTime: "2026-03-16T12:00:00Z",
          endTime: "2026-03-16T13:00:00Z",
        }),
      )
      .expect(201);

    const response = await request(app)
      .get("/bookings?from=2026-03-16T09:30:00Z&to=2026-03-16T12:30:00Z&limit=1&offset=1")
      .expect(200);

    expect(response.body.total).toBe(2);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].title).toBe("Noon");
  });

  test("calculates utilization with partial overlaps inside the report window", async () => {
    await request(app).post("/rooms").send(roomPayload()).expect(201);
    await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          title: "Early edge",
          startTime: "2026-03-16T08:00:00Z",
          endTime: "2026-03-16T09:30:00Z",
        }),
      )
      .expect(201);
    await request(app)
      .post("/bookings")
      .send(
        bookingPayload({
          title: "Late edge",
          startTime: "2026-03-16T19:00:00Z",
          endTime: "2026-03-16T20:00:00Z",
        }),
      )
      .expect(201);

    const response = await request(app)
      .get("/reports/room-utilization?from=2026-03-16T09:00:00Z&to=2026-03-16T20:00:00Z")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].totalBookingHours).toBe(1.5);
    expect(response.body[0].utilizationPercent).toBeCloseTo(1.5 / 11, 4);
  });
});
