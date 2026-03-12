import "dotenv/config";
import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const isTest = process.env.NODE_ENV === "test";

export const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: isTest ? false : false,
});
