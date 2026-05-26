'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Mail, MailAction, MailCategory, MailState, CreateMailInput, UpdateMailInput } from '@/lib/types';

// ─── Reducer ──────────────────────────────────────────────────────────────────

function mailReducer(state: MailState, action: MailAction): MailState {
  switch (action.type) {
    case 'SET_MAILS':
      return { ...state, mails: action.payload, isLoading: false };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload, selectedMail: null, searchQuery: '' };
    case 'SELECT_MAIL':
      return { ...state, selectedMail: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'OPEN_FORM':
      return { ...state, isFormOpen: true, editingMail: action.payload || null };
    case 'CLOSE_FORM':
      return { ...state, isFormOpen: false, editingMail: null };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'ADD_MAIL':
      return { ...state, mails: [action.payload, ...state.mails] };
    case 'UPDATE_MAIL':
      return {
        ...state,
        mails: state.mails.map((m) => (m.id === action.payload.id ? action.payload : m)),
        selectedMail: state.selectedMail?.id === action.payload.id ? action.payload : state.selectedMail,
      };
    case 'DELETE_MAIL':
      return {
        ...state,
        mails: state.mails.filter((m) => m.id !== action.payload),
        selectedMail: state.selectedMail?.id === action.payload ? null : state.selectedMail,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface MailContextValue {
  state: MailState;
  dispatch: React.Dispatch<MailAction>;
  fetchMails: (category: MailCategory) => Promise<void>;
  createMail: (input: CreateMailInput, files?: File[]) => Promise<Mail | null>;
  updateMail: (input: UpdateMailInput, newFiles?: File[], deletedAttachmentIds?: string[]) => Promise<Mail | null>;
  deleteMail: (id: string) => Promise<boolean>;
}

const MailContext = createContext<MailContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const initialState: MailState = {
  mails: [],
  selectedCategory: 'inbox',
  selectedMail: null,
  isLoading: false,
  isFormOpen: false,
  editingMail: null,
  searchQuery: '',
};

export function MailProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mailReducer, initialState);

  const fetchMails = useCallback(async (category: MailCategory) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`/api/mails?category=${category}`);
      const json = await res.json();
      if (json.data) {
        dispatch({ type: 'SET_MAILS', payload: json.data });
      }
    } catch (err) {
      console.error('Failed to fetch mails:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createMail = useCallback(async (input: CreateMailInput, files?: File[]): Promise<Mail | null> => {
    try {
      const res = await fetch('/api/mails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!json.data) return null;

      const mail: Mail = json.data;

      // Upload files if any
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('mail_id', mail.id);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
            const uploadJson = await uploadRes.json();
            if (uploadJson.data) {
              mail.attachments = [...(mail.attachments || []), uploadJson.data];
            }
          })
        );
      }

      dispatch({ type: 'ADD_MAIL', payload: mail });
      return mail;
    } catch (err) {
      console.error('Failed to create mail:', err);
      return null;
    }
  }, []);

  const updateMail = useCallback(
    async (input: UpdateMailInput, newFiles?: File[], deletedAttachmentIds?: string[]): Promise<Mail | null> => {
      try {
        // Delete removed attachments
        if (deletedAttachmentIds && deletedAttachmentIds.length > 0) {
          await Promise.all(
            deletedAttachmentIds.map((aid) =>
              fetch(`/api/upload?attachment_id=${aid}`, { method: 'DELETE' })
            )
          );
        }

        const res = await fetch(`/api/mails/${input.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (!json.data) return null;

        const mail: Mail = json.data;

        // Upload new files
        if (newFiles && newFiles.length > 0) {
          await Promise.all(
            newFiles.map(async (file) => {
              const fd = new FormData();
              fd.append('file', file);
              fd.append('mail_id', mail.id);
              const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
              const uploadJson = await uploadRes.json();
              if (uploadJson.data) {
                mail.attachments = [...(mail.attachments || []), uploadJson.data];
              }
            })
          );
        }

        dispatch({ type: 'UPDATE_MAIL', payload: mail });
        return mail;
      } catch (err) {
        console.error('Failed to update mail:', err);
        return null;
      }
    },
    []
  );

  const deleteMail = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/mails/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.data) {
        dispatch({ type: 'DELETE_MAIL', payload: id });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete mail:', err);
      return false;
    }
  }, []);

  return (
    <MailContext.Provider value={{ state, dispatch, fetchMails, createMail, updateMail, deleteMail }}>
      {children}
    </MailContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMail() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error('useMail must be used inside MailProvider');
  return ctx;
}
