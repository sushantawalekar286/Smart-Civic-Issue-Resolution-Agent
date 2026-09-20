import React from 'react';

const PageHeader = ({ title, description }) => {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
