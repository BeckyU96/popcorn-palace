// Set up Express router for showtime-related endpoints
const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');

// Create a new showtime
router.post('/', showtimeController.createShowtime);
// Retrieve a specific showtime by ID
router.get('/:showtimeId', showtimeController.getShowtimeById);
// Update a showtime by ID
router.post('/update/:showtimeId', showtimeController.updateShowtime);
// Delete a showtime by ID
router.delete('/:showtimeId', showtimeController.deleteShowtime);

module.exports = router;
