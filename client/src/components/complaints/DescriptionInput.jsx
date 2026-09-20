import React from 'react';

const DescriptionInput = ({ value, onChange, error }) => {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 'bold' }}>What is the civic issue?</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="4"
        style={{ width: '100%', marginTop: '5px' }}
        placeholder="Describe the issue in detail (e.g. There is a large pothole...)"
      />
      {error && <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>{error}</p>}
    </div>
  );
};

export default DescriptionInput;
