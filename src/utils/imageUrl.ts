import { API_CONFIG } from '../constants';

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');

  // If it's an absolute URL (http:// or https://)
  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes(API_CONFIG.RELATIVE_UPLOADS_PREFIX) && !trimmed.includes(API_CONFIG.UPLOADS_PREFIX)) {
      return trimmed.replace(API_CONFIG.RELATIVE_UPLOADS_PREFIX, API_CONFIG.UPLOADS_PREFIX);
    }
    return trimmed;
  }

  // If it's a relative upload path starting with /uploads/
  if (trimmed.startsWith(API_CONFIG.RELATIVE_UPLOADS_PREFIX)) {
    return `${baseUrl}${API_CONFIG.API_PREFIX}${trimmed}`;
  }

  // If it's a relative upload path starting with /api/uploads/
  if (trimmed.startsWith(API_CONFIG.UPLOADS_PREFIX)) {
    return `${baseUrl}${trimmed}`;
  }

  return trimmed;
}
