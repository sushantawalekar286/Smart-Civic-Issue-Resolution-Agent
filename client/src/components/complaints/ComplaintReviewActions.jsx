import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassButton from '../ui/GlassButton';
import { Edit2, Send, Loader2 } from 'lucide-react';

const ComplaintReviewActions = ({ onConfirm, isSubmitting }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/citizen/report');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
      <GlassButton
        type="button"
        onClick={handleEdit}
        disabled={isSubmitting}
        variant="secondary"
        className="w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Edit Complaint
      </GlassButton>
      <GlassButton
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting}
        variant="primary"
        className="w-full sm:w-auto flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Confirm & Submit
          </>
        )}
      </GlassButton>
    </div>
  );
};

export default ComplaintReviewActions;
