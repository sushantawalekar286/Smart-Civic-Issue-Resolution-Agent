import React, { useState } from 'react';
import DescriptionInput from './DescriptionInput';
import VoiceInput from '../voice/VoiceInput';
import EvidenceUploader from './EvidenceUploader';
import OpenStreetMapLocationPicker from '../location/OpenStreetMapLocationPicker';
import InputSummary from './InputSummary';
import { complaintAPI } from '../../services/complaint.service';
import GlassButton from '../ui/GlassButton';
import { AlertCircle, ArrowRight } from 'lucide-react';

const ComplaintForm = ({ onAnalyzed }) => {
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
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
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {submitError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <p className="ml-3 text-sm text-rose-700 font-medium">{submitError}</p>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Issue Details</h3>
        <p className="mt-1 text-sm text-slate-600">
          Please provide a detailed description of the problem.
        </p>
        <div className="mt-4 space-y-4">
          <DescriptionInput 
            value={description} 
            onChange={setDescription} 
            error={errors.description} 
          />
          <VoiceInput 
            onTranscriptComplete={(text) => setDescription((prev) => (prev ? `${prev} ${text}` : text))}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Evidence (Optional)</h3>
        <p className="mt-1 text-sm text-slate-600">
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

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Location</h3>
        <p className="mt-1 text-sm text-slate-600">
          Pinpoint the exact location of the issue.
        </p>
        <div className="mt-4">
          <OpenStreetMapLocationPicker 
            location={location} 
            onLocationSelect={setLocation} 
            error={errors.location} 
          />
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/10 flex justify-end">
        <GlassButton onClick={handleReview} className="flex items-center gap-2">
          Review Complaint
          <ArrowRight className="w-4 h-4" />
        </GlassButton>
      </div>
    </div>
  );
};

export default ComplaintForm;
