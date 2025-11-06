const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Auth middleware to get user from token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Generate unique ticket number
function generateTicketNumber() {
  return 'TICK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// GET all tickets (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('eventId').populate('userId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET tickets for specific user (PROTECTED)
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get from token instead of query
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const tickets = await Ticket.find({ userId }).populate('eventId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new ticket (register for event) - PROTECTED
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, attendeeName, attendeeEmail, attendeePhone, quantity } = req.body;
    const userId = req.user.userId; // Get from token

    // Validate required fields
    if (!eventId || !attendeeName || !attendeeEmail || !attendeePhone || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const ticket = new Ticket({
      eventId: eventId,
      userId: userId,
      attendeeName: attendeeName,
      attendeeEmail: attendeeEmail,
      attendeePhone: attendeePhone,
      quantity: quantity,
      totalAmount: event.price * quantity,
      ticketNumber: generateTicketNumber()
    });

    // Update available tickets
    event.availableTickets -= quantity;
    await event.save();

    const newTicket = await ticket.save();
    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('eventId')
      .populate('userId');
    
    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE ticket (cancel registration) - PROTECTED
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('eventId');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if the ticket belongs to the authenticated user
    if (ticket.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied. You can only cancel your own tickets.' });
    }

    // Return tickets to available count
    if (ticket.status === 'confirmed') {
      ticket.eventId.availableTickets += ticket.quantity;
      await ticket.eventId.save();
    }

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;