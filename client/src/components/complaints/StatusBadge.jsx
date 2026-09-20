import React from 'react';
import GlassBadge from '../ui/GlassBadge';
import { Clock, CheckCircle, AlertTriangle, ArrowRightCircle } from 'lucide-react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (s) => {
    switch (s) {
      case 'SUBMITTED':
        return { variant: 'info', icon: <ArrowRightCircle className="w-3 h-3 mr-1" />, label: 'Submitted' };
      case 'ASSIGNED':
        return { variant: 'primary', icon: <Clock className="w-3 h-3 mr-1" />, label: 'Assigned' };
      case 'IN_PROGRESS':
        return { variant: 'warning', icon: <Clock className="w-3 h-3 mr-1" />, label: 'In Progress' };
      case 'RESOLVED':
        return { variant: 'success', icon: <CheckCircle className="w-3 h-3 mr-1" />, label: 'Resolved' };
      case 'ESCALATED':
        return { variant: 'danger', icon: <AlertTriangle className="w-3 h-3 mr-1" />, label: 'Escalated' };
      default:
        return { variant: 'default', icon: null, label: s || 'Unknown' };
    }
  };

  const { variant, icon, label } = getStatusConfig(status);

  return (
    <GlassBadge variant={variant} className={className}>
      {icon}
      {label}
    </GlassBadge>
  );
};

export default StatusBadge;
