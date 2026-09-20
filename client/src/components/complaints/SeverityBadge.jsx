import React from 'react';
import GlassBadge from '../ui/GlassBadge';
import { AlertCircle, ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';

const SeverityBadge = ({ severity, className = '' }) => {
  const getSeverityConfig = (s) => {
    switch (s) {
      case 'LOW':
        return { variant: 'success', icon: <ArrowUpRight className="w-3 h-3 mr-1" />, label: 'Low' };
      case 'MEDIUM':
        return { variant: 'warning', icon: <AlertCircle className="w-3 h-3 mr-1" />, label: 'Medium' };
      case 'HIGH':
        return { variant: 'danger', icon: <Flame className="w-3 h-3 mr-1" />, label: 'High' };
      case 'CRITICAL':
        return { variant: 'danger', icon: <ShieldAlert className="w-3 h-3 mr-1" />, label: 'Critical' };
      default:
        return { variant: 'default', icon: null, label: s || 'Unknown' };
    }
  };

  const { variant, icon, label } = getSeverityConfig(severity);

  // Critical can have an extra pulse effect
  const isCritical = severity === 'CRITICAL';

  return (
    <GlassBadge variant={variant} className={`${className} ${isCritical ? 'animate-pulse ring-2 ring-red-500/50' : ''}`}>
      {icon}
      {label}
    </GlassBadge>
  );
};

export default SeverityBadge;
