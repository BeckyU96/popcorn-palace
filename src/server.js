// Import the Express app and Sequelize instance
const app = require('./app');
const sequelize = require('./db');

// Define the port to listen on (default: 3000)
const PORT = process.env.PORT || 3000;

// Start the server and test database connection
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});
