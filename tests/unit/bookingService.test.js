// Import services and utilities to test
const bookingService = require('../../src/services/bookingService');
const { getShowtimeById } = require('../../src/services/showtimeService');
const { isDateInThePast } = require('../../src/utils/timeHelpers');

// Mock dependencies
jest.mock('../../models', () => ({
  Ticket: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));

jest.mock('../../src/services/showtimeService', () => ({
  getShowtimeById: jest.fn(),
}));

jest.mock('../../src/utils/timeHelpers', () => ({
  isDateInThePast: jest.fn(),
}));

describe('bookingService', () => {
  afterEach(() => jest.clearAllMocks());

  // --------------------------------------------------------
  // findTicketsByShowtimeId
  // --------------------------------------------------------
  describe('findTicketsByShowtimeId', () => {
    it('should return tickets for a showtime', async () => {
      const tickets = [{ id: 1 }, { id: 2 }];
      require('../../models').Ticket.findAll.mockResolvedValue(tickets);
      const result = await bookingService.findTicketsByShowtimeId(1);
      expect(result).toEqual(tickets);
    });
  });

  // --------------------------------------------------------
  // bookTicket
  // --------------------------------------------------------
  describe('bookTicket', () => {
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    beforeEach(() => {
      require('../../models').sequelize.transaction.mockResolvedValue(mockTransaction);
    });

    it('should throw if showtime already ended', async () => {
      getShowtimeById.mockResolvedValue({ endTime: '2020-01-01' });
      isDateInThePast.mockReturnValue(true);

      await expect(
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'abc' })
      ).rejects.toThrow('Showtime has already ended. Cannot book ticket.');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw if seat is already booked', async () => {
      getShowtimeById.mockResolvedValue({ endTime: '2025-01-01' });
      isDateInThePast.mockReturnValue(false);
      require('../../models').Ticket.findOne.mockResolvedValue(true);

      await expect(
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'abc' })
      ).rejects.toThrow('Seat is already booked for this showtime.');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should create ticket and commit if valid', async () => {
      getShowtimeById.mockResolvedValue({ endTime: '2025-01-01' });
      isDateInThePast.mockReturnValue(false);
      require('../../models').Ticket.findOne.mockResolvedValue(null);
      require('../../models').Ticket.create.mockResolvedValue({ id: 100 });

      const result = await bookingService.bookTicket({
        showtimeId: 1,
        seatNumber: 1,
        userId: 'abc',
      });

      expect(result).toEqual({ id: 100 });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should rollback if create fails', async () => {
      getShowtimeById.mockResolvedValue({ endTime: '2025-01-01' });
      isDateInThePast.mockReturnValue(false);
      require('../../models').Ticket.findOne.mockResolvedValue(null);
      require('../../models').Ticket.create.mockRejectedValue(new Error('DB fail'));

      await expect(
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'abc' })
      ).rejects.toThrow('DB fail');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle race condition with unique constraint (simulated)', async () => {
      // Simulate two users booking the same seat at the same time
      getShowtimeById.mockResolvedValue({ endTime: '2025-01-01' });
      isDateInThePast.mockReturnValue(false);
      require('../../models').Ticket.findOne.mockResolvedValue(null);

      const error = new Error('Unique constraint error');
      error.name = 'SequelizeUniqueConstraintError';
      require('../../models').Ticket.create.mockRejectedValue(error);

      await expect(
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'user-1' })
      ).rejects.toThrow('Seat is already booked for this showtime.');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should simulate multiple users trying to book same seat (only one should win)', async () => {
      // Simulate concurrent requests for the same seat
      getShowtimeById.mockResolvedValue({ endTime: '2025-01-01' });
      isDateInThePast.mockReturnValue(false);
      require('../../models').Ticket.findOne.mockResolvedValue(null);

      // First one succeeds, others simulate unique constraint violation
      let created = false;
      require('../../models').Ticket.create.mockImplementation(({ userId }) => {
        if (created) {
          const err = new Error('duplicate');
          err.name = 'SequelizeUniqueConstraintError';
          throw err;
        } else {
          created = true;
          return { id: 100, userId };
        }
      });

      const results = await Promise.allSettled([
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'user-1' }),
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'user-2' }),
        bookingService.bookTicket({ showtimeId: 1, seatNumber: 1, userId: 'user-3' }),
      ]);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(2);
    });
  });
});
