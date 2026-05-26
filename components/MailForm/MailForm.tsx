'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Upload, Clock, Calendar, Tag, User, Mail, FileText, AlignLeft, Paperclip, Trash2,
} from 'lucide-react';
import { MailCategory, Mail as MailType, MailAttachment } from '@/lib/types';
import { format, getFileTypeLabel, getFileTypeClass } from '@/lib/utils';
import { useMail } from '@/context/MailContext';

interface MailFormProps {
  editingMail?: MailType | null;
  onClose: () => void;
  onSuccess?: (mail: MailType) => void;
  onToast?: (msg: string, type: 'success' | 'error') => void;
}

const CATEGORIES: { value: MailCategory; label: string; emoji: string }[] = [
  { value: 'inbox',     label: 'Inbox',     emoji: '📥' },
  { value: 'sent',      label: 'Sent',      emoji: '📤' },
  { value: 'spam',      label: 'Spam',      emoji: '🚫' },
  { value: 'important', label: 'Important', emoji: '⭐' },
];

export default function MailForm({ editingMail, onClose, onSuccess, onToast }: MailFormProps) {
  const { createMail, updateMail } = useMail();
  const isEditing = !!editingMail;

  // ─── Form State ──────────────────────────────────────────────────────────────
  const [category, setCategory]     = useState<MailCategory>(editingMail?.category ?? 'inbox');
  const [subject, setSubject]       = useState(editingMail?.subject ?? '');
  const [body, setBody]             = useState(editingMail?.body ?? '');
  const [fromAddress, setFrom]      = useState(editingMail?.from_address ?? '');
  const [toAddress, setTo]          = useState(editingMail?.to_address ?? '');
  const [mailDate, setMailDate]     = useState(editingMail?.mail_date ?? format.today());
  const [mailTime, setMailTime]     = useState(editingMail?.mail_time ?? format.currentTime());
  const [newFiles, setNewFiles]     = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<MailAttachment[]>(
    editingMail?.attachments ?? []
  );
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInbound = category === 'inbox' || category === 'spam' || category === 'important';

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setNewFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const picked = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...picked]);
    }
  }, []);

  // ─── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!subject.trim())     e.subject     = 'Subject is required';
    if (!fromAddress.trim()) e.fromAddress = 'From address is required';
    if (!toAddress.trim())   e.toAddress   = 'To address is required';
    if (!mailDate)           e.mailDate    = 'Date is required';
    if (!mailTime)           e.mailTime    = 'Time is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      let result: MailType | null = null;

      if (isEditing && editingMail) {
        result = await updateMail(
          {
            id: editingMail.id,
            category,
            subject: subject.trim(),
            body: body.trim(),
            from_address: fromAddress.trim(),
            to_address: toAddress.trim(),
            mail_date: mailDate,
            mail_time: mailTime,
          },
          newFiles.length > 0 ? newFiles : undefined,
          deletedAttachmentIds.length > 0 ? deletedAttachmentIds : undefined
        );
      } else {
        result = await createMail(
          {
            category,
            subject: subject.trim(),
            body: body.trim(),
            from_address: fromAddress.trim(),
            to_address: toAddress.trim(),
            mail_date: mailDate,
            mail_time: mailTime,
          },
          newFiles.length > 0 ? newFiles : undefined
        );
      }

      if (result) {
        onToast?.(isEditing ? 'Mail updated successfully' : 'Mail created successfully', 'success');
        onSuccess?.(result);
        onClose();
      } else {
        onToast?.('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Set Now ──────────────────────────────────────────────────────────────────
  function setNow() {
    setMailDate(format.today());
    setMailTime(format.currentTime());
  }

  // ─── Remove existing attachment ────────────────────────────────────────────
  function removeExistingAttachment(id: string) {
    setDeletedAttachmentIds((prev) => [...prev, id]);
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit mail' : 'Compose mail'}>
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Mail' : '✉️ Compose New Mail'}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close form"
            id="modal-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-grid">

              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="form-category">
                  <Tag size={13} /> Category
                </label>
                <select
                  id="form-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MailCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label" htmlFor="form-subject">
                  <FileText size={13} /> Subject {errors.subject && <span style={{ color: 'var(--danger)', textTransform: 'none', fontWeight: 400 }}>— {errors.subject}</span>}
                </label>
                <input
                  id="form-subject"
                  className="form-input"
                  type="text"
                  placeholder="Mail subject…"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-required="true"
                />
              </div>

              {/* From / To */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="form-from">
                    <User size={13} /> From {errors.fromAddress && <span style={{ color: 'var(--danger)', textTransform: 'none', fontWeight: 400 }}>— required</span>}
                  </label>
                  <input
                    id="form-from"
                    className="form-input"
                    type="text"
                    placeholder={isInbound ? 'Sender name / email…' : 'Dr. Abo Elfath'}
                    value={fromAddress}
                    onChange={(e) => setFrom(e.target.value)}
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-to">
                    <Mail size={13} /> To {errors.toAddress && <span style={{ color: 'var(--danger)', textTransform: 'none', fontWeight: 400 }}>— required</span>}
                  </label>
                  <input
                    id="form-to"
                    className="form-input"
                    type="text"
                    placeholder={isInbound ? 'Dr. Abo Elfath' : 'Recipient name / email…'}
                    value={toAddress}
                    onChange={(e) => setTo(e.target.value)}
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={13} /> Date & Time
                  {(errors.mailDate || errors.mailTime) && (
                    <span style={{ color: 'var(--danger)', textTransform: 'none', fontWeight: 400 }}>— required</span>
                  )}
                </label>
                <div className="form-date-row">
                  <input
                    id="form-date"
                    className="form-input"
                    type="date"
                    value={mailDate}
                    onChange={(e) => setMailDate(e.target.value)}
                    aria-required="true"
                  />
                  <input
                    id="form-time"
                    className="form-input"
                    type="time"
                    value={mailTime}
                    onChange={(e) => setMailTime(e.target.value)}
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="form-now-btn"
                    onClick={setNow}
                    title="Set to today and current time"
                    id="form-now-btn"
                  >
                    <Clock size={13} /> Now
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="form-group">
                <label className="form-label" htmlFor="form-body">
                  <AlignLeft size={13} /> Message Body
                </label>
                <textarea
                  id="form-body"
                  className="form-textarea"
                  placeholder="Write the mail content here…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                />
              </div>

              {/* File Attachments */}
              <div className="form-group">
                <label className="form-label">
                  <Paperclip size={13} /> Attachments
                </label>

                {/* Existing attachments (edit mode) */}
                {existingAttachments.length > 0 && (
                  <div className="file-list" style={{ marginBottom: 10 }}>
                    {existingAttachments.map((att) => {
                      const typeLabel = getFileTypeLabel(att.file_type, att.file_name);
                      const typeClass = getFileTypeClass(att.file_type, att.file_name);
                      return (
                        <div key={att.id} className="file-list-item">
                          <div className={`attachment-icon ${typeClass}`} style={{ width: 22, height: 22, fontSize: 8 }}>
                            {typeLabel}
                          </div>
                          <span className="file-list-item-name">{att.file_name}</span>
                          <span className="file-list-item-size">{format.fileSize(att.file_size)}</span>
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={() => removeExistingAttachment(att.id)}
                            aria-label={`Remove ${att.file_name}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  className={`file-dropzone ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Click or drag files to attach"
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  id="file-dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    aria-label="File input"
                    id="file-input"
                  />
                  <div className="file-dropzone-icon">
                    <Upload size={22} />
                  </div>
                  <p className="file-dropzone-text">
                    <span>Click to browse</span> or drag & drop files here
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    PDF, Word, Excel, images, and more
                  </p>
                </div>

                {/* New files list */}
                {newFiles.length > 0 && (
                  <div className="file-list" style={{ marginTop: 10 }}>
                    {newFiles.map((f, i) => (
                      <div key={i} className="file-list-item">
                        <Paperclip size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span className="file-list-item-name">{f.name}</span>
                        <span className="file-list-item-size">{format.fileSize(f.size)}</span>
                        <button
                          type="button"
                          className="file-remove-btn"
                          onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                          aria-label={`Remove ${f.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              id="form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
              id="form-submit-btn"
            >
              {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Send Mail'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
