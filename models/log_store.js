import {isValidTimestamp} from "../utils/data_utils";

class LogStore {
  constructor() {
    // map service_name to an array of log entries
    this.logs = new Map();

    // old log should expire after one hour (in milliseconds)
    this.EXPIRE = 60 * 60 * 1000;

    // start a thread to clean up expired logs
    this.logCleanup();
  }


  /**
   * Store a log entry.
   * @param {object} logEntry JSON log payload {service_name, timestamp, message}
   * @return {boolean} success status
   */
  storeLog(logEntry) {
    // check log entry representation
    if (!logEntry || !logEntry.service_name || !logEntry.timestamp) {
      return false;
    }
    if (!isValidTimestamp(logEntry.timestamp)) {
      return false;
    }

    // parse log entry to data object for easier comparison
    const entry = {
      ...logEntry,
      timestamp: new Date(logEntry.timestamp),
    }

    // push log entry
    const service = logEntry.service_name;
    if (!this.logs.has(service)) {
      this.logs.set(service, []);
    }
    const serviceLogs = this.logs.get(service);

    // use binary search to find the insertion point
    let low = 0;
    let high = serviceLogs.length;
    while (low < high) {
      const mid = low + Math.floor((high - low) / 2);
      if (serviceLogs[mid].timestamp < entry.timestamp) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    serviceLogs.splice(low, 0, entry);

    return true;
  }


  /**
   * Returns all log messages for a given service within the time range [start, end]
   * @param {string} serviceName
   * @param {Date} startTime
   * @param {Date} endTime
   * @return {Array} filtered log entries
   */
  queryLogs(serviceName, startTime, endTime) {
    if (!this.logs.has(serviceName)) {
      return [];
    }

    // binary search helper function
    function lowerBound(arr, target) {
      let low = 0;
      let high = arr.length;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (arr[mid].timestamp < target) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    }

    function upperBound(arr, target) {
      let low = 0;
      let high = arr.length;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (arr[mid].timestamp <= target) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    }

    const serviceLogs = this.logs.get(serviceName);
    const start = lowerBound(serviceLogs, startTime);
    const end = upperBound(serviceLogs, endTime);
    return serviceLogs.slice(start, end)
      .map(log => ({
        timestamp: log.timestamp.toISOString(),
        message: log.message,
      }));
  }


  doCleanup() {
    const now = Date.now();
    this.logs.forEach((serviceLogs, serviceName) => {
      const validLogs = serviceLogs.filter(log => now - log.timestamp.getTime() < this.EXPIRE);
      if (validLogs.length === 0) {
        this.logs.delete(serviceName);
      } else if (validLogs.length !== serviceLogs.length) {
        this.logs.set(serviceName, validLogs);
      }
    });
  }


  /**
   * Clean up expired log entries every 10 seconds.
   */
  logCleanup() {
    setInterval(() => {
      this.doCleanup();
    }, 10 * 1000);  // check every 10 seconds
  }
}


// singleton
const logStoreInstance = new LogStore();
export default logStoreInstance;
