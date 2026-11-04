// Helper to resolve asset URLs correctly across both local dev and GitHub Pages base paths

export const getAssetUrl = (relativePath: string): string => {
  // Strip leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Ensure baseUrl ends with a slash
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  return `${normalizedBase}${cleanPath}`;
};
