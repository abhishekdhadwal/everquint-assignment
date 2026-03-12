import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import swaggerSpec from "./config/swagger.js";
import { initDatabase } from "./repositories/dataStore.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Meeting Room Booking API Docs",
  }),
);

app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reports", reportRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "meeting-room-booking",
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "Meeting Room Booking Service",
    endpoints: ["/rooms", "/bookings", "/reports/room-utilization", "/api-docs"],
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "NotFoundError",
    message: "endpoint not found",
  });
});

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  const PORT = Number.parseInt(process.env.PORT || "3000", 10);
  const NODE_ENV = process.env.NODE_ENV || "development";

  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Meeting room booking service listening on port ${PORT} in ${NODE_ENV} mode`,
        );
      });
    })
    .catch((error) => {
      console.error("Failed to initialize database", error);
      process.exit(1);
    });
}

export default app;
