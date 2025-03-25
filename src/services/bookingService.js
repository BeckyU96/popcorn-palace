// Import UUID generator for unique booking IDs
const { v4: uuidv4 } = require('uuid');
// Import models and transaction handler
const { Ticket, sequelize } = require('../../models');
const { getShowtimeById } = require('./showtimeService');
const { isDateInThePast } = require('../utils/timeHelpers');

/**
 * Create a new ticket entry in the database.
 */
async function createTicket({ showtimeId, seatNumber, userId, transaction }) {
  const bookingId = uuidv4();
  return Ticket.create(
    {
      showtimeId,
      seatNumber,
      userId,
      bookingId,
    },
    { transaction }
  );
}

/**
 * Check if a seat is already booked for a specific showtime.
 */
async function isSeatAlreadyBooked(showtimeId, seatNumber, transaction) {
  const existingTicket = await Ticket.findOne({ where: { showtimeId, seatNumber }, transaction });
  return !!existingTicket;
}

/**
 * Retrieve all tickets for a given showtime.
 */
async function findTicketsByShowtimeId(showtimeId, transaction = null) {
  return Ticket.findAll({ where: { showtimeId }, transaction });
}

/**
 * Book a ticket by verifying:
 * - Showtime exists and has not ended
 * - Seat is available
 */
async function bookTicket({ showtimeId, seatNumber, userId }) {
  const transaction = await sequelize.transaction();
  try {
    const showtime = await getShowtimeById(showtimeId, transaction);

    if (isDateInThePast(showtime.endTime))
      throw new Error('Showtime has already ended. Cannot book ticket.');

    const alreadyBooked = await isSeatAlreadyBooked(showtimeId, seatNumber, transaction);
    if (alreadyBooked) throw new Error('Seat is already booked for this showtime.');

    const ticket = await createTicket({ showtimeId, seatNumber, userId, transaction });

    await transaction.commit();
    return ticket;
  } catch (err) {
    await transaction.rollback();
    if (err.name === 'SequelizeUniqueConstraintError')
      throw new Error('Seat is already booked for this showtime.');
    throw err;
  }
}

module.exports = {
  bookTicket,
  findTicketsByShowtimeId,
};
