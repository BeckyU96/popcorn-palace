// Import the functions to test and mocked models
const dbQueries = require('../../src/services/dbQueries');
const { Movie, Ticket } = require('../../models');

// Mock the model methods used by dbQueries
jest.mock('../../models', () => ({
  Movie: { findByPk: jest.fn() },
  Ticket: { findAll: jest.fn() },
}));

describe('dbQueries', () => {
  afterEach(() => jest.clearAllMocks());

  // --------------------------------------------------------
  // findMovieById
  // --------------------------------------------------------
  describe('findMovieById', () => {
    it('should return movie by ID', async () => {
      Movie.findByPk.mockResolvedValue({ id: 1, title: 'Inception' });
      const result = await dbQueries.findMovieById(1);
      expect(Movie.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, title: 'Inception' });
    });

    it('should return null if movie not found', async () => {
      Movie.findByPk.mockResolvedValue(null);
      const result = await dbQueries.findMovieById(999);
      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------------
  // findTicketsByShowtimeId
  // --------------------------------------------------------
  describe('findTicketsByShowtimeId', () => {
    it('should return tickets by showtimeId', async () => {
      const fakeTickets = [{ id: 1 }, { id: 2 }];
      Ticket.findAll.mockResolvedValue(fakeTickets);
      const result = await dbQueries.findTicketsByShowtimeId(5);
      expect(Ticket.findAll).toHaveBeenCalledWith({ where: { showtimeId: 5 }, transaction: null });
      expect(result).toEqual(fakeTickets);
    });

    it('should include transaction if provided', async () => {
      const fakeTransaction = { id: 'tx1' };
      await dbQueries.findTicketsByShowtimeId(5, fakeTransaction);
      expect(Ticket.findAll).toHaveBeenCalledWith({
        where: { showtimeId: 5 },
        transaction: fakeTransaction,
      });
    });

    it('should return empty array if no tickets found', async () => {
      Ticket.findAll.mockResolvedValue([]);
      const result = await dbQueries.findTicketsByShowtimeId(123);
      expect(result).toEqual([]);
    });

    it('should return an empty array if showtimeId does not exist', async () => {
      Ticket.findAll.mockResolvedValue([]); // Simulate no matching tickets
      const result = await dbQueries.findTicketsByShowtimeId(999);
      expect(result).toEqual([]);
    });
  });
});
