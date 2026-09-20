import React, { useState } from 'react';
import DescriptionInput from './DescriptionInput';
import EvidenceUploader from './EvidenceUploader';
import LocationPicker from './LocationPicker';
import InputSummary from './InputSummary';
import { complaintAPI } from '../../services/complaint.service';

const ComplaintForm = ({ onAnalyzed }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = input, 2 = summary
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateInput = () => {
    const newErrors = {};
    if (!description.trim()) {
      newErrors.description = 'Please describe the civic issue.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description is too short.';
    }

    if (!location) {
      newErrors.location = 'Location is required to report an issue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = () => {
    if (validateInput()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', JSON.stringify(location));
      if (file) {
        formData.append('image', file);
      }

      const response = await complaintAPI.analyzeIntake(formData);
      onAnalyzed(response.data.data); // Return the normalized payload to the parent
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Network failure. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 2) {
    return (
      <div>
        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
        <InputSummary 
          description={description}
          file={file}
          location={location}
          onEdit={() => setStep(1)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <DescriptionInput 
        value={description} 
        onChange={setDescription} 
        error={errors.description} 
      />
      <EvidenceUploader 
        file={file} 
        onFileSelect={setFile} 
        onRemove={() => setFile(null)} 
      />
      <LocationPicker 
        location={location} 
        onLocationSelect={setLocation} 
        error={errors.location} 
      />
      
      <button 
        type="button" 
        onClick={handleReview} 
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
      >
        Review Complaint
      </button>
    </div>
  );
};

export default ComplaintForm;
