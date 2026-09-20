import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const Navigation = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
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
