# Weather API Assignment

A TypeScript-based Express API with Docker and Redis integration.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=3000
REDIS_URL=redis://localhost:6379
```

## Development

To run the application in development mode:
```bash
npm run dev
```

## Docker Setup

To run the application using Docker:
```bash
docker-compose up --build
```

This will start both the Express application and Redis server.

## API Endpoints

- `GET /`: Test endpoint that demonstrates Redis connection

## Building for Production

```bash
npm run build
```

The compiled JavaScript files will be in the `dist` directory.