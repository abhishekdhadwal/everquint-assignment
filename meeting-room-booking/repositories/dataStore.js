import { sequelize } from "../config/database.js";

export async function initDatabase() {
  await sequelize.authenticate();
}

export async function resetAllData() {
  await sequelize.query(
    'TRUNCATE TABLE "idempotency_records", "bookings", "rooms" RESTART IDENTITY CASCADE;',
  );
}

export async function closeDatabase() {
  await sequelize.close();
}
