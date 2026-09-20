import React from 'react';

const DepartmentCard = ({ department }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Recommended Department</h3>
      <div className="mb-3">
        <span className="block text-sm font-medium text-gray-500 mb-1">Department</span>
        <span className="block text-base font-semibold text-gray-900">
          {department?.name || department?.code || 'Not mapped'}
        </span>
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-500 mb-1">Reasoning</span>
        <p className="text-sm text-gray-800">{department?.reason || 'No reasoning provided.'}</p>
      </div>
    </div>
  );
};

export default DepartmentCard;
