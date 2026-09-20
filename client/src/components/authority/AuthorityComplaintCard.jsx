import React from 'react';
import { Link } from 'react-router-dom';

const AuthorityComplaintCard = ({ complaint }) => {
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>{complaint.complaintId}</span>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#f1f5f9',
          color: '#334155'
        }}>
          {complaint.status}
        </span>
      </div>
      <div style={{ fontSize: '14px', color: '#475569', marginBottom: '6px' }}>
        <strong>Type:</strong> {complaint.issueType} | <strong>Severity:</strong> {complaint.severity}
      </div>
      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
        {complaint.location?.address || `${complaint.location?.latitude?.toFixed(4)}, ${complaint.location?.longitude?.toFixed(4)}`}
      </div>
      <Link
        to={`/authority/complaints/${complaint.complaintId}`}
        style={{
          display: 'inline-block',
          padding: '6px 12px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500
        }}
      >
        View Details →
      </Link>
    </div>
  );
};

export default AuthorityComplaintCard;
