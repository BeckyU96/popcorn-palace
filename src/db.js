// Initialize Sequelize instance using environment variables
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false,
});

// Test the database connection on startup
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

// Export Sequelize instance for use in the application
module.exports = sequelize;
