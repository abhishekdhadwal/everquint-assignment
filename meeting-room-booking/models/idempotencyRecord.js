import { DataTypes } from "sequelize";

export function defineIdempotencyRecord(sequelize) {
  return sequelize.define(
    "IdempotencyRecord",
    {
      key: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "bookings",
          key: "id",
        },
      },
      fingerprint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "idempotency_records",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["key"],
        },
      ],
    },
  );
}
