import React from 'react';

const AuthorityStats = ({ stats }) => {
  const statItems = [
    { label: 'Total Department', value: stats?.total ?? 0, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Submitted', value: stats?.submitted ?? 0, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
    { label: 'Assigned', value: stats?.assigned ?? 0, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    { label: 'Resolved', value: stats?.resolved ?? 0, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    { label: 'Escalated', value: stats?.escalated ?? 0, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      margin: '20px 0'
    }}>
      {statItems.map((item, index) => (
        <div
          key={index}
          style={{
            backgroundColor: item.bg,
            border: `1px solid ${item.border}`,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
          }}
        >
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: item.color,
            marginBottom: '6px'
          }}>
            {item.label}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1e293b'
          }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorityStats;
