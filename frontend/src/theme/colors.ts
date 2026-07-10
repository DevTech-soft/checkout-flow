export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F7',
  primary: '#1A56DB',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#16A34A',
  error: '#DC2626',
} as const;

export type ThemeColors = typeof colors;
