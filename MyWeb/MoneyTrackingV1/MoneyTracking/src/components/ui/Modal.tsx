import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Modal */}
      <div className={`relative brutal-card-lg ${sizeClass} w-full p-0 overflow-hidden animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b-2 border-black">
            <h2 className="text-lg font-800 font-extrabold">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[#F5F5E8] border-x-2 border-t-2 lg:border-b-2 border-black rounded-t-2xl lg:rounded-2xl overflow-hidden lg:shadow-[8px_8px_0px_#111] animate-slide-up lg:animate-fade-in safe-bottom lg:pb-0">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-gray-400 rounded-full" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black">
            <h2 className="text-base font-extrabold">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-4 py-4 overflow-y-auto max-h-[85vh]">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
