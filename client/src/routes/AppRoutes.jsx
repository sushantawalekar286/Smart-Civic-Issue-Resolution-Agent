import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AnalyzeComplaint from '../pages/citizen/AnalyzeComplaint';

import ReportIssue from '../pages/citizen/ReportIssue';
import AuthorityDashboard from '../pages/authority/Dashboard';
import ComplaintDetails from '../pages/authority/ComplaintDetails';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Access Denied. You do not have permission to view this page.</div>;
  }

  return children;
};

// Placeholder dashboards to test routing
const CitizenDashboard = () => (
  <div>
    <h2>Citizen Dashboard</h2>
    <p><Link to="/citizen/report">Report a Civic Issue</Link></p>
  </div>
);
const AdminDashboard = () => <div><h2>Admin Dashboard</h2></div>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/citizen/dashboard" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/citizen/report" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <div><h2>Report Issue Placeholder</h2></div>
        </ProtectedRoute>
      } />

      <Route path="/citizen/analyze/:id" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <AnalyzeComplaint />
        </ProtectedRoute>
      } />

      <Route path="/citizen/report" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <ReportIssue />
        </ProtectedRoute>
      } />

      <Route path="/authority/dashboard" element={
        <ProtectedRoute allowedRoles={['authority']}>
          <AuthorityDashboard />
        </ProtectedRoute>
      } />

      <Route path="/authority/complaints/:complaintId" element={
        <ProtectedRoute allowedRoles={['authority']}>
          <ComplaintDetails />
        </ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
