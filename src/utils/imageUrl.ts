export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();

  // If it's already an external absolute HTTP/HTTPS URL (e.g. Unsplash, Cloudinary, Bing, external S3)
  // return it directly as-is!
  if (/^https?:\/\//i.test(trimmed)) {
    // If it's your own domain local upload path missing /api/uploads/
    if (trimmed.includes('mealsonwheels.landmaarkdeveloper.com/uploads/') && !trimmed.includes('mealsonwheels.landmaarkdeveloper.com/api/uploads/')) {
      return trimmed.replace('/uploads/', '/api/uploads/');
    }
    if (trimmed.includes('mow.landmaarkdeveloper.com/uploads/')) {
      return trimmed.replace('mow.landmaarkdeveloper.com/uploads/', 'mealsonwheels.landmaarkdeveloper.com/api/uploads/');
    }
    if (trimmed.includes('mow.landmaarkdeveloper.com/api/uploads/')) {
      return trimmed.replace('mow.landmaarkdeveloper.com/api/uploads/', 'mealsonwheels.landmaarkdeveloper.com/api/uploads/');
    }
    return trimmed;
  }

  // If it's a relative local upload path starting with /uploads/
  if (trimmed.startsWith('/uploads/')) {
    return `https://mealsonwheels.landmaarkdeveloper.com/api${trimmed}`;
  }

  if (trimmed.startsWith('/api/uploads/')) {
    return `https://mealsonwheels.landmaarkdeveloper.com${trimmed}`;
  }

  return trimmed;
}
