'use strict';

// Migration: Creates the 'Tickets' table to store individual seat bookings per showtime
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      showtimeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Showtimes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      seatNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      bookingId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    });
    // Enforce uniqueness of seat number per showtime (no double bookings)
    await queryInterface.addConstraint('Tickets', {
      fields: ['showtimeId', 'seatNumber'],
      type: 'unique',
      name: 'unique_showtime_seat',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Tickets', 'unique_showtime_seat');
    await queryInterface.dropTable('Tickets');
  },
};
