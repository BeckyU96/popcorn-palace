// Import the app and required tools for integration testing
const request = require('supertest');
const app = require('../../src/app');

// Mock the booking service to isolate route logic
jest.mock('../../src/services/bookingService');
const bookingService = require('../../src/services/bookingService');

describe('/bookings integration', () => {
  afterEach(() => jest.clearAllMocks());

  const validBooking = {
    showtimeId: 1,
    seatNumber: 10,
    userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  };

  // ---------------------------------
  // POST /bookings (Book Ticket)
  // ---------------------------------
  describe('POST /bookings', () => {
    it('should return 200 and bookingId on success', async () => {
      bookingService.bookTicket.mockResolvedValue({ bookingId: 'abc-123' });

      const res = await request(app).post('/bookings').send(validBooking);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bookingId', 'abc-123');
    });

    it('should return 400 if input validation fails', async () => {
      const res = await request(app).post('/bookings').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/"showtimeId" is required/);
    });

    it('should return 404 if showtime is not found', async () => {
      bookingService.bookTicket.mockRejectedValue(new Error('Showtime not found'));

      const res = await request(app).post('/bookings').send(validBooking);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Showtime not found/);
    });

    it('should return 400 if showtime already ended', async () => {
      bookingService.bookTicket.mockRejectedValue(
        new Error('Showtime has already ended. Cannot book ticket.')
      );

      const res = await request(app).post('/bookings').send(validBooking);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already ended/);
    });

    it('should return 400 if seat is already booked', async () => {
      bookingService.bookTicket.mockRejectedValue(
        new Error('Seat is already booked for this showtime.')
      );

      const res = await request(app).post('/bookings').send(validBooking);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already booked/);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      bookingService.bookTicket.mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app).post('/bookings').send(validBooking);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
      expect(res.body.details).toBe('Database connection lost');
    });
  });
});
