import React from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../services/api';

const EventList = ({ events, onEventUpdate }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventAPI.delete(id);
        onEventUpdate();
        alert('Event deleted successfully!');
      } catch (error) {
        alert('Error deleting event: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!events || events.length === 0) {
    return (
      <div className="events-page">
        <h2>Available Events</h2>
        <div className="empty-state">
          <p>No events found. Create your first event!</p>
          <Link to="/create-event" className="btn btn-primary">
            Create First Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <h2>Available Events</h2>
      <div className="events-grid">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <div className="event-image">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} />
              ) : (
                <div className="event-image-placeholder">No Image</div>
              )}
            </div>
            <div className="event-details">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-info">
                <p><strong>Date:</strong> {formatDate(event.date)}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Price:</strong> ₹{event.price}</p>
                <p><strong>Available Tickets:</strong> {event.availableTickets}</p>
                <p><strong>Category:</strong> {event.category}</p>
              </div>
              <div className="event-actions">
                <Link 
                  to={`/register/${event._id}`}  
                  className="btn btn-primary"
                  onClick={(e) => {
                    console.log('Register link clicked for event ID:', event._id);
                  }}
                >
                  Register Now
                </Link>
                <Link 
                  to={`/edit-event/${event._id}`}  
                  className="btn btn-secondary"
                  onClick={(e) => {
                    console.log('Edit link clicked for event ID:', event._id);
                  }}
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(event._id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;