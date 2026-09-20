import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

const EvidenceUploader = ({ file, onFileSelect, onRemove, error }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        alert('Unsupported image format. Use JPEG, PNG, or WEBP.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Image exceeds the allowed file size (5MB).');
        return;
      }

      onFileSelect(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemove = () => {
    onRemove();
    setPreviewUrl(null);
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

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Upload Evidence Photo
      </label>
      
      {!file ? (
        <div 
          className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all cursor-pointer backdrop-blur-sm ${
            isDragging 
              ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2 text-center">
            <div className="bg-indigo-500/20 p-3 rounded-full w-fit mx-auto mb-4 border border-indigo-500/30">
              <UploadCloud className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="flex text-sm text-gray-300 justify-center gap-1">
              <span className="font-semibold text-indigo-400 hover:text-indigo-300">Upload a file</span>
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
        <div className="mt-1 flex flex-col items-center p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
          <div className="relative w-full max-w-md h-48 overflow-hidden rounded-lg bg-black/40">
            <img src={previewUrl} alt="Evidence Preview" className="w-full h-full object-contain" />
          </div>
          <div className="mt-4 flex items-center justify-between w-full bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-sm font-medium text-gray-200 truncate pr-4">{file.name}</span>
            </div>
            <button 
              type="button" 
              onClick={handleRemove} 
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="mt-2 text-sm text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

export default EvidenceUploader;
