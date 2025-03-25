// Import models, services, and utility functions
const { Movie } = require('../../models');
const {
  checkOverlappingShowtime,
  updateShowtime,
  findShowtimesByMovieId,
  deleteShowtime,
} = require('../services/showtimeService');
const { findTicketsByShowtimeId } = require('./bookingService');
const { calculateEndTime } = require('../utils/timeHelpers');

/**
 * Find a movie by its title.
 */
async function findMovieByTitle(title) {
  return await Movie.findOne({ where: { title } });
}

/**
 * Create a new movie if a movie with the same title doesn't already exist.
 */
async function createMovie(data) {
  const existingMovie = await Movie.findOne({ where: { title: data.title } });
  if (existingMovie) throw new Error('Movie already exists with this title.');
  return await Movie.create(data);
}

/**
 * Retrieve all movies from the database.
 */
async function getAllMovies() {
  return await Movie.findAll();
}

/**
 * Check if updating the movie duration would cause scheduling conflicts
 * with existing showtimes.
 */
async function findShowtimeConflicts(showtimes, newDuration) {
  for (let showtime of showtimes) {
    const newEndTime = calculateEndTime(showtime.startTime, newDuration);
    const conflict = await checkOverlappingShowtime(
      showtime.theater,
      showtime.startTime,
      newEndTime,
      showtime.id
    );
    if (conflict) return 'Movie duration update failed due to scheduling conflicts.';
  }
  return null;
}

/**
 * Update movie details with the following rules:
 * - Title cannot be changed
 * - If increasing duration, future showtimes must be adjusted
 * - If duration change causes overlap, update is blocked
 */
async function updateMovie(movieTitle, data) {
  const movie = await findMovieByTitle(movieTitle);
  if (!movie) throw new Error('Movie not found');

  if (data.title && data.title !== movie.title)
    throw new Error('Renaming the movie is not allowed.');

  if (data.duration && data.duration > movie.duration) {
    const showtimes = (await findShowtimesByMovieId(movie.id)) || [];
    const futureShowtimes = showtimes.filter(st => new Date(st.endTime) >= new Date());
    if (futureShowtimes.length > 0) {
      const conflictError = await findShowtimeConflicts(showtimes, data.duration);
      if (conflictError) throw new Error(conflictError);
      for (const showtime of showtimes) {
        const adjustedEndTime = calculateEndTime(showtime.startTime, data.duration);
        await updateShowtime(
          showtime.id,
          {
            movieId: movie.id,
            startTime: showtime.startTime,
            endTime: adjustedEndTime,
            duration: data.duration,
          },
          { skipOverlapCheck: true }
        );
      }
    }
  }

  await movie.update(data);
  return movie;
}

/**
 * Delete a movie only if:
 * - It exists
 * - No future showtime has sold tickets
 * - All future showtimes are removed beforehand
 */
async function deleteMovie(movieTitle) {
  const movie = await findMovieByTitle(movieTitle);
  if (!movie) throw new Error('Movie not found');

  const existingShowtimes = (await findShowtimesByMovieId(movie.id)) || [];
  const futureShowtimes = existingShowtimes.filter(st => new Date(st.endTime) >= new Date());
  for (const st of futureShowtimes) {
    const tickets = await findTicketsByShowtimeId(st.id);
    if (tickets.length > 0)
      throw new Error(
        'Cannot delete movie, this movie has upcoming showtimes for which tickets have already been sold.'
      );
  }

  for (const st of futureShowtimes) await deleteShowtime(st.id);

  await movie.destroy();
  return;
}

module.exports = {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
};
