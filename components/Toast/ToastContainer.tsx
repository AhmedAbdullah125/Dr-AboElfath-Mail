'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />,
    error:   <XCircle    size={16} style={{ color: 'var(--danger)',  flexShrink: 0 }} />,
    info:    <Info       size={16} style={{ color: 'var(--accent)',  flexShrink: 0 }} />,
  };

  return (
    <div className={`toast ${toast.type}`} role="alert">
      {icons[toast.type]}
      {toast.message}
    </div>
  );
}
