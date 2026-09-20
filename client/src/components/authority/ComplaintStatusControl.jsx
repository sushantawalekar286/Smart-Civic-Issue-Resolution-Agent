import React, { useState } from 'react';
import authorityAPI from '../../services/authority.service';

const ALLOWED_NEXT_STATUSES = {
  SUBMITTED: [
    { status: 'ASSIGNED', label: 'Assign to Myself', desc: 'Take ownership and assign to your authority queue', color: '#8b5cf6' }
  ],
  ASSIGNED: [
    { status: 'IN_PROGRESS', label: 'Start Work (In Progress)', desc: 'Mark that active investigation/repair has begun', color: '#f59e0b' },
    { status: 'ESCALATED', label: 'Escalate Complaint', desc: 'Escalate to senior municipal supervisor / high authority', color: '#ef4444' }
  ],
  IN_PROGRESS: [
    { status: 'RESOLVED', label: 'Mark as Resolved', desc: 'Resolve issue with required completion details', color: '#10b981' },
    { status: 'ESCALATED', label: 'Escalate Complaint', desc: 'Escalate issue if unforeseen blockers arise', color: '#ef4444' }
  ],
  RESOLVED: [],
  ESCALATED: []
};

const ComplaintStatusControl = ({ complaint, onStatusUpdated }) => {
  const currentStatus = complaint?.status || 'SUBMITTED';
  const availableTransitions = ALLOWED_NEXT_STATUSES[currentStatus] || [];

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSelectTransition = (target) => {
    setSelectedTarget(target);
    setError('');
    setSuccessMsg('');
    if (target.status === 'ASSIGNED') {
      setNote('Taking ownership and assigning to authority queue.');
    } else if (target.status === 'IN_PROGRESS') {
      setNote('Field work and resolution operations have commenced.');
    } else {
      setNote('');
    }
  };

  const handleCancel = () => {
    setSelectedTarget(null);
    setNote('');
    setError('');
  };

  const handleConfirmTransition = async (e) => {
    e.preventDefault();
    if (!selectedTarget) return;

    if (selectedTarget.status === 'RESOLVED' && (!note || note.trim().length < 5)) {
      setError('A resolution note of at least 5 characters is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authorityAPI.updateComplaintStatus(complaint.complaintId, {
        status: selectedTarget.status,
        note: note.trim()
      });

      setSuccessMsg(`Status successfully updated to ${selectedTarget.status}`);
      setSelectedTarget(null);
      setNote('');
      if (onStatusUpdated) {
        onStatusUpdated(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update complaint status.');
    } finally {
      setLoading(false);
    }
  };

  if (availableTransitions.length === 0) {
    return (
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        margin: '20px 0',
        color: '#64748b'
      }}>
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
          Workflow Status: {currentStatus}
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>
          {currentStatus === 'RESOLVED'
            ? 'This civic issue has been resolved. No further workflow transitions are allowed.'
            : 'This complaint has been escalated for senior administrative intervention.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      margin: '24px 0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
            Status Action & Workflow Controls
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Current Status: <strong style={{ color: '#0f172a' }}>{currentStatus}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          {successMsg}
        </div>
      )}

      {/* Available Transition Actions */}
      {!selectedTarget ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {availableTransitions.map((item) => (
            <button
              key={item.status}
              type="button"
              onClick={() => handleSelectTransition(item)}
              style={{
                backgroundColor: item.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'opacity 0.2s'
              }}
            >
              <span>{item.label}</span>
              <span style={{ opacity: 0.8, fontSize: '12px' }}>→</span>
            </button>
          ))}
        </div>
      ) : (
        /* Action Confirmation Modal / Panel */
        <form onSubmit={handleConfirmTransition} style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', fontSize: '16px' }}>
            Transition to: <span style={{ color: selectedTarget.color }}>{selectedTarget.status}</span>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
            {selectedTarget.desc}
          </p>

          <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', color: '#334155', marginBottom: '6px' }}>
            Official Status Note / Reason {selectedTarget.status === 'RESOLVED' && <span style={{ color: '#ef4444' }}>* (required)</span>}:
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            required={selectedTarget.status === 'RESOLVED'}
            placeholder={
              selectedTarget.status === 'RESOLVED'
                ? 'Describe resolution actions taken, repair completion details, etc.'
                : 'Enter optional processing note for audit log...'
            }
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              boxSizing: 'border-box',
              marginBottom: '16px'
            }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: selectedTarget.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Updating...' : `Confirm: Move to ${selectedTarget.status}`}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '10px 18px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComplaintStatusControl;
