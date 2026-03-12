import { sequelize } from "../config/database.js";
import { defineRoom } from "./room.js";
import { defineBooking } from "./booking.js";
import { defineIdempotencyRecord } from "./idempotencyRecord.js";

export const Room = defineRoom(sequelize);
export const Booking = defineBooking(sequelize);
export const IdempotencyRecord = defineIdempotencyRecord(sequelize);

Room.hasMany(Booking, { foreignKey: "roomId" });
Booking.belongsTo(Room, { foreignKey: "roomId" });
Booking.hasOne(IdempotencyRecord, { foreignKey: "bookingId" });
IdempotencyRecord.belongsTo(Booking, { foreignKey: "bookingId" });
