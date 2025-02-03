const express = require('express');
const compression = require('compression'); // For compressing responses
const NodeCache = require('node-cache'); // For caching responses

const app = express();
const PORT = 3000;

// Simulated database (large array of objects)
const database = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

// Initialize a cache
const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL = 60 seconds

// Apply response compression
app.use(compression());

// Middleware to check for cached data
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedData = cache.get(key);

  if (cachedData) {
    return res.json(cachedData);
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    cache.set(key, body);
    res.sendResponse(body);
  };

  next();
};

// API Endpoint: Get all users with optional pagination
app.get('/users', cacheMiddleware, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedData = database.slice(startIndex, endIndex);
  res.json({ page, limit, total: database.length, data: paginatedData });
});
// http://localhost:3000/users?page=2&limit=5

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});