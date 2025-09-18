
import React, { useEffect } from 'react';

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ isOpen, imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl leading-none z-50 hover:text-gray-300 transition-colors"
        aria-label="Close image viewer"
      >
        &times;
      </button>
      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Full resolution view"
          className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};
