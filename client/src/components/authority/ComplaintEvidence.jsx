import React, { useState } from 'react';

const ComplaintEvidence = ({ evidence = [] }) => {
  const [activeImage, setActiveImage] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '14px',
        fontStyle: 'italic'
      }}>
        No multimedia evidence attached to this complaint.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
        marginTop: '8px'
      }}>
        {evidence.map((item, index) => {
          if (item.type === 'image') {
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onClick={() => setActiveImage(item.url)}
              >
                <img
                  src={item.url}
                  alt={item.fileName || 'Citizen evidence'}
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<div style="padding: 20px; font-size: 12px; color: #64748b; text-align: center;">Evidence Photo Attached</div>';
                  }}
                />
                <div style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: '#475569',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.fileName || 'Citizen Photo'}
                </div>
              </div>
            );
          }

          if (item.type === 'audio') {
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Audio Evidence
                </div>
                <audio controls src={item.url} style={{ width: '100%' }} />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Lightbox / Modal for full photo view */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={activeImage}
              alt="Expanded Evidence"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
            />
            <button
              onClick={() => setActiveImage(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintEvidence;
