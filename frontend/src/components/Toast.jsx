import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <CheckCircle size={18} color="#2e7d32" />
      <span>{message}</span>
    </div>
  );
}