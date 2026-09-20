import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import CitizenLayout from '../layouts/CitizenLayout';
import AnalyzeComplaint from '../pages/citizen/AnalyzeComplaint';
import ReportIssue from '../pages/citizen/ReportIssue';
import CitizenLayout from '../layouts/CitizenLayout';
import Dashboard from '../pages/citizen/Dashboard';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetails from '../pages/citizen/ComplaintDetails';
import AuthorityComplaintDetails from '../pages/authority/ComplaintDetails';
import AnalyzeComplaint from '../pages/citizen/AnalyzeComplaint';
import ReportIssue from '../pages/citizen/ReportIssue';
import Home from '../pages/Home';
import Profile from '../pages/citizen/Profile';
import NotFound from '../pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Access Denied. You do not have permission to view this page.</div>;
  }

  return children;
};

const CitizenDashboard = () => (
  <div>
    <h2>Citizen Dashboard</h2>
    <p><Link to="/citizen/report">Report a Civic Issue</Link></p>
  </div>
);

const AuthorityDashboard = () => <div><h2>Authority Dashboard</h2></div>;

const AdminDashboard = () => <div><h2>Admin Dashboard</h2></div>;
const AdminDashboard = () => <div><h2>Admin Dashboard</h2></div>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Citizen Routes wrapped in CitizenLayout */}
      <Route path="/citizen" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="analyze/:id" element={<AnalyzeComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/:complaintId" element={<ComplaintDetails />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/authority/dashboard" element={
        <ProtectedRoute allowedRoles={['authority']}>
          <AuthorityDashboard />
        </ProtectedRoute>
      } />

      <Route path="/authority/complaints/:complaintId" element={
        <ProtectedRoute allowedRoles={['authority']}>
          <AuthorityComplaintDetails />
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
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
