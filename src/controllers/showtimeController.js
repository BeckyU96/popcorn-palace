// Import showtime validator, centralized error handler, and service logic
const { validateShowtime } = require('../utils/validators');
const { handleError } = require('../utils/errorHandler');
const showtimeService = require('../services/showtimeService');

/**
 * Controller to create a new showtime.
 * Validates input, creates the showtime, and handles scheduling-related conflicts.
 */
exports.createShowtime = async (req, res) => {
  try {
    const validationError = validateShowtime(req.body);
    if (validationError) return handleError(res, 400, validationError);

    const showtime = await showtimeService.createShowtime(req.body);
    return res.status(200).json(showtime);
  } catch (err) {
    if (
      err.message.includes('overlaps') ||
      err.message.includes('duration') ||
      err.message.includes('non-existing movie')
    )
      return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};

/**
 * Controller to update an existing showtime by ID.
 * Handles validation and conflicts such as overlapping schedules or sold tickets.
 */
exports.updateShowtime = async (req, res) => {
  try {
    const validationError = validateShowtime(req.body);
    if (validationError) return handleError(res, 400, validationError);

    await showtimeService.updateShowtime(req.params.showtimeId, req.body);
    return res.status(200).send();
  } catch (err) {
    if (err.message === 'Showtime not found') return handleError(res, 404, err.message);
    if (
      err.message.includes('overlaps') ||
      err.message.includes('duration') ||
      err.message.includes('tickets sold') ||
      err.message.includes('non-existing movie') ||
      err.message.includes('already ended')
    )
      return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};

/**
 * Controller to delete a showtime by ID.
 * Prevents deletion if tickets have been sold or the showtime has already ended.
 */
exports.deleteShowtime = async (req, res) => {
  try {
    await showtimeService.deleteShowtime(req.params.showtimeId);
    return res.status(200).send();
  } catch (err) {
    if (err.message === 'Showtime not found') return handleError(res, 404, err.message);
    if (err.message.includes('already ended') || err.message.includes('existing ticket'))
      return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};

/**
 * Controller to fetch a showtime by its ID.
 */
exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await showtimeService.getShowtimeById(req.params.showtimeId);
    return res.status(200).json(showtime);
  } catch (err) {
    if (err.message === 'Showtime not found') return handleError(res, 404, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};
