import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketAPI, eventAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TicketRegistration = ({ onTicketCreated }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('TicketRegistration mounted with eventId:', eventId);
    
    if (eventId) {
      if (eventId.length !== 24) {
        setError('Invalid event ID format');
        return;
      }
      fetchEvent();
    }
  }, [eventId]);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      setError('Please log in to register for events');
    }
  }, [user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching event for registration with ID:', eventId);
      
      const response = await eventAPI.getById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Error loading event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to register for events');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const ticketData = {
        ...formData,
        eventId: eventId,
        userId: user.id, // Add user ID
        quantity: parseInt(formData.quantity)
      };

      console.log('Submitting ticket data:', ticketData);

      const response = await ticketAPI.create(ticketData);
      alert(`Registration successful! Your ticket number is: ₹{response.data.ticketNumber}`);
      onTicketCreated();
      navigate('/tickets');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering for event: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="registration-page">
        <div className="container">
          <div className="error-message">
            {error}
            <br />
            {!user && (
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{marginTop: '1rem'}}>
                Go to Login
              </button>
            )}
            <button onClick={() => navigate('/')} className="btn btn-secondary" style={{marginTop: '1rem', marginLeft: '0.5rem'}}>
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="registration-page">
        <div className="container">
          <div className="loading">Loading event...</div>
        </div>
      </div>
    );
  }

  const totalAmount = event.price * formData.quantity;

  return (
    <div className="registration-page">
      <div className="container">
        <div className="registration-form">
          <h2>Register for: {event.title}</h2>
          
          {user && (
            <div className="user-info">
              <p>Logged in as: <strong>{user.fullName}</strong> ({user.email})</p>
            </div>
          )}
          
          <div className="event-summary">
            <h3>Event Details</h3>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Price per ticket:</strong> ₹{event.price}</p>
            <p><strong>Available tickets:</strong> {event.availableTickets}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <h3>Attendee Information</h3>
            
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="attendeeName"
                value={formData.attendeeName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter attendee's full name"
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="attendeeEmail"
                value={formData.attendeeEmail}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter attendee's email"
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="attendeePhone"
                value={formData.attendeePhone}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter attendee's phone number"
              />
            </div>

            <div className="form-group">
              <label>Number of Tickets:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max={event.availableTickets}
                required
                disabled={loading}
              />
              <small>Maximum {event.availableTickets} tickets available</small>
            </div>

            <div className="order-summary">
              <h4>Order Summary</h4>
              <p>Tickets: {formData.quantity} x ₹{event.price}</p>
              <p><strong>Total Amount: ₹{totalAmount}</strong></p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading || !user}>
                {loading ? 'Processing...' : 'Confirm Registration'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketRegistration;