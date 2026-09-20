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
      <div className="space-y-6">
        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}
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
    <div className="space-y-8">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Issue Details</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please provide a detailed description of the problem.
        </p>
        <div className="mt-4">
          <DescriptionInput 
            value={description} 
            onChange={setDescription} 
            error={errors.description} 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Evidence (Optional)</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a clear photo of the issue.
        </p>
        <div className="mt-4">
          <EvidenceUploader 
            file={file} 
            onFileSelect={setFile} 
            onRemove={() => setFile(null)} 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Location</h3>
        <p className="mt-1 text-sm text-gray-500">
          Pinpoint the exact location of the issue.
        </p>
        <div className="mt-4">
          <LocationPicker 
            location={location} 
            onLocationSelect={setLocation} 
            error={errors.location} 
          />
        </div>
      </div>
      
      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={handleReview} 
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Review Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
