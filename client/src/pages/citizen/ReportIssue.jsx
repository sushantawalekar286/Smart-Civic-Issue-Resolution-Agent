import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import PageHeader from '../../components/common/PageHeader';

const ReportIssue = () => {
  const navigate = useNavigate();

  const handleAnalyzed = (payload) => {
    // Navigate to the analysis review page, passing the payload in state
    navigate('/citizen/analyze/new', {
      state: {
        analysisData: payload.analysisData,
        analysisToken: payload.analysisToken
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader 
        title="Report a Civic Issue" 
        description="Provide details, photos, and location of the issue so we can analyze and route it to the correct department." 
      />
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ComplaintForm onAnalyzed={handleAnalyzed} />
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
