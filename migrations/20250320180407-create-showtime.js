'use strict';

// Migration: Creates the 'Showtimes' table, linking to 'Movies' and storing showtime details
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Showtimes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      movieId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Movies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      theater: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Showtimes');
  },
};
