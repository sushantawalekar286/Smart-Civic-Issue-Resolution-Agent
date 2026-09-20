import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authorityAPI from '../../services/authority.service';
import AuthorityStats from '../../components/authority/AuthorityStats';
import AuthorityComplaintTable from '../../components/authority/AuthorityComplaintTable';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [issueTypeFilter, setIssueTypeFilter] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      if (issueTypeFilter) params.issueType = issueTypeFilter;

      const res = await authorityAPI.getAuthorityComplaints(params);
      setComplaints(res.data.data || []);
      setStats(res.data.stats || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load department complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, severityFilter, issueTypeFilter]);

  const clearFilters = () => {
    setStatusFilter('');
    setSeverityFilter('');
    setIssueTypeFilter('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Bar / Header */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
        gap: '16px'
      }}>
        <div>
          <div style={{
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            padding: '4px 10px',
            borderRadius: '9999px',
            marginBottom: '6px'
          }}>
            Department Portal
          </div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>
            Authority Resolution Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Logged in as <strong>{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={fetchComplaints}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ↻ Refresh
          </button>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '14px 18px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Department Summary Metrics */}
      <section>
        <AuthorityStats stats={stats} />
      </section>

      {/* Filters Bar */}
      <section style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px 20px',
        margin: '20px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="ESCALATED">ESCALATED</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Issue Type
            </label>
            <input
              type="text"
              placeholder="e.g. Pothole, Garbage"
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                width: '180px'
              }}
            />
          </div>
        </div>

        {(statusFilter || severityFilter || issueTypeFilter) && (
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 14px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Clear Filters ✕
          </button>
        )}
      </section>

      {/* Complaints List Table */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
            Department Complaints ({complaints.length})
          </h2>
        </div>
        <AuthorityComplaintTable complaints={complaints} loading={loading} />
      </section>
    </div>
  );
};

export default Dashboard;
