'use client';

import { Search, Pencil, Trash2, Inbox, RefreshCw } from 'lucide-react';
import { useMail } from '@/context/MailContext';
import { Mail } from '@/lib/types';
import { format } from '@/lib/utils';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ height: 13, width: '50%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '20%', borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 11, width: '65%', borderRadius: 4 }} />
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  inbox: 'Inbox', sent: 'Sent', spam: 'Spam', important: 'Important',
};

export default function MailList({
  onEdit,
  onDelete,
}: {
  onEdit: (mail: Mail) => void;
  onDelete: (mail: Mail) => void;
}) {
  const { state, dispatch, fetchMails } = useMail();
  const { mails, selectedCategory, selectedMail, isLoading, searchQuery } = state;

  const filtered = mails.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.from_address.toLowerCase().includes(q) ||
      m.to_address.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q)
    );
  });

  return (
    <section className="mail-list-panel" aria-label="Mail list">
      {/* Header */}
      <div className="mail-list-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="mail-list-title">
            {CATEGORY_LABELS[selectedCategory]}
            <span className="mail-list-count">({filtered.length})</span>
          </h1>
          <button
            onClick={() => fetchMails(selectedCategory)}
            title="Refresh"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 6,
              transition: 'var(--transition)',
            }}
            className="refresh-btn"
            id="refresh-mails-btn"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="mail-search-bar">
          <Search className="mail-search-icon" />
          <input
            id="mail-search-input"
            className="mail-search-input"
            type="search"
            placeholder="Search mails…"
            value={searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            aria-label="Search mails"
          />
        </div>
      </div>

      {/* Body */}
      <div className="mail-list-body">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="mail-list-empty">
            <div className="mail-list-empty-icon">
              <Inbox size={28} />
            </div>
            <h3>{searchQuery ? 'No results found' : 'No mails here'}</h3>
            <p>
              {searchQuery
                ? 'Try a different search term.'
                : 'This folder is empty. Compose a new mail to get started.'}
            </p>
          </div>
        ) : (
          filtered.map((mail) => (
            <MailCard
              key={mail.id}
              mail={mail}
              isSelected={selectedMail?.id === mail.id}
              onSelect={() => dispatch({ type: 'SELECT_MAIL', payload: mail })}
              onEdit={() => onEdit(mail)}
              onDelete={() => onDelete(mail)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function MailCard({
  mail,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  mail: Mail;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isInbox = mail.category === 'inbox' || mail.category === 'spam' || mail.category === 'important';
  const displayAddress = isInbox ? mail.from_address : mail.to_address;

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit();
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete();
  }

  return (
    <article
      className={`mail-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Mail: ${mail.subject}`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      id={`mail-card-${mail.id}`}
    >
      <div className="mail-card-header">
        <span className="mail-card-from">{displayAddress}</span>
        <span className="mail-card-date">{format.shortDate(mail.mail_date)}</span>
      </div>

      <div className="mail-card-subject">{mail.subject}</div>
      <div className="mail-card-preview">{mail.body}</div>

      <div className="mail-card-footer">
        <div className="mail-card-tags">
          {mail.attachments && mail.attachments.length > 0 && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              📎 {mail.attachments.length}
            </span>
          )}
          <span className={`mail-card-tag tag-${mail.category}`}>{mail.category}</span>
        </div>

        <div className="mail-card-actions">
          <button
            className="mail-card-action-btn"
            onClick={handleEdit}
            title="Edit"
            id={`edit-btn-${mail.id}`}
            aria-label={`Edit ${mail.subject}`}
          >
            <Pencil size={13} />
          </button>
          <button
            className="mail-card-action-btn danger"
            onClick={handleDelete}
            title="Delete"
            id={`delete-btn-${mail.id}`}
            aria-label={`Delete ${mail.subject}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
