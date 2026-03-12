"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("idempotency_records", {
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "bookings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fingerprint: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("idempotency_records", ["key"], {
      unique: true,
      name: "idempotency_records_key_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "idempotency_records",
      "idempotency_records_key_unique",
    );
    await queryInterface.dropTable("idempotency_records");
  },
};
