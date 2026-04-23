const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

// ✅ CORS: allow all origins with proper headers for Authorization
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

// Root health check (used by Render uptime monitor)
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Lost & Found API Running' }));

// Env debug (remove before production)
app.get('/api/test-env', (req, res) => {
  res.json({
    hasMongo: !!process.env.MONGO_URI,
    hasJWT: !!process.env.JWT_SECRET,
    port: process.env.PORT || '(default 5000)'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ msg: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
