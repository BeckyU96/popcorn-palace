// Import Movie and Ticket models from Sequelize
const { Movie, Ticket } = require('../../models');

/**
 * Find a movie by its primary key (ID).
 */
async function findMovieById(movieId) {
  return Movie.findByPk(movieId);
}

/**
 * Retrieve all tickets for a specific showtime.
 * Optionally includes a transaction for atomic operations.
 */
async function findTicketsByShowtimeId(showtimeId, transaction = null) {
  return Ticket.findAll({ where: { showtimeId }, transaction });
}

module.exports = {
  findMovieById,
  findTicketsByShowtimeId,
};
