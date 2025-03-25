// Import the service to test and mocked dependencies
const movieService = require('../../src/services/movieService');
const { Movie } = require('../../models');
const {
  checkOverlappingShowtime,
  updateShowtime,
  findShowtimesByMovieId,
  deleteShowtime,
} = require('../../src/services/showtimeService');
const { findTicketsByShowtimeId } = require('../../src/services/bookingService');

// Mock all used model/service methods
jest.mock('../../models', () => ({
  Movie: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../src/services/showtimeService', () => ({
  checkOverlappingShowtime: jest.fn(),
  updateShowtime: jest.fn(),
  findShowtimesByMovieId: jest.fn(),
  deleteShowtime: jest.fn(),
}));

jest.mock('../../src/services/bookingService', () => ({
  findTicketsByShowtimeId: jest.fn(),
}));

describe('movieService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------------
  // createMovie
  // --------------------------------------------------------
  describe('createMovie', () => {
    it('should throw an error if movie with same title already exists', async () => {
      Movie.findOne.mockResolvedValue({ id: 999, title: 'Existing Movie' });

      const newMovieData = { title: 'Existing Movie' };

      await expect(movieService.createMovie(newMovieData)).rejects.toThrow(
        'Movie already exists with this title.'
      );
    });

    it('should create and return the movie if no existing movie found', async () => {
      Movie.findOne.mockResolvedValue(null);
      Movie.create.mockResolvedValue({ id: 1, title: 'New Movie' });

      const newMovieData = { title: 'New Movie' };
      const result = await movieService.createMovie(newMovieData);

      expect(Movie.findOne).toHaveBeenCalledWith({ where: { title: 'New Movie' } });
      expect(Movie.create).toHaveBeenCalledWith(newMovieData);
      expect(result).toEqual({ id: 1, title: 'New Movie' });
    });
  });

  // --------------------------------------------------------
  // getAllMovies
  // --------------------------------------------------------
  describe('getAllMovies', () => {
    it('should return an array of movies', async () => {
      Movie.findAll.mockResolvedValue([
        { id: 1, title: 'Movie1' },
        { id: 2, title: 'Movie2' },
      ]);

      const movies = await movieService.getAllMovies();
      expect(Movie.findAll).toHaveBeenCalled();
      expect(movies).toHaveLength(2);
      expect(movies[0].title).toBe('Movie1');
    });
  });

  // --------------------------------------------------------
  // updateMovie
  // --------------------------------------------------------
  describe('updateMovie', () => {
    it('should throw "Movie not found" if the movie does not exist', async () => {
      Movie.findOne.mockResolvedValue(null);

      await expect(movieService.updateMovie('NonExistent', {})).rejects.toThrow('Movie not found');
    });

    it('should throw error if renaming the movie', async () => {
      Movie.findOne.mockResolvedValue({
        id: 10,
        title: 'Original Title',
        duration: 120,
        update: jest.fn(),
      });

      const data = { title: 'New Title' };

      await expect(movieService.updateMovie('Original Title', data)).rejects.toThrow(
        'Renaming the movie is not allowed.'
      );
    });

    it('should handle duration increase & showtime conflicts', async () => {
      const mockMovie = {
        id: 10,
        title: 'Original Title',
        duration: 100,
        update: jest.fn(),
      };
      Movie.findOne.mockResolvedValue(mockMovie);

      findShowtimesByMovieId.mockResolvedValue([
        { id: 101, startTime: '2025-05-01T10:00:00Z', endTime: '2025-05-01T11:40:00Z' },
        { id: 102, startTime: '2025-06-01T10:00:00Z', endTime: '2025-06-01T11:40:00Z' },
      ]);

      jest.fn().mockReturnValue(false);

      const data = { duration: 120 };

      await movieService.updateMovie('Original Title', data);

      expect(findShowtimesByMovieId).toHaveBeenCalledWith(10);
      expect(updateShowtime).toHaveBeenCalledTimes(2);
      expect(mockMovie.update).toHaveBeenCalledWith(data);
    });

    it('should just update the movie if new duration is not bigger', async () => {
      const mockMovie = {
        id: 10,
        title: 'Original Title',
        duration: 100,
        update: jest.fn(),
      };
      Movie.findOne.mockResolvedValue(mockMovie);

      const data = { genre: 'Action' };
      await movieService.updateMovie('Original Title', data);

      expect(findShowtimesByMovieId).not.toHaveBeenCalled();
      expect(mockMovie.update).toHaveBeenCalledWith(data);
    });

    it('should throw an error if new duration causes showtime conflict', async () => {
      const mockMovie = {
        id: 10,
        title: 'Original Title',
        duration: 100,
        update: jest.fn(),
      };
      Movie.findOne.mockResolvedValue(mockMovie);

      findShowtimesByMovieId.mockResolvedValue([
        { id: 101, startTime: '2025-05-01T10:00:00Z', endTime: '2025-05-01T11:40:00Z' },
      ]);

      checkOverlappingShowtime.mockResolvedValue(true);
      const data = { duration: 150 };

      await expect(movieService.updateMovie('Original Title', data)).rejects.toThrow(
        'Movie duration update failed due to scheduling conflicts.'
      );

      expect(findShowtimesByMovieId).toHaveBeenCalledWith(10);
      expect(updateShowtime).not.toHaveBeenCalled();
      expect(mockMovie.update).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------
  // deleteMovie
  // --------------------------------------------------------
  describe('deleteMovie', () => {
    it('should throw error if movie not found', async () => {
      Movie.findOne.mockResolvedValue(null);
      await expect(movieService.deleteMovie('NoSuchMovie')).rejects.toThrow('Movie not found');
    });

    it('should throw if any future showtime has tickets', async () => {
      const mockMovie = { id: 10, title: 'Future Movie' };
      Movie.findOne.mockResolvedValue(mockMovie);

      findShowtimesByMovieId.mockResolvedValue([
        { id: 101, endTime: new Date(Date.now() - 10000) },
        { id: 102, endTime: new Date(Date.now() + 9999999) },
      ]);

      findTicketsByShowtimeId.mockResolvedValueOnce([{ id: 500 }]);

      await expect(movieService.deleteMovie('Future Movie')).rejects.toThrow(
        'Cannot delete movie, this movie has upcoming showtimes for which tickets have already been sold.'
      );
    });

    it('should delete future showtimes if no tickets, then delete the movie', async () => {
      const mockMovie = {
        id: 10,
        title: 'Empty Future Movie',
        destroy: jest.fn().mockResolvedValue(1),
      };
      Movie.findOne.mockResolvedValue(mockMovie);

      findShowtimesByMovieId.mockResolvedValue([
        { id: 101, endTime: new Date(Date.now() + 9999999) },
        { id: 102, endTime: new Date(Date.now() - 10000) },
      ]);
      findTicketsByShowtimeId.mockResolvedValue([]);

      await movieService.deleteMovie('Empty Future Movie');

      expect(deleteShowtime).toHaveBeenCalledWith(101);
      expect(deleteShowtime).not.toHaveBeenCalledWith(102);
      expect(mockMovie.destroy).toHaveBeenCalled();
    });
  });
});
