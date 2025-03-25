// Joi is used for data validation schemas
const Joi = require('joi');

// Regular expressions used in validation
const REGEX = {
  alphanumericTitle: /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
  lettersOnly: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
  genreWithCommasAndDashes: /^[A-Za-z]+(?:[\s,\-]+[A-Za-z]+)*$/,
};

const now = new Date();
const currentYear = now.getFullYear();

// Schema to validate movie data
const movieSchema = Joi.object({
  title: Joi.string().trim().pattern(REGEX.alphanumericTitle).required().messages({
    'string.pattern.base':
      'Title must contain only letters, numbers, and spaces (no special characters).',
  }),
  genre: Joi.string().trim().pattern(REGEX.genreWithCommasAndDashes).required().messages({
    'string.pattern.base':
      'Genre must contain only letters, spaces, commas, or dashes (no numbers or other special characters).',
  }),
  duration: Joi.number().integer().min(30).max(300).required().messages({
    'number.min': 'Duration must be at least 30 minutes.',
    'number.max': 'Duration must not exceed 300 minutes.',
  }),
  rating: Joi.number().min(0).max(10).required(),
  releaseYear: Joi.number().integer().min(1800).max(currentYear).required(),
});

// Schema to validate showtime data
const showtimeSchema = Joi.object({
  movieId: Joi.number().integer().required(),
  theater: Joi.string().trim().pattern(REGEX.lettersOnly).required().messages({
    'string.pattern.base':
      'Theater name must contain only letters and spaces (no numbers or special characters).',
  }),
  startTime: Joi.date().min(now).required().messages({
    'date.min': 'Start time cannot be in the past.',
  }),
  endTime: Joi.date().greater(Joi.ref('startTime')).required().messages({
    'date.greater': 'End time must be after start time.',
  }),
  price: Joi.number().positive().min(1).max(1000).required().messages({
    'number.min': 'Price must be at least 1.',
    'number.max': 'Price must not exceed 1000.',
  }),
});

// Schema to validate booking data
const bookingSchema = Joi.object({
  showtimeId: Joi.number().integer().positive().required(),
  seatNumber: Joi.number().integer().min(1).max(20000).required().messages({
    'number.min': 'Seat number must be at least 1.',
    'number.max': 'Seat number must not exceed 20000.',
  }),
  userId: Joi.string().uuid().required(),
});

// Utility function to validate data against a given schema
function validateData(schema, data) {
  const { error } = schema.validate(data);
  return error ? error.details[0].message : null;
}

// Exported validator functions for each entity
function validateBooking(data) {
  return validateData(bookingSchema, data);
}

function validateMovie(data) {
  return validateData(movieSchema, data);
}

const validateShowtime = data => {
  return validateData(showtimeSchema, data);
};

module.exports = {
  validateMovie,
  validateShowtime,
  validateBooking,
};
