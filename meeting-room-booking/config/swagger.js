const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Meeting Room Booking Service API",
    version: "1.0.0",
    description: "API documentation for the meeting room booking assignment.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "ValidationError" },
          message: { type: "string", example: "roomId must be an integer" },
        },
      },
      Room: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Atlas" },
          capacity: { type: "integer", example: 8 },
          floor: { type: "integer", example: 4 },
          amenities: {
            type: "array",
            items: { type: "string" },
            example: ["tv", "whiteboard"],
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      CreateRoomRequest: {
        type: "object",
        required: ["name", "capacity", "floor", "amenities"],
        properties: {
          name: { type: "string", example: "Atlas" },
          capacity: { type: "integer", minimum: 1, example: 8 },
          floor: { type: "integer", example: 4 },
          amenities: {
            type: "array",
            items: { type: "string" },
            example: ["tv", "whiteboard"],
          },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          roomId: { type: "integer", example: 1 },
          title: { type: "string", example: "Design review" },
          organizerEmail: {
            type: "string",
            format: "email",
            example: "owner@example.com",
          },
          startTime: {
            type: "string",
            format: "date-time",
            example: "2026-03-16T09:00:00Z",
          },
          endTime: {
            type: "string",
            format: "date-time",
            example: "2026-03-16T10:00:00Z",
          },
          status: {
            type: "string",
            enum: ["confirmed", "cancelled"],
            example: "confirmed",
          },
          cancelledAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      CreateBookingRequest: {
        type: "object",
        required: ["roomId", "title", "organizerEmail", "startTime", "endTime"],
        properties: {
          roomId: { type: "integer", example: 1 },
          title: { type: "string", example: "Design review" },
          organizerEmail: {
            type: "string",
            format: "email",
            example: "owner@example.com",
          },
          startTime: {
            type: "string",
            format: "date-time",
            example: "2026-03-16T09:00:00Z",
          },
          endTime: {
            type: "string",
            format: "date-time",
            example: "2026-03-16T10:00:00Z",
          },
        },
      },
      BookingListResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Booking" },
          },
          total: { type: "integer", example: 1 },
          limit: { type: "integer", example: 50 },
          offset: { type: "integer", example: 0 },
        },
      },
      UtilizationReportItem: {
        type: "object",
        properties: {
          roomId: { type: "integer", example: 1 },
          roomName: { type: "string", example: "Atlas" },
          totalBookingHours: { type: "number", example: 1.5 },
          utilizationPercent: { type: "number", example: 0.125 },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "Healthy service",
          },
        },
      },
    },
    "/rooms": {
      post: {
        summary: "Create room",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRoomRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Room created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Room" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Conflict",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      get: {
        summary: "List rooms",
        parameters: [
          {
            in: "query",
            name: "minCapacity",
            schema: { type: "integer" },
          },
          {
            in: "query",
            name: "amenity",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Rooms",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Room" },
                },
              },
            },
          },
        },
      },
    },
    "/bookings": {
      post: {
        summary: "Create booking",
        parameters: [
          {
            in: "header",
            name: "Idempotency-Key",
            schema: { type: "string" },
            required: false,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBookingRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Booking created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Booking" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Room not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Conflict",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      get: {
        summary: "List bookings",
        parameters: [
          { in: "query", name: "roomId", schema: { type: "integer" } },
          { in: "query", name: "from", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "to", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "offset", schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Bookings",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingListResponse" },
              },
            },
          },
        },
      },
    },
    "/bookings/{id}/cancel": {
      post: {
        summary: "Cancel booking",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Booking cancelled",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Booking" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Booking not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/reports/room-utilization": {
      get: {
        summary: "Room utilization report",
        parameters: [
          {
            in: "query",
            name: "from",
            required: true,
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "to",
            required: true,
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "Utilization report",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/UtilizationReportItem" },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
