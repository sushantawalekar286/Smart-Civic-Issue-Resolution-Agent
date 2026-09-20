import React from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case 'SUBMITTED':
      return '#64748b';
    case 'ASSIGNED':
      return '#8b5cf6';
    case 'IN_PROGRESS':
      return '#f59e0b';
    case 'RESOLVED':
      return '#10b981';
    case 'ESCALATED':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

const ComplaintTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', padding: '12px 0' }}>
        No status history recorded yet.
      </div>
    );
  }

  // Display chronologically (newest on top or standard timeline bottom-to-top)
  const historyItems = [...statusHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div style={{ position: 'relative', padding: '12px 0 12px 24px' }}>
      {/* Vertical Timeline Guide Line */}
      <div style={{
        position: 'absolute',
        top: '20px',
        bottom: '20px',
        left: '7px',
        width: '2px',
        backgroundColor: '#e2e8f0'
      }} />

      {historyItems.map((item, index) => {
        const dotColor = getStatusColor(item.status);
        const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const actorName = item.changedBy?.name || item.changedByRole || 'User';

        return (
          <div
            key={item._id || index}
            style={{
              position: 'relative',
              marginBottom: '20px',
              paddingBottom: index === historyItems.length - 1 ? '0' : '8px'
            }}
          >
            {/* Timeline bullet dot */}
            <div style={{
              position: 'absolute',
              left: '-24px',
              top: '4px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: dotColor,
              border: '2px solid #ffffff',
              boxShadow: '0 0 0 2px ' + dotColor
            }} />

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: dotColor,
                  letterSpacing: '0.02em'
                }}>
                  {item.status}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {formattedDate}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                Updated by: <strong>{actorName}</strong> ({item.changedByRole})
              </div>

              {item.note && (
                <div style={{
                  fontSize: '13px',
                  color: '#1e293b',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginTop: '6px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {item.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;
