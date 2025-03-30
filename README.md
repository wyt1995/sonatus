# Distributed Log Aggregate

This mini-project is written for Sonatus's online assessment.

## API endpoints
This service supports the following REST API:
1. `POST /logs`
accepts a JSON object with service name, timestamp, and a log message. 
2. `GET /logs?service=<service_name>&start=<timestamp>&end=<timestamp>`
returns all log messages corresponding the given service name with in the specified time range.

## Implementation

### Structure
This project applies a modular design pattern:
- `index.js`: the entry point of the application
- `app.js`: sets up an Express application by applying JSON middleware, HTTP routing, and an error handler.
- `controllers`: handles request/response logic
- `models`: data storage and retrievel
- `utils`: middleware and helper functions
- `tests`: test cases using Jest

### Performance considerations
- In memory storage using a hash map for looking up service name in constant time
- Log query with binary search for fast retrieval.
- Automatic log expiration after 1 hour using a background cleanup thread.
- Thread-safe operations for Node.js single-threaded event loop.

## Usage 
```
# install dependencies
npm install

# start server
npm start

# development with auto-reload
npm run dev

# testing
npm test
```