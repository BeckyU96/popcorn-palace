// Returns true if the given date is in the past
function isDateInThePast(date) {
  return new Date(date) < new Date();
}

// Calculates the end time by adding duration to the given start time
function calculateEndTime(startTime, duration) {
  const newEndTime = new Date(startTime);
  newEndTime.setMinutes(newEndTime.getMinutes() + duration);
  return newEndTime;
}

// Returns the difference between two times in minutes
function differenceInMinutes(startTime, endTime) {
  return (new Date(endTime) - new Date(startTime)) / (60 * 1000);
}

// Checks if the difference between start and end times exactly matches the given duration
function matchesExactDuration(startTime, endTime, durationInMinutes) {
  const diff = differenceInMinutes(startTime, endTime);
  return diff === durationInMinutes;
}

module.exports = {
  isDateInThePast,
  calculateEndTime,
  differenceInMinutes,
  matchesExactDuration,
};
