import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const ComplaintEvidence = ({ evidence = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
        <p className="text-sm font-medium">No evidence provided.</p>
      </div>
    );
  }

  const images = evidence.filter(e => e.type === 'image');

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
        <p className="text-sm font-medium">No image evidence provided.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer group hover:border-blue-400 transition-all bg-slate-100"
            onClick={() => setSelectedImage(img.url)}
          >
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors z-10"></div>
            <img 
              src={img.url} 
              alt={img.fileName || `Evidence ${idx + 1}`} 
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
            <button 
              className="absolute -top-12 right-0 md:-right-12 md:top-0 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged Evidence" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black/50"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintEvidence;
