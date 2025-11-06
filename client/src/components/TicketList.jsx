import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      // Get tickets for the current user
      const response = await ticketAPI.getMyTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Error loading tickets: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (ticketId) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      try {
        await ticketAPI.delete(ticketId);
        await fetchTickets();
        alert('Ticket cancelled successfully');
      } catch (error) {
        alert('Error cancelling ticket: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="tickets-page">
        <h2>My Tickets</h2>
        <div className="error-message">
          Please log in to view your tickets.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tickets-page">
        <h2>My Tickets</h2>
        <div className="loading">Loading your tickets...</div>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <h2>My Tickets</h2>
      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>No tickets found. Register for an event to see your tickets here!</p>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map(ticket => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <h3>Ticket #: {ticket.ticketNumber}</h3>
                <span className={`status ₹{ticket.status}`}>
                  {ticket.status}
                </span>
              </div>
              
              <div className="ticket-details">
                <div className="event-info">
                  <h4>Event Information</h4>
                  <p><strong>Event:</strong> {ticket.eventId?.title || 'Event not found'}</p>
                  <p><strong>Date:</strong> {ticket.eventId ? formatDate(ticket.eventId.date) : 'N/A'}</p>
                  <p><strong>Venue:</strong> {ticket.eventId?.venue || 'N/A'}</p>
                </div>
                
                <div className="attendee-info">
                  <h4>Attendee Information</h4>
                  <p><strong>Name:</strong> {ticket.attendeeName}</p>
                  <p><strong>Email:</strong> {ticket.attendeeEmail}</p>
                  <p><strong>Phone:</strong> {ticket.attendeePhone}</p>
                </div>
                
                <div className="order-info">
                  <h4>Order Details</h4>
                  <p><strong>Quantity:</strong> {ticket.quantity}</p>
                  <p><strong>Total Amount:</strong> ₹{ticket.totalAmount}</p>
                  <p><strong>Purchase Date:</strong> {formatDate(ticket.purchaseDate)}</p>
                </div>
              </div>
              
              <div className="ticket-actions">
                <button 
                  onClick={() => handleCancel(ticket._id)}
                  className="btn btn-danger"
                >
                  Cancel Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;