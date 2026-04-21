export const formatSearchQuery = (query: string) => {
  // Clean query: "iPhone 12 Pro" -> "iphone.*12.*pro"
  // This allows fuzzy matching between terms regardless of spaces
  const clean = query.trim().replace(/\s+/g, '.*');
  return new RegExp(clean, 'i');
};
