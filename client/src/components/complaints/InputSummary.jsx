import React from 'react';

const InputSummary = ({ description, file, location, onEdit, onSubmit, isSubmitting }) => {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
      <h3>Input Summary</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Description:</strong>
        <p style={{ margin: '5px 0' }}>{description}</p>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Evidence:</strong>
        <p style={{ margin: '5px 0' }}>{file ? `1 image uploaded (${file.name})` : 'No evidence uploaded'}</p>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Location:</strong>
        {location ? (
          <div>
            <p style={{ margin: '5px 0' }}>Latitude: {location.latitude.toFixed(6)}</p>
            <p style={{ margin: '5px 0' }}>Longitude: {location.longitude.toFixed(6)}</p>
          </div>
        ) : (
          <p style={{ margin: '5px 0' }}>No location provided</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Input method:</strong>
        <p style={{ margin: '5px 0' }}>{file ? 'Text + Image' : 'Text'}</p>
      </div>

      <div>
        <button type="button" onClick={onEdit} disabled={isSubmitting} style={{ marginRight: '10px' }}>
          Edit
        </button>
        <button type="button" onClick={onSubmit} disabled={isSubmitting} style={{ background: 'blue', color: 'white' }}>
          {isSubmitting ? 'Analyzing...' : 'Analyze Complaint'}
        </button>
      </div>
    </div>
  );
};

export default InputSummary;
