// Import the service to test and its dependencies
const showtimeService = require('../../src/services/showtimeService');
const { Showtime } = require('../../models');
const dbQueries = require('../../src/services/dbQueries');
const { matchesExactDuration, isDateInThePast } = require('../../src/utils/timeHelpers');

// Mock all external dependencies
jest.mock('../../models', () => ({
  Showtime: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../src/services/dbQueries', () => ({
  findMovieById: jest.fn(),
  findTicketsByShowtimeId: jest.fn(),
}));

jest.mock('../../src/utils/timeHelpers', () => ({
  matchesExactDuration: jest.fn(),
  isDateInThePast: jest.fn(),
}));

describe('showtimeService', () => {
  afterEach(() => jest.clearAllMocks());
  // --------------------------------------------------------
  // getShowtimeById
  // --------------------------------------------------------
  describe('getShowtimeById', () => {
    it('should return showtime if found', async () => {
      Showtime.findByPk.mockResolvedValue({ id: 1 });
      const result = await showtimeService.getShowtimeById(1);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw if not found', async () => {
      Showtime.findByPk.mockResolvedValue(null);
      await expect(showtimeService.getShowtimeById(999)).rejects.toThrow('Showtime not found');
    });
  });

  // --------------------------------------------------------
  // findShowtimesByMovieId
  // --------------------------------------------------------
  describe('findShowtimesByMovieId', () => {
    it('should return all showtimes for a movie', async () => {
      Showtime.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await showtimeService.findShowtimesByMovieId(1);
      expect(result.length).toBe(2);
    });
  });

  // --------------------------------------------------------
  // checkOverlappingShowtime
  // --------------------------------------------------------
  describe('checkOverlappingShowtime', () => {
    it('should find overlapping showtime', async () => {
      Showtime.findOne.mockResolvedValue({ id: 99 });
      const result = await showtimeService.checkOverlappingShowtime('Theater 1', 'start', 'end');
      expect(result).toEqual({ id: 99 });
    });

    it('should return null if no overlap', async () => {
      Showtime.findOne.mockResolvedValue(null);
      const result = await showtimeService.checkOverlappingShowtime('Theater 1', 'start', 'end');
      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------------
  // createShowtime
  // --------------------------------------------------------
  describe('createShowtime', () => {
    it('should throw if movie not found', async () => {
      dbQueries.findMovieById.mockResolvedValue(null);
      await expect(showtimeService.createShowtime({ movieId: 1 })).rejects.toThrow(
        'Cannot create showtime for a non-existing movie.'
      );
    });

    const mockShowtime = { movieId: 1, startTime: 'x', endTime: 'y', theater: 'A' };
    it('should throw if duration does not match', async () => {
      dbQueries.findMovieById.mockResolvedValue({ duration: 90 });
      matchesExactDuration.mockReturnValue(false);
      await expect(showtimeService.createShowtime(mockShowtime)).rejects.toThrow(
        'Showtime length does not match the movie duration.'
      );
    });

    it('should throw if showtime overlaps', async () => {
      dbQueries.findMovieById.mockResolvedValue({ duration: 90 });
      matchesExactDuration.mockReturnValue(true);
      Showtime.findOne.mockResolvedValue({ id: 123 });
      await expect(showtimeService.createShowtime(mockShowtime)).rejects.toThrow(
        'Showtime overlaps with an existing showtime in the same theater.'
      );
    });

    it('should create showtime if valid', async () => {
      dbQueries.findMovieById.mockResolvedValue({ duration: 90 });
      matchesExactDuration.mockReturnValue(true);
      Showtime.findOne.mockResolvedValue(null);
      Showtime.create.mockResolvedValue({ id: 999 });
      const result = await showtimeService.createShowtime(mockShowtime);
      expect(result).toEqual({ id: 999 });
    });
  });

  // --------------------------------------------------------
  // updateShowtime
  // --------------------------------------------------------
  describe('updateShowtime', () => {
    const mockShowtime = { id: 1, endTime: 'future', update: jest.fn() };

    it('should throw if showtime ended', async () => {
      Showtime.findByPk.mockResolvedValue(mockShowtime);
      isDateInThePast.mockReturnValue(true);
      await expect(showtimeService.updateShowtime(1, {})).rejects.toThrow(
        'Cannot update a showtime that has already ended.'
      );
    });

    it('should throw if tickets were sold', async () => {
      Showtime.findByPk.mockResolvedValue(mockShowtime);
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([{}]);
      await expect(showtimeService.updateShowtime(1, {})).rejects.toThrow(
        'Cannot update a showtime that already has tickets sold.'
      );
    });

    it('should throw if movie not found', async () => {
      Showtime.findByPk.mockResolvedValue(mockShowtime);
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([]);
      dbQueries.findMovieById.mockResolvedValue(null);
      await expect(showtimeService.updateShowtime(1, { movieId: 1 })).rejects.toThrow(
        'Cannot update showtime to a non-existing movie.'
      );
    });

    it('should throw if new duration is invalid', async () => {
      Showtime.findByPk.mockResolvedValue(mockShowtime);
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([]);
      dbQueries.findMovieById.mockResolvedValue({ duration: 90 });
      matchesExactDuration.mockReturnValue(false);
      await expect(
        showtimeService.updateShowtime(1, { movieId: 1, startTime: 'x', endTime: 'y' })
      ).rejects.toThrow('Updated showtime length does not match the movie duration.');
    });

    it('should throw if showtime overlaps', async () => {
      Showtime.findByPk.mockResolvedValue(mockShowtime);
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([]);
      dbQueries.findMovieById.mockResolvedValue({ duration: 90 });
      matchesExactDuration.mockReturnValue(true);
      Showtime.findOne.mockResolvedValue({ id: 2 });
      await expect(
        showtimeService.updateShowtime(1, {
          movieId: 1,
          startTime: 'x',
          endTime: 'y',
          theater: 'A',
        })
      ).rejects.toThrow('Updated showtime overlaps with an existing showtime in the same theater.');
    });

    it('should update showtime if everything is valid', async () => {
      Showtime.findByPk.mockResolvedValue(mockShowtime);
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([]);
      dbQueries.findMovieById.mockResolvedValue({ duration: 90 });
      matchesExactDuration.mockReturnValue(true);
      Showtime.findOne.mockResolvedValue(null);

      const data = { movieId: 1, startTime: 'x', endTime: 'y', theater: 'A' };
      const result = await showtimeService.updateShowtime(1, data);
      expect(mockShowtime.update).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockShowtime);
    });
  });

  // --------------------------------------------------------
  // deleteShowtime
  // --------------------------------------------------------
  describe('deleteShowtime', () => {
    it('should throw if showtime already ended', async () => {
      Showtime.findByPk.mockResolvedValue({ endTime: 'past' });
      isDateInThePast.mockReturnValue(true);
      await expect(showtimeService.deleteShowtime(1)).rejects.toThrow(
        'Cannot delete a showtime that has already ended.'
      );
    });

    it('should throw if tickets sold', async () => {
      Showtime.findByPk.mockResolvedValue({ endTime: 'future' });
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([{}]);
      await expect(showtimeService.deleteShowtime(1)).rejects.toThrow(
        'Cannot delete showtime that has existing ticket bookings.'
      );
    });

    it('should throw if delete fails', async () => {
      Showtime.findByPk.mockResolvedValue({ endTime: 'future' });
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([]);
      Showtime.destroy.mockResolvedValue(0);
      await expect(showtimeService.deleteShowtime(1)).rejects.toThrow('Showtime not found');
    });

    it('should delete if valid', async () => {
      Showtime.findByPk.mockResolvedValue({ endTime: 'future' });
      isDateInThePast.mockReturnValue(false);
      dbQueries.findTicketsByShowtimeId.mockResolvedValue([]);
      Showtime.destroy.mockResolvedValue(1);
      await expect(showtimeService.deleteShowtime(1)).resolves.toBeUndefined();
    });
  });
});
