// ─── Mail Types ───────────────────────────────────────────────────────────────

export type MailCategory = 'inbox' | 'sent' | 'spam' | 'important';

export interface MailAttachment {
  id: string;
  mail_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface Mail {
  id: string;
  category: MailCategory;
  subject: string;
  body: string;
  from_address: string;
  to_address: string;
  mail_date: string;   // ISO date string e.g. "2024-01-15"
  mail_time: string;   // HH:MM e.g. "14:30"
  created_at: string;
  updated_at: string;
  attachments?: MailAttachment[];
}

export interface CreateMailInput {
  category: MailCategory;
  subject: string;
  body: string;
  from_address: string;
  to_address: string;
  mail_date: string;
  mail_time: string;
}

export interface UpdateMailInput extends Partial<CreateMailInput> {
  id: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface MailState {
  mails: Mail[];
  selectedCategory: MailCategory;
  selectedMail: Mail | null;
  isLoading: boolean;
  isFormOpen: boolean;
  editingMail: Mail | null;
  searchQuery: string;
}

export type MailAction =
  | { type: 'SET_MAILS'; payload: Mail[] }
  | { type: 'SET_CATEGORY'; payload: MailCategory }
  | { type: 'SELECT_MAIL'; payload: Mail | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'OPEN_FORM'; payload?: Mail }
  | { type: 'CLOSE_FORM' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_MAIL'; payload: Mail }
  | { type: 'UPDATE_MAIL'; payload: Mail }
  | { type: 'DELETE_MAIL'; payload: string };
