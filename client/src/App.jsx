import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const Navigation = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  // If user is on an admin route, let AdminLayout handle all headers and navigation
  if (window.location.pathname.startsWith('/admin')) return null;
  return (
    <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
      <span>Logged in as: {user.name} ({user.role})</span>
      <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
