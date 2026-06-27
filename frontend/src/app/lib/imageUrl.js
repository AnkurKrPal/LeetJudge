const RAW_GITHUB_URL_PATTERN = /^https?:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.+)$/;

export function resolveImageUrl(src) {
  if (!src) return src;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  if (src.startsWith('/uploads') || src.startsWith('/api/images')) {
    return `${baseUrl}${src}`;
  }

  return src;
}
