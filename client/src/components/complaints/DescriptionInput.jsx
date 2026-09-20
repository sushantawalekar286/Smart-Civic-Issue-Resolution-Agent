import React from 'react';

const DescriptionInput = ({ value, onChange, error }) => {
  return (
    <div className="mb-6">
      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
        What is the civic issue?
      </label>
      <div className="mt-2">
        <textarea
          id="description"
          name="description"
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe the problem, e.g., 'Large pothole on Main St. causing traffic delay...'"
          className={`shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md p-3 transition-colors`}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-1 text-xs text-gray-500 text-right">
         {value.length} characters
      </div>
    </div>
  );
};

export default DescriptionInput;
