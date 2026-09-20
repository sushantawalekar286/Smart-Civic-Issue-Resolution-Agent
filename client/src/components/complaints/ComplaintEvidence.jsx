import React, { useState } from 'react';

const ComplaintEvidence = ({ evidence = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-gray-500 italic text-sm">
        No evidence provided.
      </div>
    );
  }

  const images = evidence.filter(e => e.type === 'image');

  if (images.length === 0) {
    return (
      <div className="text-gray-500 italic text-sm">
        No image evidence provided.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedImage(img.url)}
          >
            <img 
              src={img.url} 
              alt={img.fileName || `Evidence ${idx + 1}`} 
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/300?text=Image+Unavailable';
              }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged Evidence" 
              className="max-w-full max-h-full object-contain rounded shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintEvidence;
