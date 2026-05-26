// ─── Utility helpers ──────────────────────────────────────────────────────────

export const format = {
  shortDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
      if (isToday) return 'Today';
      const isThisYear = date.getFullYear() === now.getFullYear();
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: isThisYear ? undefined : 'numeric',
      });
    } catch {
      return dateStr;
    }
  },

  longDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  },

  time(timeStr: string): string {
    if (!timeStr) return '';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    } catch {
      return timeStr;
    }
  },

  fileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  today(): string {
    return new Date().toISOString().split('T')[0];
  },

  currentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  },
};

// ─── File type detection ──────────────────────────────────────────────────────

export function getFileTypeLabel(mimeType: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (mimeType.includes('pdf') || ext === 'pdf') return 'PDF';
  if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) return 'DOC';
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  )
    return 'XLS';
  if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return 'IMG';
  if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(ext)) return 'PPT';
  return ext.toUpperCase() || 'FILE';
}

export function getFileTypeClass(mimeType: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (mimeType.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) return 'doc';
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  )
    return 'xls';
  if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return 'img';
  return 'other';
}
