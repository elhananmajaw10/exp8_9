// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// ✅ CORS CONFIGURATION
// ==============================
// Allow Render front-end URL and localhost during development. We read the
// allowed front-end URL from FRONTEND_URL so you can change it per environment.
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://exp8-9-2.onrender.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true
}));

// ==============================
// ✅ MIDDLEWARE
// ==============================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==============================
// ✅ ROUTES
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

// ==============================
// ✅ TEST ROUTES
// ==============================
app.get('/', (req, res) => {
  res.json({ message: 'Event Ticketing API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working fine!' });
});

// ==============================
// ✅ DATABASE CONNECTION
// ==============================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_ticketing';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB database connection established successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ==============================
// ✅ START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
