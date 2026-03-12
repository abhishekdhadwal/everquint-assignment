import { DataTypes } from "sequelize";

export function defineBooking(sequelize) {
  return sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "rooms",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organizerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("confirmed", "cancelled"),
        allowNull: false,
        defaultValue: "confirmed",
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "bookings",
      timestamps: true,
    },
  );
}
