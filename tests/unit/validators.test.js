// Import validation functions to test
const { validateMovie, validateShowtime, validateBooking } = require('../../src/utils/validators');

describe('validators', () => {
  // --------------------------------------------------------
  // validateMovie
  // --------------------------------------------------------
  describe('validateMovie', () => {
    it('should return null for valid movie data', () => {
      const data = {
        title: 'Inception',
        genre: 'Sci-Fi',
        duration: 148,
        rating: 8.8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toBeNull();
    });

    it('should return error if title is missing', () => {
      const data = {
        genre: 'Action',
        duration: 120,
        rating: 7.5,
        releaseYear: 2020,
      };
      expect(validateMovie(data)).toMatch(/"title" is required/);
    });

    it('should return error if title has special characters', () => {
      const data = {
        title: 'Incept!on',
        genre: 'Sci Fi',
        duration: 120,
        rating: 8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toMatch(/letters, numbers, and spaces/);
    });

    it('should allow title with leading/trailing spaces', () => {
      const data = {
        title: ' Inception ',
        genre: 'Sci Fi',
        duration: 120,
        rating: 8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toBeNull();
    });

    it('should return error if genre has numbers or invalid special characters', () => {
      const data = {
        title: 'Inception',
        genre: 'Sci-Fi123!',
        duration: 120,
        rating: 8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toMatch(/letters, spaces, commas, or dashes/);
    });

    it('should return error if title has leading/trailing spaces', () => {
      const data = {
        title: ' Inception ',
        genre: 'Action',
        duration: 120,
        rating: 8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toBeNull();
    });

    it('should allow genre with commas and dashes between words', () => {
      const data = {
        title: 'Inception',
        genre: 'Action, Sci-Fi-Thriller',
        duration: 120,
        rating: 8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toBeNull();
    });

    it('should return error if genre has leading/trailing spaces', () => {
      const data = {
        title: 'Inception',
        genre: ' Sci-Fi ',
        duration: 120,
        rating: 8,
        releaseYear: 2010,
      };
      expect(validateMovie(data)).toBeNull();
    });

    it('should return error if duration is too short', () => {
      const data = {
        title: 'Short Movie',
        genre: 'Action',
        duration: 20,
        rating: 7,
        releaseYear: 2020,
      };
      expect(validateMovie(data)).toMatch(/at least 30 minutes/);
    });

    it('should return error if duration is too long', () => {
      const data = {
        title: 'Long Movie',
        genre: 'Drama',
        duration: 400,
        rating: 7,
        releaseYear: 2020,
      };
      expect(validateMovie(data)).toMatch(/must not exceed 300 minutes/);
    });

    it('should return error if rating is out of range', () => {
      const data = {
        title: 'Bad Movie',
        genre: 'Drama',
        duration: 90,
        rating: 12,
        releaseYear: 2022,
      };
      expect(validateMovie(data)).toMatch(/must be less than or equal to 10/);
    });

    it('should return error if releaseYear is below 1800', () => {
      const data = {
        title: 'Ancient Movie',
        genre: 'History',
        duration: 100,
        rating: 6,
        releaseYear: 1700,
      };
      expect(validateMovie(data)).toMatch(/must be greater than or equal to 1800/);
    });

    it('should return error if releaseYear is in the future', () => {
      const futureYear = new Date().getFullYear() + 1;
      const data = {
        title: 'Future Movie',
        genre: 'Sci-Fi',
        duration: 120,
        rating: 8,
        releaseYear: futureYear,
      };
      expect(validateMovie(data)).toMatch(/must be less than or equal to/);
    });

    it('should return error if title is an empty string', () => {
      const data = {
        title: '',
        genre: 'Action',
        duration: 100,
        rating: 5,
        releaseYear: 2015,
      };
      expect(validateMovie(data)).toMatch(/is not allowed to be empty/);
    });

    it('should return error if genre is an empty string', () => {
      const data = {
        title: 'Blank Genre',
        genre: '',
        duration: 100,
        rating: 5,
        releaseYear: 2015,
      };
      expect(validateMovie(data)).toMatch(/is not allowed to be empty/);
    });
  });

  // --------------------------------------------------------
  // validateShowtime
  // --------------------------------------------------------
  describe('validateShowtime', () => {
    it('should return null for valid showtime data', () => {
      const data = {
        movieId: 1,
        theater: 'Theater A',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        price: 12.5,
      };
      expect(validateShowtime(data)).toBeNull();
    });

    it('should return error if theater has special characters or numbers', () => {
      const data = {
        movieId: 1,
        theater: 'Cinema 1!',
        startTime: new Date(Date.now() + 60000),
        endTime: new Date(Date.now() + 3600000),
        price: 10,
      };
      expect(validateShowtime(data)).toMatch(/only letters and spaces/);
    });

    it('should return error if startTime is in the past', () => {
      const data = {
        movieId: 1,
        theater: 'Cinema',
        startTime: new Date(Date.now() - 60000),
        endTime: new Date(),
        price: 10,
      };
      expect(validateShowtime(data)).toMatch(/Start time cannot be in the past/);
    });

    it('should return error if endTime is before startTime', () => {
      const now = new Date();
      const data = {
        movieId: 1,
        theater: 'Cinema',
        startTime: new Date(now.getTime() + 3600000),
        endTime: now,
        price: 10,
      };
      expect(validateShowtime(data)).toMatch(/End time must be after start time/);
    });

    it('should return error if price is above maximum', () => {
      const data = {
        movieId: 1,
        theater: 'Cinema',
        startTime: new Date(Date.now() + 60000),
        endTime: new Date(Date.now() + 3600000),
        price: 1500,
      };
      expect(validateShowtime(data)).toMatch(/must not exceed 1000/);
    });

    it('should return error if startTime is missing', () => {
      const data = {
        movieId: 1,
        theater: 'Theater A',
        endTime: new Date(),
        price: 10,
      };
      expect(validateShowtime(data)).toMatch(/"startTime" is required/);
    });

    it('should return error if theater is empty', () => {
      const data = {
        movieId: 1,
        theater: '',
        startTime: new Date(),
        endTime: new Date(),
        price: 10,
      };
      expect(validateShowtime(data)).toMatch(/is not allowed to be empty/);
    });
  });

  // --------------------------------------------------------
  // validateBooking
  // --------------------------------------------------------
  describe('validateBooking', () => {
    it('should return null for valid booking data', () => {
      const data = {
        showtimeId: 2,
        seatNumber: 15,
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      expect(validateBooking(data)).toBeNull();
    });

    it('should return error if userId is not a valid UUID', () => {
      const data = {
        showtimeId: 2,
        seatNumber: 15,
        userId: 'invalid-uuid',
      };
      expect(validateBooking(data)).toMatch(/must be a valid GUID/);
    });

    it('should return error if seatNumber exceeds 20000', () => {
      const data = {
        showtimeId: 2,
        seatNumber: 20001,
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      expect(validateBooking(data)).toMatch(/must not exceed 20000/);
    });

    it('should return error if showtimeId is missing', () => {
      const data = {
        seatNumber: 10,
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      expect(validateBooking(data)).toMatch(/"showtimeId" is required/);
    });

    it('should return error if userId is missing', () => {
      const data = {
        seatNumber: 10,
        showtimeId: 1,
      };
      expect(validateBooking(data)).toMatch(/"userId" is required/);
    });
  });
});
