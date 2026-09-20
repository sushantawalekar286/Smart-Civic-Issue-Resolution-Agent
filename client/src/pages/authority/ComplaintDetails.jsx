import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import authorityAPI from '../../services/authority.service';
import ComplaintStatusControl from '../../components/authority/ComplaintStatusControl';
import ComplaintTimeline from '../../components/authority/ComplaintTimeline';
import ComplaintEvidence from '../../components/authority/ComplaintEvidence';

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

const ComplaintDetails = () => {
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authorityAPI.getAuthorityComplaint(complaintId);
      setComplaint(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchDetails();
    }
  }, [complaintId]);

  const handleStatusUpdated = (updated) => {
    setComplaint(updated);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '40px auto', textAlign: 'center', color: '#64748b' }}>
        Loading complaint records...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <Link to="/authority/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Dashboard
        </Link>
        <div style={{
          marginTop: '20px',
          padding: '16px 20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  const statusStyle = getStatusBadgeStyle(complaint.status);
  const ai = complaint.aiAnalysis;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/authority/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          ← Back to Department Dashboard
        </Link>
      </div>

      {/* Main Header Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {complaint.complaintId}
              </h1>
              <span style={{
                ...statusStyle,
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700
              }}>
                {complaint.status}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Department: <strong style={{ color: '#334155' }}>{complaint.departmentId?.name || 'Department Assigned'}</strong>
              {complaint.departmentId?.code && ` (${complaint.departmentId.code})`}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
            <div>Submitted: <strong>{new Date(complaint.createdAt).toLocaleString()}</strong></div>
            <div style={{ marginTop: '4px' }}>
              Assigned To: <strong style={{ color: '#1e293b' }}>{complaint.assignedTo ? complaint.assignedTo.name : 'Unassigned'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Action Control */}
      <ComplaintStatusControl complaint={complaint} onStatusUpdated={handleStatusUpdated} />

      {/* 2-Column Grid: Complaint Info & AI Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Left Column: Complaint & Citizen Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Issue Overview Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Citizen Complaint Details
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Issue Category:
              </span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                {complaint.issueType}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Severity Assessment:
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#b45309', marginTop: '2px' }}>
                {complaint.severity}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Description:
              </span>
              <div style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#334155',
                marginTop: '4px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                {complaint.description}
              </div>
            </div>

            {/* Location Box */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Reported Location:
              </span>
              <div style={{ fontSize: '14px', color: '#1e293b', marginTop: '4px' }}>
                {complaint.location?.address && <div><strong>Address:</strong> {complaint.location.address}</div>}
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
                  GPS: {complaint.location?.latitude?.toFixed(5)}, {complaint.location?.longitude?.toFixed(5)}
                </div>
              </div>
            </div>

            {/* Citizen info */}
            {complaint.citizenId && (
              <div style={{ fontSize: '13px', color: '#64748b', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                Reported by Citizen: <strong>{complaint.citizenId.name}</strong> ({complaint.citizenId.email})
              </div>
            )}
          </div>

          {/* Evidence Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              Attached Citizen Evidence
            </h2>
            <ComplaintEvidence evidence={complaint.evidence} />
          </div>
        </div>

        {/* Right Column: AI Analysis (Read-Only) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '10px',
              marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                AI Analysis & Intelligence (Read-Only)
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6366f1',
                backgroundColor: '#eef2ff',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Frozen Agent Pipeline
              </span>
            </div>

            {ai ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
                {/* AI Classification */}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>AI Classification:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <strong style={{ color: '#1e293b' }}>{ai.classification?.issueType || 'N/A'}</strong>
                    {ai.classification?.confidence && (
                      <span style={{ fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                        {(ai.classification.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                  {ai.classification?.reason && (
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{ai.classification.reason}</div>
                  )}
                </div>

                {/* AI Severity Reasoning */}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Severity Assessment:</span>
                  <div style={{ marginTop: '2px', fontWeight: 600, color: '#1e293b' }}>
                    {ai.severityAnalysis?.severity || complaint.severity}
                  </div>
                  {ai.severityAnalysis?.reason && (
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{ai.severityAnalysis.reason}</div>
                  )}
                </div>

                {/* AI Department Recommendation */}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Recommended Department:</span>
                  <div style={{ marginTop: '2px', fontWeight: 600, color: '#1e293b' }}>
                    {ai.departmentAnalysis?.departmentName || 'N/A'}
                  </div>
                  {ai.departmentAnalysis?.reason && (
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{ai.departmentAnalysis.reason}</div>
                  )}
                </div>

                {/* Evidence Findings */}
                {ai.evidenceAnalysis && (
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Evidence Findings:</span>
                    {ai.evidenceAnalysis.summary && (
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{ai.evidenceAnalysis.summary}</div>
                    )}
                    {ai.evidenceAnalysis.findings?.length > 0 && (
                      <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '13px', color: '#475569' }}>
                        {ai.evidenceAnalysis.findings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Structured Generated Complaint */}
                {ai.generatedComplaint && (
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Structured AI Brief:</span>
                    <pre style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '12px',
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                      marginTop: '4px'
                    }}>
                      {ai.generatedComplaint}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                No automated AI analysis attached.
              </div>
            )}
          </div>

          {/* Status Timeline History */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Status History & Audit Trail
            </h2>
            <ComplaintTimeline statusHistory={complaint.statusHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
