// Import app and services for integration testing
const request = require('supertest');
const app = require('../../src/app');
const movieService = require('../../src/services/movieService');

// Mock models and service layer
jest.mock('../../models');
jest.mock('../../src/services/movieService');

// Sample movie data used across multiple tests
const dummyMovie = {
  title: 'Test Movie',
  genre: 'Drama',
  duration: 120,
  rating: 8.5,
  releaseYear: 2022,
};

describe('/movies integration', () => {
  afterEach(() => jest.clearAllMocks());
  // ------------------------------------------------------
  // POST /movies (Create Movie)
  // ------------------------------------------------------
  describe('POST /movies', () => {
    it('should return 200 and created movie on valid input', async () => {
      movieService.createMovie.mockResolvedValue(dummyMovie);

      const res = await request(app).post('/movies').send(dummyMovie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(dummyMovie);
    });

    it('should return 400 if input validation fails', async () => {
      const res = await request(app).post('/movies').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/"title" is required/);
    });

    it('should return 400 if movie already exists', async () => {
      movieService.createMovie.mockRejectedValue(
        new Error('Movie already exists with this title.')
      );

      const res = await request(app).post('/movies').send(dummyMovie);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/);
    });

    it('should return 500 on unknown error', async () => {
      movieService.createMovie.mockRejectedValue(new Error('Unexpected DB error'));

      const res = await request(app).post('/movies').send(dummyMovie);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
      expect(res.body.details).toBe('Unexpected DB error');
    });
  });

  // ------------------------------------------------------
  // GET /movies/all (Get All Movies)
  // ------------------------------------------------------
  describe('GET /movies/all', () => {
    it('should return list of movies', async () => {
      movieService.getAllMovies.mockResolvedValue([dummyMovie]);

      const res = await request(app).get('/movies/all');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([dummyMovie]);
    });

    it('should return 500 on failure', async () => {
      movieService.getAllMovies.mockRejectedValue(new Error('DB failed'));

      const res = await request(app).get('/movies/all');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  // ------------------------------------------------------
  // POST /movies/update/:movieTitle  (Update Movie)
  // ------------------------------------------------------
  describe('POST /movies/update/:movieTitle', () => {
    it('should return 200 on successful update', async () => {
      movieService.updateMovie.mockResolvedValue();

      const res = await request(app).post('/movies/update/Test Movie').send(dummyMovie);

      expect(res.status).toBe(200);
    });

    it('should return 400 on validation error', async () => {
      const res = await request(app).post('/movies/update/Test Movie').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"title" is required/);
    });

    it('should return 404 if movie not found', async () => {
      movieService.updateMovie.mockRejectedValue(new Error('Movie not found'));

      const res = await request(app).post('/movies/update/Test Movie').send(dummyMovie);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/);
    });

    it('should return 400 for scheduling conflict or renaming attempt', async () => {
      movieService.updateMovie.mockRejectedValue(
        new Error('Movie duration update failed due to scheduling conflicts.')
      );

      const res = await request(app).post('/movies/update/Test Movie').send(dummyMovie);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/scheduling conflicts/);
    });

    it('should return 500 on server error', async () => {
      movieService.updateMovie.mockRejectedValue(new Error('DB crash'));

      const res = await request(app).post('/movies/update/Test Movie').send(dummyMovie);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  // ------------------------------------------------------
  // DELETE /movies/:movieTitle  (Delete Movie)
  // ------------------------------------------------------
  describe('DELETE /movies/:movieTitle', () => {
    it('should return 200 on successful delete', async () => {
      movieService.deleteMovie.mockResolvedValue();

      const res = await request(app).delete('/movies/Test Movie');
      expect(res.status).toBe(200);
    });

    it('should return 404 if movie not found', async () => {
      movieService.deleteMovie.mockRejectedValue(new Error('Movie not found'));

      const res = await request(app).delete('/movies/Test Movie');
      expect(res.status).toBe(404);
    });

    it('should return 400 if movie has booked tickets', async () => {
      movieService.deleteMovie.mockRejectedValue(
        new Error(
          'Cannot delete movie, this movie has upcoming showtimes for which tickets have already been sold.'
        )
      );

      const res = await request(app).delete('/movies/Test Movie');
      expect(res.status).toBe(400);
    });

    it('should return 500 on general error', async () => {
      movieService.deleteMovie.mockRejectedValue(new Error('Unexpected DB error'));

      const res = await request(app).delete('/movies/Test Movie');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });
});
