import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AnalyzeComplaint from '../pages/citizen/AnalyzeComplaint';
import ReportIssue from '../pages/citizen/ReportIssue';
import AuthorityDashboard from '../pages/authority/Dashboard';
import AuthorityComplaintDetails from '../pages/authority/ComplaintDetails';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import ComplaintsList from '../pages/admin/ComplaintsList';
import AdminComplaintDetails from '../pages/admin/ComplaintDetails';
import AgentActionsList from '../pages/admin/AgentActionsList';
import UsersList from '../pages/admin/UsersList';
import AuthoritiesManagement from '../pages/admin/AuthoritiesManagement';
import DepartmentsManagement from '../pages/admin/DepartmentsManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying session permissions...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const userRole = (user.role || '').toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  if (allowedRoles && !normalizedAllowed.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 font-black text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-2">
            You do not have the required permissions ({userRole}) to view this administrative resource.
          </p>
          <Link
            to="/login"
            className="inline-block mt-5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

// Citizen Placeholder Dashboard
const CitizenDashboard = () => (
  <div style={{ padding: '20px' }}>
    <h2>Citizen Dashboard</h2>
    <p><Link to="/citizen/report">Report a Civic Issue</Link></p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Citizen routes */}
      <Route path="/citizen/dashboard" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}>
          <CitizenDashboard />
        </ProtectedRoute>
      } />

      <Route path="/citizen/analyze/:id" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}>
          <AnalyzeComplaint />
        </ProtectedRoute>
      } />

      <Route path="/citizen/report" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}>
          <ReportIssue />
        </ProtectedRoute>
      } />

      {/* Authority routes */}
      <Route path="/authority/dashboard" element={
        <ProtectedRoute allowedRoles={['AUTHORITY']}>
          <AuthorityDashboard />
        </ProtectedRoute>
      } />

      <Route path="/authority/complaints/:complaintId" element={
        <ProtectedRoute allowedRoles={['AUTHORITY']}>
          <AuthorityComplaintDetails />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ComplaintsList />
        </ProtectedRoute>
      } />

      <Route path="/admin/complaints/:complaintId" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminComplaintDetails />
        </ProtectedRoute>
      } />

      <Route path="/admin/agent-actions" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AgentActionsList />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <UsersList />
        </ProtectedRoute>
      } />

      <Route path="/admin/authorities" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AuthoritiesManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/departments" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DepartmentsManagement />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
