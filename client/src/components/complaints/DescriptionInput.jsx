import React from 'react';
import GlassTextarea from '../ui/GlassTextarea';

const DescriptionInput = ({ value, onChange, error }) => {
  return (
    <div className="mb-6">
      <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
        What is the civic issue?
      </label>
      <GlassTextarea
        id="description"
        name="description"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the problem, e.g., 'Large pothole on Main St. causing traffic delay...'"
        error={error}
      />
      <div className="mt-2 text-xs text-indigo-300 text-right font-medium">
         {value.length} characters
      </div>
    </div>
  );
};

export default DescriptionInput;
