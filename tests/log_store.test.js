import log_store from '../models/log_store.js';
import {jest} from '@jest/globals';

// use a fake timer for log expiration
beforeEach(() => {
  jest.useFakeTimers('modern');
});

// clear previous log entries after testing
afterEach(() => {
  log_store.logs.clear();
  jest.clearAllTimers();
  jest.useRealTimers();
})

describe('LogStore', () => {
  test('storeLog should save a valid log entry', () => {
    const logEntry = {
      service_name: 'test-service',
      timestamp: '2025-03-29T18:32:00Z',
      message: 'test message'
    };

    const result = log_store.storeLog(logEntry);
    expect(result).toBe(true);
  });

  test('storeLog should reject invalid log entries', () => {
    const invalidLogs = [
      { timestamp: '2025-03-17T10:15:00Z', message: 'missing service_name' },
      { service_name: 'test', message: 'missing timestamp' },
      { service_name: 'test', timestamp: 'invalid', message: 'invalid timestamp' }
    ];

    for (const log of invalidLogs) {
      const result = log_store.storeLog(log);
      expect(result).toBe(false);
    }
  });

  test('queryLogs should return an empty array for non-existent service', () => {
    const result = log_store.queryLogs('not-exist', new Date(), new Date());
    expect(result).toEqual([]);
  });

  test('queryLogs should return logs within a time range', () => {
    const testLogs = [
      {
        service_name: 'query',
        timestamp: '2025-03-29T18:00:00Z',
        message: 'test log 1'
      },
      {
        service_name: 'query',
        timestamp: '2025-03-29T18:30:00Z',
        message: 'test log 2'
      },
      {
        service_name: 'query',
        timestamp: '2025-03-29T19:00:00Z',
        message: 'test log 3'
      }
    ];

    testLogs.forEach(log => log_store.storeLog(log))
    const start = new Date('2025-03-29T18:20:00Z');
    const end = new Date('2025-03-29T19:10:00Z');
    const result = log_store.queryLogs('query', start, end);

    expect(result.length).toBe(2);
    expect(result[0].message).toBe('test log 2');
    expect(result[1].message).toBe('test log 3');
  });

  test('cleanup should remove old log entries', () => {
    const baseTime = Date.now() - 61 * 60 * 1000;
    const logEntry = {
      service_name: 'cleanup',
      timestamp: new Date(baseTime).toISOString(),
      message: 'this entry should expire'
    };

    log_store.storeLog(logEntry);
    expect(log_store.queryLogs('cleanup', new Date(baseTime - 1000), new Date(baseTime + 1000)).length).toBe(1);

    log_store.doCleanup();
    expect(log_store.queryLogs('cleanup', new Date(baseTime - 1000), new Date(baseTime + 1000)).length).toBe(0);
  });

  test('cleanup should preserve recent log entries', () => {
    const baseTime = Date.now() - 61 * 60 * 1000;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const logEntry = {
        service_name: 'cleanup',
        timestamp: new Date(baseTime + i * 1000).toISOString(),
        message: `old test log ${i}`
      };
      log_store.storeLog(logEntry);
    }

    for (let i = 0; i < count; i++) {
      const logEntry = {
        service_name: 'cleanup',
        timestamp: new Date(baseTime + (30 * 60 + i) * 1000).toISOString(),
        message: `new test log ${i}`
      };
      log_store.storeLog(logEntry);
    }

    const allLogs = log_store.queryLogs(
      'cleanup',
      new Date(baseTime - 24 * 60 * 60 * 1000),
      new Date(baseTime + 24 * 60 * 60 * 1000)
    );
    expect(allLogs.length).toBe(count * 2);

    log_store.doCleanup();
    const updated = log_store.queryLogs(
      'cleanup',
      new Date(baseTime - 24 * 60 * 60 * 1000),
      new Date(baseTime + 24 * 60 * 60 * 1000)
    );

    expect(updated.length).toBe(count);
    updated.forEach(log => {
      expect(log.message).toMatch(/^new test log/);
    });
  });
})
