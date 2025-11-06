import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import TicketRegistration from './components/TicketRegistration';
import TicketList from './components/TicketList';
import Login from './components/Login';
import Register from './components/Register';
import { eventAPI } from './services/api';
import './App.css';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1>Event Registration & Ticketing Platform</h1>
      <div className="nav-links">
        <Link to="/">Events</Link>
        <Link to="/create-event">Create Event</Link>
        <Link to="/tickets">My Tickets</Link>
        {user ? (
          <>
            <span className="user-welcome">Welcome, {user.fullName}</span>
            <button onClick={logout} className="btn btn-secondary btn-small">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await eventAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      setError('Failed to load events: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <div className="container">
            {loading ? (
              <div className="loading">Loading events...</div>
            ) : error ? (
              <div className="error-message">
                {error}
                <button onClick={fetchEvents} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<EventList events={events} onEventUpdate={fetchEvents} />} />
                <Route path="/create-event" element={<EventForm onEventCreated={fetchEvents} />} />
                <Route path="/edit-event/:id" element={<EventForm onEventCreated={fetchEvents} />} />
                <Route path="/register/:eventId" element={<TicketRegistration onTicketCreated={fetchEvents} />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            )}
          </div>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;