import React from 'react';
import GlassCard from '../ui/GlassCard';
import { Building2 } from 'lucide-react';

const DepartmentCard = ({ department }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
        <Building2 className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-bold text-slate-800">Recommended Department</h3>
      </div>
      <div className="mb-4">
        <span className="block text-sm font-medium text-slate-500 mb-1">Department</span>
        <span className="block text-lg font-semibold text-cyan-700">
          {department?.name || department?.code || 'Not mapped'}
        </span>
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-500 mb-1">Reasoning</span>
        <p className="text-sm text-slate-700 leading-relaxed">{department?.reason || 'No reasoning provided.'}</p>
      </div>
    </GlassCard>
  );
};

export default DepartmentCard;
