// Import utility functions to test
const {
  isDateInThePast,
  calculateEndTime,
  matchesExactDuration,
  differenceInMinutes,
} = require('../../src/utils/timeHelpers');

describe('timeHelpers', () => {
  // --------------------------------------------------------
  // isDateInThePast
  // --------------------------------------------------------
  describe('isDateInThePast', () => {
    it('should return true for a past date', () => {
      const past = new Date(Date.now() - 10000);
      expect(isDateInThePast(past)).toBe(true);
    });

    it('Should return false for a future date', () => {
      const future = new Date(Date.now() + 10000);
      expect(isDateInThePast(future)).toBe(false);
    });
  });

  // --------------------------------------------------------
  // calculateEndTime
  // --------------------------------------------------------
  describe('calculateEndTime', () => {
    it('should add duration in minutes to start time', () => {
      const startTime = new Date('2025-01-01T10:00:00Z');
      const duration = 30;
      const result = calculateEndTime(startTime, duration);
      expect(result.toISOString().split('.')[0] + 'Z').toBe('2025-01-01T10:30:00Z');
    });

    it('should correctly handle durations over an hour', () => {
      const startTime = new Date('2025-01-01T10:00:00Z');
      const duration = 90;
      const result = calculateEndTime(startTime, duration);
      expect(result.toISOString().split('.')[0] + 'Z').toBe('2025-01-01T11:30:00Z');
    });
  });

  // --------------------------------------------------------
  // differenceInMinutes
  // --------------------------------------------------------
  describe('differenceInMinutes', () => {
    it('should correctly calculate the difference in minutes between two dates', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T11:45:00Z');
      expect(differenceInMinutes(start, end)).toBe(105);
    });

    it('should return negative if end is before start', () => {
      const start = new Date('2025-01-01T11:00:00Z');
      const end = new Date('2025-01-01T10:30:00Z');
      expect(differenceInMinutes(start, end)).toBe(-30);
    });
  });

  // --------------------------------------------------------
  // differenceInMinutes
  // --------------------------------------------------------
  describe('matchesExactDuration', () => {
    it('should return true for exact match in minutes', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T10:45:00Z');
      expect(matchesExactDuration(start, end, 45)).toBe(true);
    });

    it('should return false if duration does not match', () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T10:30:00Z');
      expect(matchesExactDuration(start, end, 45)).toBe(false);
    });
  });
});
