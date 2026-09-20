import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import CitizenLayout from '../layouts/CitizenLayout';
import AnalyzeComplaint from '../pages/citizen/AnalyzeComplaint';
import ReportIssue from '../pages/citizen/ReportIssue';
import Dashboard from '../pages/citizen/Dashboard';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetails from '../pages/citizen/ComplaintDetails';
import AuthorityComplaintDetails from '../pages/authority/ComplaintDetails';
import Home from '../pages/Home';
import Profile from '../pages/citizen/Profile';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/Dashboard';
import AuthorityDashboard from '../pages/authority/Dashboard';
import ComplaintsList from '../pages/admin/ComplaintsList';
import AdminComplaintDetails from '../pages/admin/ComplaintDetails';
import AgentActionsList from '../pages/admin/AgentActionsList';
import UsersList from '../pages/admin/UsersList';
import AuthoritiesManagement from '../pages/admin/AuthoritiesManagement';
import DepartmentsManagement from '../pages/admin/DepartmentsManagement';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying session permissions...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const userRole = (user.role || '').toUpperCase();
  const normalizedAllowed = (allowedRoles || []).map((r) => r.toUpperCase());

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
            className="inline-block mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/citizen" element={
        <ProtectedRoute allowedRoles={['citizen', 'CITIZEN']}>
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

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Authority routes */}
      <Route path="/authority/dashboard" element={
        <ProtectedRoute allowedRoles={['authority', 'AUTHORITY']}>
          <AuthorityDashboard />
        </ProtectedRoute>
      } />

      <Route path="/authority/complaints" element={
        <ProtectedRoute allowedRoles={['authority', 'AUTHORITY']}>
          <AuthorityDashboard />
        </ProtectedRoute>
      } />

      <Route path="/authority/complaints/:complaintId" element={
        <ProtectedRoute allowedRoles={['authority', 'AUTHORITY']}>
          <AuthorityComplaintDetails />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <ComplaintsList />
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints/:complaintId" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <AdminComplaintDetails />
        </ProtectedRoute>
      } />
      <Route path="/admin/agent-actions" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <AgentActionsList />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <UsersList />
        </ProtectedRoute>
      } />
      <Route path="/admin/authorities" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <AuthoritiesManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/departments" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <DepartmentsManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
