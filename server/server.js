const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_ticketing';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB database connection established successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Import Routes
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');

// Use Routes
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Event Ticketing API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});