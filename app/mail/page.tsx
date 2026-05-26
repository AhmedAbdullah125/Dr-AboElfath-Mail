'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import MailList from '@/components/MailList/MailList';
import MailDetail from '@/components/MailDetail/MailDetail';
import MailForm from '@/components/MailForm/MailForm';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import ToastContainer, { ToastMessage } from '@/components/Toast/ToastContainer';
import { Mail } from '@/lib/types';
import { useMail } from '@/context/MailContext';
import { v4 as uuidv4 } from 'uuid';

export default function MailPage() {
  // ─── Read form state FROM context (so Sidebar compose button works) ──────────
  const { state, dispatch, deleteMail } = useMail();
  const { isFormOpen, editingMail } = state;

  // ─── Delete Confirm State ─────────────────────────────────────────────────
  const [deletingMail, setDeletingMail] = useState<Mail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Toast State ──────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  function openEdit(mail: Mail) {
    dispatch({ type: 'OPEN_FORM', payload: mail });
  }

  function closeForm() {
    dispatch({ type: 'CLOSE_FORM' });
  }

  function openDelete(mail: Mail) {
    setDeletingMail(mail);
  }

  async function confirmDelete() {
    if (!deletingMail) return;
    setIsDeleting(true);
    const success = await deleteMail(deletingMail.id);
    setIsDeleting(false);
    setDeletingMail(null);
    if (success) {
      addToast('Mail deleted successfully', 'success');
    } else {
      addToast('Failed to delete mail. Please try again.', 'error');
    }
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar />
        <MailList onEdit={openEdit} onDelete={openDelete} />
        <MailDetail onEdit={openEdit} onDelete={openDelete} />
      </div>

      {/* Mail Form Modal — driven by context state so Compose button works */}
      {isFormOpen && (
        <MailForm
          editingMail={editingMail}
          onClose={closeForm}
          onToast={addToast}
        />
      )}

      {/* Delete Confirmation */}
      {deletingMail && (
        <ConfirmDialog
          title="Delete Mail"
          message={`Are you sure you want to delete "${deletingMail.subject}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingMail(null)}
          isLoading={isDeleting}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
