
import React, { useState, useRef } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (file: ImageFile | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageUpload({ file, previewUrl });
    } else {
      setPreview(null);
      onImageUpload(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <button
        onClick={handleClick}
        className="w-full aspect-square bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md" />
        ) : (
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V6m10 10V6m-5 14h.01" />
            </svg>
            <span className="mt-2 block text-xs font-medium">Click to upload</span>
          </div>
        )}
      </button>
    </div>
  );
};
