'use client';

import { Pencil, Trash2, Calendar, Clock, Mail, ArrowLeft, Paperclip, MailOpen } from 'lucide-react';
import { useMail } from '@/context/MailContext';
import { Mail as MailType } from '@/lib/types';
import { format, getFileTypeLabel, getFileTypeClass } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  inbox: 'Inbox', sent: 'Sent', spam: 'Spam', important: 'Important',
};

export default function MailDetail({
  onEdit,
  onDelete,
}: {
  onEdit: (mail: MailType) => void;
  onDelete: (mail: MailType) => void;
}) {
  const { state } = useMail();
  const mail = state.selectedMail;

  if (!mail) {
    return (
      <section className="mail-detail-panel" aria-label="Mail content">
        <div className="mail-detail-empty">
          <div className="mail-detail-empty-icon">
            <MailOpen size={38} />
          </div>
          <h2>Select a mail to read</h2>
          <p>Choose a mail from the list on the left to view its content here.</p>
        </div>
      </section>
    );
  }

  const isInbox = mail.category === 'inbox' || mail.category === 'spam' || mail.category === 'important';
  const hasAttachments = mail.attachments && mail.attachments.length > 0;

  return (
    <section className="mail-detail-panel" aria-label="Mail content">
      {/* Header */}
      <header className="mail-detail-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className={`mail-card-tag tag-${mail.category}`} style={{ fontSize: 11 }}>
              {CATEGORY_LABELS[mail.category]}
            </span>
            {hasAttachments && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Paperclip size={11} /> {mail.attachments!.length} attachment{mail.attachments!.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h2 className="mail-detail-subject">{mail.subject}</h2>
        </div>

        <div className="mail-detail-actions">
          <button
            className="detail-action-btn primary"
            onClick={() => onEdit(mail)}
            id="detail-edit-btn"
            aria-label="Edit mail"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            className="detail-action-btn danger"
            onClick={() => onDelete(mail)}
            id="detail-delete-btn"
            aria-label="Delete mail"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </header>

      {/* Meta */}
      <div className="mail-detail-meta" role="region" aria-label="Mail metadata">
        <div className="meta-item">
          <span className="meta-label"><Mail size={13} /> {isInbox ? 'From' : 'To'}</span>
          <span className="meta-value highlight">
            {isInbox ? mail.from_address : mail.to_address}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label"><ArrowLeft size={13} /> {isInbox ? 'To' : 'From'}</span>
          <span className="meta-value">
            {isInbox ? mail.to_address : mail.from_address}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label"><Calendar size={13} /> Date</span>
          <span className="meta-value">{format.longDate(mail.mail_date)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label"><Clock size={13} /> Time</span>
          <span className="meta-value">{format.time(mail.mail_time)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="mail-detail-body" role="region" aria-label="Mail body">
        <p className="mail-body-content">
          {mail.body || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No content</span>}
        </p>
      </div>

      {/* Attachments */}
      {hasAttachments && (
        <div className="attachments-section">
          <div className="attachments-title">
            <Paperclip size={14} />
            Attachments ({mail.attachments!.length})
          </div>
          <div className="attachments-grid">
            {mail.attachments!.map((att) => {
              const typeLabel = getFileTypeLabel(att.file_type, att.file_name);
              const typeClass = getFileTypeClass(att.file_type, att.file_name);
              return (
                <a
                  key={att.id}
                  className="attachment-chip"
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={att.file_name}
                  title={att.file_name}
                  id={`attachment-${att.id}`}
                >
                  <div className={`attachment-icon ${typeClass}`}>{typeLabel}</div>
                  <div className="attachment-info">
                    <span className="attachment-name">{att.file_name}</span>
                    <span className="attachment-size">{format.fileSize(att.file_size)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
