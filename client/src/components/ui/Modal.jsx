import { X } from "lucide-react";
import { useEffect } from "react";

const Modal = ({ children, onClose }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-base-dark dark:hover:bg-base transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
