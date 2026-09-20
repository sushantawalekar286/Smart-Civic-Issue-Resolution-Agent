import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

const EvidenceUploader = ({ file, onFileSelect, onRemove, error: parentError }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    setLocalError('');
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        setLocalError('Unsupported image format. Use JPEG, PNG, or WEBP.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setLocalError('Image exceeds the allowed file size (5MB).');
        return;
      }

      onFileSelect(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemove = () => {
    onRemove();
    setPreviewUrl(null);
    setLocalError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const displayError = localError || parentError;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Upload Evidence Photo
      </label>
      
      {!file ? (
        <div 
          className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm ${
            isDragging 
              ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]' 
              : displayError 
                ? 'border-rose-500/50 bg-rose-500/5 hover:bg-rose-500/10'
                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2 text-center pointer-events-none">
            <div className={`p-3 rounded-full w-fit mx-auto mb-4 border transition-colors duration-300 ${isDragging ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'}`}>
              <UploadCloud className={`h-8 w-8 ${isDragging ? 'animate-bounce' : ''}`} />
            </div>
            <div className="flex text-sm text-gray-300 justify-center gap-1">
              <span className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Upload a file</span>
              <p>or drag and drop</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="sr-only"
              />
            </div>
            <p className="text-xs text-gray-400 font-medium">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex flex-col items-center p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm animate-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-md h-48 overflow-hidden rounded-lg bg-black/40 group">
            <img src={previewUrl} alt="Evidence Preview" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <button 
                type="button" 
                onClick={handleRemove} 
                className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between w-full bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-sm font-medium text-gray-200 truncate pr-4">{file.name}</span>
            </div>
            <button 
              type="button" 
              onClick={handleRemove} 
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {displayError && (
        <div className="mt-3 flex items-start gap-2 text-rose-400 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{displayError}</p>
        </div>
      )}
    </div>
  );
};

export default EvidenceUploader;
