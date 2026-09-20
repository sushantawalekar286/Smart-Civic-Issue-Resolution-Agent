import React, { useRef, useState } from 'react';

const EvidenceUploader = ({ file, onFileSelect, onRemove, error }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        alert('Unsupported image format. Use JPEG, PNG, or WEBP.');
        return;
      }
      // Validate size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Image exceeds the allowed file size (5MB).');
        return;
      }

      onFileSelect(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemove = () => {
    onRemove();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', fontWeight: 'bold' }}>Upload a photo of the issue.</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        style={{ marginTop: '5px', display: file ? 'none' : 'block' }}
      />
      
      {file && previewUrl && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ margin: '0 0 5px 0' }}>Selected Image:</p>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block' }} />
          <button type="button" onClick={handleRemove} style={{ marginTop: '10px', color: 'red' }}>Remove Image</button>
        </div>
      )}
      
      {error && <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>{error}</p>}
    </div>
  );
};

export default EvidenceUploader;
