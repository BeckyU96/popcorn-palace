// Set up Express router for booking-related endpoints
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Route to handle ticket booking
router.post('/', bookingController.bookTicket);

module.exports = router;
