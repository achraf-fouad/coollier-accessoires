export function ensureValidImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800';
  
  // If it's a valid URL or a relative path starting with / or data URL, return it
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }
  
  // If it's a "test.png" style string, it's invalid for next/image without a leading slash
  // But since it's likely a broken link if it's not starting with / or http in our DB context
  // Let's assume it should have been relative or just return a placeholder
  return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800';
}
