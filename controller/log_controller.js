import log_store from "../models/log_store";
import {parseTimeRange} from "../utils/data_utils";

/**
 * Handle log ingestion request.
 */
export function saveLogEntry(request, response) {
  const logEntry = request.body;
  if (!logEntry || !logEntry.service_name || !logEntry.timestamp) {
    return response.status(400).json({
      error: "missing fields"
    });
  }

  const success = log_store.storeLog(logEntry);
  if (!success) {
    return response.status(400).json({
      error: "log invalid"
    })
  }
  return response.status(200).json({
    message: "log entry store success"
  })
}


/**
 * Handle log query request.
 */
export function getLogEntries(request, response) {
  const {service, start, end} = request.query;
  if (!service || !start || !end) {
    return response.status(400).json({
      error: "missing fields"
    })
  }

  const timeRange = parseTimeRange(start, end);
  if (!timeRange) {
    return response.status(400).json({
      error: "invalid time range"
    })
  }

  const {startTime, endTime} = timeRange;
  const logEntries = log_store.queryLogs(service, startTime, endTime);
  return response.status(200).json(logEntries);
}
