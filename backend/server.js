const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

app.get('/', (req, res) => res.send('Lost & Found API Running'));

app.get('/api/test-env', (req, res) => {
  res.json({
    hasMongo: !!process.env.MONGO_URI,
    hasJWT: !!process.env.JWT_SECRET,
    hasPort: !!process.env.PORT
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
