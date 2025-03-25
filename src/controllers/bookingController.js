// Import error handler, request validator, and ticket booking service
const { handleError } = require('../utils/errorHandler');
const { validateBooking } = require('../utils/validators');
const bookingService = require('../services/bookingService');

/**
 * Controller to handle ticket booking requests.
 * Validates input, processes the booking, and handles errors appropriately.
 */
exports.bookTicket = async (req, res) => {
  try {
    const validationError = validateBooking(req.body);
    if (validationError) return handleError(res, 400, validationError);

    const ticket = await bookingService.bookTicket(req.body);
    return res.status(200).json({ bookingId: ticket.bookingId });
  } catch (err) {
    if (err.message.includes('Showtime not found')) return handleError(res, 404, err.message);
    if (err.message.includes('already ended') || err.message.includes('already booked'))
      return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};
