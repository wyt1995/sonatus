// util functions for date format

/**
 * Check whether a timestamp string is valid.
 * @param {string} timestamp in ISO format
 * @return {boolean}
 */
export function isValidTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Parse and validate a time range.
 * @param {string} start
 * @param {string} end
 * @return {{startTime: Date, endTime: Date}|null} null if invalid
 */
export function parseTimeRange(start, end) {
  if (!start || !end) {
    return null;
  }

  const startTime = new Date(start);
  const endTime = new Date(end);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return null;
  }
  if (startTime > endTime) {
    return null;
  }

  return { startTime, endTime };
}
