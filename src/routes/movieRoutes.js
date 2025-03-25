// Set up Express router for movie-related endpoints
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Create a new movie
router.post('/', movieController.createMovie);
// Get a list of all movies
router.get('/all', movieController.getAllMovies);
// Update a movie by title
router.post('/update/:movieTitle', movieController.updateMovie);
// Delete a movie by title
router.delete('/:movieTitle', movieController.deleteMovie);

module.exports = router;
