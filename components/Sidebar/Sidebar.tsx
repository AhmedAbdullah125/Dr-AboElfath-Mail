'use client';

import { Inbox, Send, AlertTriangle, Star, Mail, Plus, LogOut } from 'lucide-react';
import { useMail } from '@/context/MailContext';
import { MailCategory } from '@/lib/types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CATEGORIES: { id: MailCategory; label: string; icon: React.ElementType }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
  { id: 'important', label: 'Important', icon: Star },
];

export default function Sidebar() {
  const { state, dispatch, fetchMails } = useMail();
  const router = useRouter();

  function handleCategoryClick(cat: MailCategory) {
    dispatch({ type: 'SET_CATEGORY', payload: cat });
    fetchMails(cat);
  }

  function getCategoryCount(cat: MailCategory) {
    if (cat === state.selectedCategory) return state.mails.length;
    return null;
  }

  // Load initial mails
  useEffect(() => {
    fetchMails(state.selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Mail categories">
      {/* Logo / Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Mail size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Mail Manager</span>
            <span className="sidebar-logo-subtitle">Dr. Abo Elfath</span>
          </div>
        </div>
      </div>

      {/* Compose Button */}
      <button
        className="sidebar-compose-btn"
        onClick={() => dispatch({ type: 'OPEN_FORM' })}
        id="compose-btn"
        aria-label="Compose new mail"
      >
        <Plus size={16} />
        <span>Compose</span>
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Folders</div>
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const count = getCategoryCount(id);
          return (
            <button
              key={id}
              id={`nav-${id}`}
              className={`sidebar-nav-item ${state.selectedCategory === id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(id)}
              aria-label={label}
              aria-current={state.selectedCategory === id ? 'page' : undefined}
            >
              <Icon className="sidebar-nav-icon" size={18} />
              <span>{label}</span>
              {count !== null && count > 0 && (
                <span className="sidebar-badge">{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">د</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Dr. Abo Elfath</span>
            <span className="sidebar-user-role">Administrator</span>
          </div>
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
          id="logout-btn"
          aria-label="Sign out"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
