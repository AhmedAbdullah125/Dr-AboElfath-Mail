'use client';

import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  title = 'Delete Mail',
  message = 'Are you sure you want to delete this mail? This action cannot be undone.',
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-label="Confirm deletion">
      <div className="confirm-dialog">
        <div className="confirm-dialog-icon">
          <Trash2 size={26} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            id="confirm-cancel-btn"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-delete-btn"
            aria-label="Confirm deletion"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
