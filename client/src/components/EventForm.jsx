import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EventForm = ({ onEventCreated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    totalTickets: '',
    category: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is authenticated for creating events
  if (!user && !isEdit) {
    return (
      <div className="create-event-page">
        <div className="container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>Please log in to create events.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('EventForm mounted with ID:', id, 'isEdit:', isEdit);
    
    if (isEdit && id) {
      // Check if the ID looks like a valid MongoDB ObjectId
      if (id.length !== 24) {
        setError('Invalid event ID format');
        return;
      }
      fetchEvent();
    }
  }, [id, isEdit]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching event with ID:', id);
      
      const response = await eventAPI.getById(id);
      const event = response.data;
      console.log('Event data received:', event);
      
      // Format date for input field (YYYY-MM-DD)
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: formattedDate,
        time: event.time || '',
        venue: event.venue || '',
        price: event.price?.toString() || '0',
        totalTickets: event.totalTickets?.toString() || '1',
        category: event.category || '',
        imageUrl: event.imageUrl || ''
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication for creating events
    if (!user && !isEdit) {
      setError('Please log in to create events');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert string values to appropriate types
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        venue: formData.venue.trim(),
        price: parseFloat(formData.price) || 0,
        totalTickets: parseInt(formData.totalTickets) || 1,
        category: formData.category,
        imageUrl: formData.imageUrl.trim()
      };

      console.log('Submitting data:', submitData);

      if (isEdit) {
        await eventAPI.update(id, submitData);
        alert('Event updated successfully!');
      } else {
        await eventAPI.create(submitData);
        alert('Event created successfully!');
      }
      
      if (onEventCreated) {
        onEventCreated();
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setError('Failed to save event: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="create-event-page">
        <div className="container">
          <div className="loading">Loading event data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <div className="container">
        <div className="event-form">
          <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
          
          {error && (
            <div className="error-message">
              {error}
              <br />
              {isEdit && (
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{marginTop: '1rem'}}>
                  Back to Events
                </button>
              )}
            </div>
          )}

          {!error && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter event title"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your event"
                  disabled={loading}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time:</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue:</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  placeholder="Enter venue location"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (₹):</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="totalTickets">Total Tickets:</label>
                  <input
                    type="number"
                    id="totalTickets"
                    name="totalTickets"
                    value={formData.totalTickets}
                    onChange={handleChange}
                    min="1"
                    required
                    placeholder="100"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Food & Drink">Food & Drink</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL (optional):</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
                <small>Provide a URL for event image (optional)</small>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EventForm;