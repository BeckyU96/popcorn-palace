// Import models, Sequelize operators, DB queries, and time utilities
const { Showtime } = require('../../models');
const { Op } = require('sequelize');
const { findMovieById, findTicketsByShowtimeId } = require('./dbQueries');
const { matchesExactDuration, isDateInThePast } = require('../utils/timeHelpers');

/**
 * Get a showtime by its ID, throws an error if not found.
 */
async function getShowtimeById(id, transaction = null) {
  const showtime = await Showtime.findByPk(id, { transaction });
  if (!showtime) throw new Error('Showtime not found');
  return showtime;
}

/**
 * Find all showtimes associated with a specific movie.
 */
async function findShowtimesByMovieId(movieId) {
  return await Showtime.findAll({ where: { movieId } });
}

/**
 * Check if a new or updated showtime overlaps with an existing one in the same theater.
 */
async function checkOverlappingShowtime(theater, startTime, endTime, excludeId = null) {
  const whereClause = {
    theater,
    startTime: { [Op.lt]: endTime },
    endTime: { [Op.gt]: startTime },
  };
  if (excludeId) whereClause.id = { [Op.ne]: excludeId };
  return await Showtime.findOne({ where: whereClause });
}

/**
 * Create a new showtime after verifying:
 * - The movie exists
 * - The duration matches the movie
 * - There are no scheduling overlaps
 */
async function createShowtime(data) {
  const movie = await findMovieById(data.movieId);
  if (!movie) throw new Error('Cannot create showtime for a non-existing movie.');

  if (!matchesExactDuration(data.startTime, data.endTime, movie.duration))
    throw new Error('Showtime length does not match the movie duration.');

  const overlap = await checkOverlappingShowtime(data.theater, data.startTime, data.endTime);
  if (overlap) throw new Error('Showtime overlaps with an existing showtime in the same theater.');
  return await Showtime.create(data);
}

/**
 * Update a showtime if:
 * - It hasn't ended
 * - No tickets have been sold
 * - The updated duration matches the movie
 * - No overlaps
 */
async function updateShowtime(id, newData, options = { skipOverlapCheck: false }) {
  const showtime = await getShowtimeById(id);

  if (isDateInThePast(showtime.endTime))
    throw new Error('Cannot update a showtime that has already ended.');

  const existingTickets = await findTicketsByShowtimeId(id);
  if (existingTickets.length > 0)
    throw new Error('Cannot update a showtime that already has tickets sold.');

  const movie = await findMovieById(newData.movieId);
  if (!movie) throw new Error('Cannot update showtime to a non-existing movie.');

  const durationToCompare = newData.duration || movie.duration;
  if (!matchesExactDuration(newData.startTime, newData.endTime, durationToCompare))
    throw new Error('Updated showtime length does not match the movie duration.');

  if (!options.skipOverlapCheck) {
    const overlap = await checkOverlappingShowtime(
      newData.theater,
      newData.startTime,
      newData.endTime,
      id
    );
    if (overlap)
      throw new Error('Updated showtime overlaps with an existing showtime in the same theater.');
  }

  await showtime.update(newData);
  return showtime;
}

/**
 * Delete a showtime only if:
 * - It hasn't ended
 * - No tickets have been booked
 */
async function deleteShowtime(id) {
  const showtime = await getShowtimeById(id);
  if (isDateInThePast(showtime.endTime))
    throw new Error('Cannot delete a showtime that has already ended.');

  const existingTickets = await findTicketsByShowtimeId(id);
  if (existingTickets.length > 0)
    throw new Error('Cannot delete showtime that has existing ticket bookings.');

  const deletedCount = await Showtime.destroy({ where: { id } });
  if (deletedCount === 0) throw new Error('Showtime not found');
}

module.exports = {
  getShowtimeById,
  findShowtimesByMovieId,
  checkOverlappingShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
