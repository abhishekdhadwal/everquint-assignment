import "dotenv/config";
import { sequelize } from "../config/database.js";

async function main() {
  await sequelize.authenticate();
  await sequelize.query(
    'DROP TABLE IF EXISTS "idempotency_records", "bookings", "rooms", "SequelizeMeta" CASCADE;',
  );
  await sequelize.query('DROP TYPE IF EXISTS enum_bookings_status;');
  await sequelize.close();
}

main().catch((error) => {
  console.error("Failed to reset test database", error);
  process.exit(1);
});
