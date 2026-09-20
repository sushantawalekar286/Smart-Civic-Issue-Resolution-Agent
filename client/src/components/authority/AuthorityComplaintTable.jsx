import React from 'react';
import { Link } from 'react-router-dom';

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'SUBMITTED':
      return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    case 'ASSIGNED':
      return { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #c4b5fd' };
    case 'IN_PROGRESS':
      return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
    case 'RESOLVED':
      return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
    case 'ESCALATED':
      return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' };
    default:
      return { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
  }
};

const getSeverityBadgeStyle = (severity) => {
  switch (severity) {
    case 'CRITICAL':
      return { background: '#fef2f2', color: '#991b1b', fontWeight: '700' };
    case 'HIGH':
      return { background: '#fff7ed', color: '#c2410c', fontWeight: '600' };
    case 'MEDIUM':
      return { background: '#fefce8', color: '#854d0e', fontWeight: '600' };
    case 'LOW':
      return { background: '#f0fdf4', color: '#166534', fontWeight: '500' };
    default:
      return { background: '#f1f5f9', color: '#475569', fontWeight: '500' };
  }
};

const AuthorityComplaintTable = ({ complaints = [], loading = false }) => {
  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        Loading department complaints...
      </div>
    );
  }

  if (!complaints.length) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        color: '#64748b',
        margin: '20px 0'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
          No Complaints Found
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>
          No complaints match the selected filters for your department.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      overflowX: 'auto',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      backgroundColor: '#ffffff'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Complaint ID</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Issue Type</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Severity</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Location</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Status</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Created</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Assigned Officer</th>
            <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => {
            const statusStyle = getStatusBadgeStyle(complaint.status);
            const severityStyle = getSeverityBadgeStyle(complaint.severity);
            const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <tr
                key={complaint._id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>
                  {complaint.complaintId}
                </td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>
                  {complaint.issueType}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    ...severityStyle,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    display: 'inline-block'
                  }}>
                    {complaint.severity}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={complaint.location?.address || `${complaint.location?.latitude}, ${complaint.location?.longitude}`}>
                  {complaint.location?.address || `${complaint.location?.latitude?.toFixed(4)}, ${complaint.location?.longitude?.toFixed(4)}`}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    ...statusStyle,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'inline-block'
                  }}>
                    {complaint.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {formattedDate}
                </td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>
                  {complaint.assignedTo ? complaint.assignedTo.name : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Link
                    to={`/authority/complaints/${complaint.complaintId}`}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      display: 'inline-block',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AuthorityComplaintTable;
