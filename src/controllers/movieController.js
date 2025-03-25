// Import error handler, request validator, and movie service logic
const { handleError } = require('../utils/errorHandler');
const { validateMovie } = require('../utils/validators');
const movieService = require('../services/movieService');

/**
 * Controller to handle creation of a new movie.
 * Validates input, delegates to the service, and handles potential errors.
 */
exports.createMovie = async (req, res) => {
  try {
    const validationError = validateMovie(req.body);
    if (validationError) return handleError(res, 400, validationError);

    const movie = await movieService.createMovie(req.body);
    return res.status(200).json(movie);
  } catch (err) {
    if (err.message.includes('already exists')) return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};

/**
 * Controller to retrieve all movies from the database.
 */
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllMovies();
    return res.status(200).json(movies);
  } catch (err) {
    return handleError(res, 500, 'Server error', err.message);
  }
};

/**
 * Controller to update a movie based on its title.
 * Validates input, processes the update, and handles various conflict scenarios.
 */
exports.updateMovie = async (req, res) => {
  try {
    const validationError = validateMovie(req.body);
    if (validationError) return handleError(res, 400, validationError);

    await movieService.updateMovie(req.params.movieTitle, req.body);
    return res.status(200).send();
  } catch (err) {
    if (err.message === 'Movie not found') return handleError(res, 404, err.message);
    if (
      err.message.includes('failed due to scheduling conflicts') ||
      err.message.includes('Renaming the movie')
    )
      return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};

/**
 * Controller to delete a movie by its title.
 * Handles errors related to dependencies or non-existence.
 */
exports.deleteMovie = async (req, res) => {
  try {
    await movieService.deleteMovie(req.params.movieTitle);
    return res.status(200).send();
  } catch (err) {
    if (err.message === 'Movie not found') return handleError(res, 404, err.message);
    if (err.message.includes('already been sold')) return handleError(res, 400, err.message);
    return handleError(res, 500, 'Server error', err.message);
  }
};
