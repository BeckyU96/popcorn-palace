// Import app for integration testing
const request = require('supertest');
const app = require('../../src/app');

// Mock models and service layer
jest.mock('../../src/services/showtimeService');
const showtimeService = require('../../src/services/showtimeService');

describe('/showtimes integration', () => {
  afterEach(() => jest.clearAllMocks());

  const dummyShowtimeInput = {
    movieId: 1,
    theater: 'A',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    price: 15.0,
  };

  const dummyShowtimeResponse = {
    id: 1,
    ...dummyShowtimeInput,
  };

  // ------------------------------------------------------------
  // POST /showtimes (Create Showtime)
  // ------------------------------------------------------------
  describe('POST /showtimes', () => {
    it('should return 200 and created showtime on valid input', async () => {
      showtimeService.createShowtime.mockResolvedValue(dummyShowtimeResponse);
      const res = await request(app).post('/showtimes').send(dummyShowtimeInput);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...dummyShowtimeResponse,
        startTime: dummyShowtimeInput.startTime.toISOString(),
        endTime: dummyShowtimeInput.endTime.toISOString(),
      });
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app).post('/showtimes').send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"movieId" is required/);
    });

    it('should return 400 if showtime overlaps', async () => {
      showtimeService.createShowtime.mockRejectedValue(
        new Error('Showtime overlaps with an existing showtime in the same theater.')
      );
      const res = await request(app).post('/showtimes').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/overlaps/);
    });

    it('should return 400 if duration is incorrect', async () => {
      showtimeService.createShowtime.mockRejectedValue(
        new Error('Showtime length does not match the movie duration.')
      );
      const res = await request(app).post('/showtimes').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/duration/);
    });

    it('should return 400 if movie does not exist', async () => {
      showtimeService.createShowtime.mockRejectedValue(
        new Error('Cannot create showtime for a non-existing movie.')
      );
      const res = await request(app).post('/showtimes').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/non-existing movie/);
    });

    it('should return 500 on unknown error', async () => {
      showtimeService.createShowtime.mockRejectedValue(new Error('DB crash'));
      const res = await request(app).post('/showtimes').send(dummyShowtimeInput);
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  // ------------------------------------------------------------
  // GET /showtimes/:showtimeId (Fetch Showtime By Id)
  // ------------------------------------------------------------
  describe('GET /showtimes/:showtimeId', () => {
    it('should return showtime if found', async () => {
      showtimeService.getShowtimeById.mockResolvedValue(dummyShowtimeResponse);
      const res = await request(app).get('/showtimes/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...dummyShowtimeResponse,
        startTime: dummyShowtimeInput.startTime.toISOString(),
        endTime: dummyShowtimeInput.endTime.toISOString(),
      });
    });

    it('should return 404 if not found', async () => {
      showtimeService.getShowtimeById.mockRejectedValue(new Error('Showtime not found'));
      const res = await request(app).get('/showtimes/99');
      expect(res.status).toBe(404);
    });

    it('should return 500 on server error', async () => {
      showtimeService.getShowtimeById.mockRejectedValue(new Error('Unexpected error'));
      const res = await request(app).get('/showtimes/99');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  // ------------------------------------------------------------
  // POST /showtimes/update/:showtimeId (Update Showtime Details)
  // ------------------------------------------------------------
  describe('POST /showtimes/update/:showtimeId', () => {
    it('should return 200 on valid update', async () => {
      showtimeService.updateShowtime.mockResolvedValue();
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(200);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app).post('/showtimes/update/1').send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"movieId" is required/);
    });

    it('should return 404 if not found', async () => {
      showtimeService.updateShowtime.mockRejectedValue(new Error('Showtime not found'));
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(404);
    });

    it('should return 400 if already ended', async () => {
      showtimeService.updateShowtime.mockRejectedValue(
        new Error('Cannot update a showtime that has already ended.')
      );
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already ended/);
    });

    it('should return 400 if tickets sold', async () => {
      showtimeService.updateShowtime.mockRejectedValue(
        new Error('Cannot update a showtime that already has tickets sold.')
      );
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/tickets sold/);
    });

    it('should return 400 if overlaps', async () => {
      showtimeService.updateShowtime.mockRejectedValue(
        new Error('Updated showtime overlaps with an existing showtime in the same theater.')
      );
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/overlaps/);
    });

    it('should return 400 if duration wrong', async () => {
      showtimeService.updateShowtime.mockRejectedValue(
        new Error('Updated showtime length does not match the movie duration.')
      );
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/duration/);
    });

    it('should return 400 if movie not found', async () => {
      showtimeService.updateShowtime.mockRejectedValue(
        new Error('Cannot update showtime to a non-existing movie.')
      );
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/non-existing movie/);
    });

    it('should return 500 on server error', async () => {
      showtimeService.updateShowtime.mockRejectedValue(new Error('DB fail'));
      const res = await request(app).post('/showtimes/update/1').send(dummyShowtimeInput);
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  // ------------------------------------------------------------
  // DELETE /showtimes/:showtimeId (Delete Showtime)
  // ------------------------------------------------------------
  describe('DELETE /showtimes/:showtimeId', () => {
    it('should return 200 on successful delete', async () => {
      showtimeService.deleteShowtime.mockResolvedValue();
      const res = await request(app).delete('/showtimes/1');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      showtimeService.deleteShowtime.mockRejectedValue(new Error('Showtime not found'));
      const res = await request(app).delete('/showtimes/99');
      expect(res.status).toBe(404);
    });

    it('should return 400 if already ended', async () => {
      showtimeService.deleteShowtime.mockRejectedValue(
        new Error('Cannot delete a showtime that has already ended.')
      );
      const res = await request(app).delete('/showtimes/1');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already ended/);
    });

    it('should return 400 if has tickets', async () => {
      showtimeService.deleteShowtime.mockRejectedValue(
        new Error('Cannot delete showtime that has existing ticket bookings.')
      );
      const res = await request(app).delete('/showtimes/1');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/existing ticket/);
    });

    it('should return 500 on unknown error', async () => {
      showtimeService.deleteShowtime.mockRejectedValue(new Error('Random crash'));
      const res = await request(app).delete('/showtimes/1');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });
});
