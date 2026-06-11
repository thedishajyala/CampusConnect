import { Fragment, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Modal = ({ isOpen, onClose, title, children, className }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShow(true);
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setShow(false), 300); // match transition duration
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-secondary-900/60 dark:bg-secondary-950/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Modal panel */}
      <div 
        className={cn(
          "glass-panel w-full max-w-lg relative z-10 transition-all duration-300 flex flex-col max-h-[90vh]",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 dark:border-secondary-700/50">
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 transition-colors p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
