import React, { useState } from 'react';
import ComplaintForm from '../../components/complaints/ComplaintForm';

const ReportIssue = () => {
  const [analyzedPayload, setAnalyzedPayload] = useState(null);

  const handleAnalyzed = (payload) => {
    // This is where Step 3 ends. The payload is standardized and ready for Step 4.
    setAnalyzedPayload(payload);
  };

  if (analyzedPayload) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Complaint Analyzed (Ready for Step 4)</h2>
        <p style={{ color: 'green' }}>
          The backend has successfully validated the input and returned the standardized complaint payload. 
          No final complaint record has been created yet. AI Analysis is deferred to Step 4.
        </p>
        <pre style={{ background: '#f4f4f4', padding: '15px', overflowX: 'auto' }}>
          {JSON.stringify(analyzedPayload, null, 2)}
        </pre>
        <button onClick={() => setAnalyzedPayload(null)} style={{ marginTop: '20px' }}>
          Report Another Issue
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Report a Civic Issue</h1>
      <ComplaintForm onAnalyzed={handleAnalyzed} />
    </div>
  );
};

export default ReportIssue;
