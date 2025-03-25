// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Import route handlers
const app = express();

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Mount route handlers
app.use('/movies', movieRoutes);
app.use('/showtimes', showtimeRoutes);
app.use('/bookings', bookingRoutes);

module.exports = app;
