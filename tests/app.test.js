import request from 'supertest';
import app from '../app.js';

describe('app', () => {
  test('POST /logs should create a new log entry', async () => {
    const logEntry = {
      service_name: 'test-service',
      timestamp: new Date().toISOString(),
      message: 'test log message 1'
    };

    const response = await request(app)
      .post('/logs')
      .send(logEntry);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('log entry store success');
  });

  test('POST /logs should return 400 for missing fields', async () => {
    const invalidLog = {
      service_name: 'test-service',
    };

    const response = await request(app)
      .post('/logs')
      .send(invalidLog);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('missing fields');
  });

  test('GET /logs should return logs for a service within time range', async () => {
    const now = new Date();
    const testLogs = [
      {
        service_name: 'query',
        timestamp: new Date(now.getTime() - 10000).toISOString(), // 5 seconds ago
        message: 'test log 1'
      },
      {
        service_name: 'query',
        timestamp: new Date(now.getTime() - 5000).toISOString(), // 3 seconds ago
        message: 'test log 2'
      }
    ];

    for (const log of testLogs) {
      await request(app).post('/logs').send(log);
    }

    // query
    const startTime = new Date(now.getTime() - 20000).toISOString();
    const endTime = new Date().toISOString(); // now

    const response = await request(app)
      .get('/logs')
      .query({
        service: 'query',
        start: startTime,
        end: endTime
      });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0].message).toBe('test log 1'); // Should be sorted by timestamp
    expect(response.body[1].message).toBe('test log 2');
  });

  test('GET /logs should return 400 for invalid time range', async () => {
    const response = await request(app)
      .get('/logs')
      .query({
        service: 'query',
        start: 'invalid-date',
        end: new Date().toISOString()
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('invalid time range');
  });
})
