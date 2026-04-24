/**
 * Utility to localize numerals for Arabic documents.
 */
export const toArabicNumerals = (str: string | number): string => {
  if (str === null || str === undefined) return '';
  const s = str.toString();
  const id= ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return s.replace(/[0-9]/g, (w) => id[+w]);
};

/**
 * Auto-translates simple labels or preserves numbers in Arabic contexts
 */
export const localizeContent = (text: string): string => {
  if (!text) return '';
  // Basic mapping for common units that can be auto-extended
  const mapping: Record<string, string> = {
    'GB': 'جيجابايت',
    'TB': 'تيرابايت',
    'RAM': 'رام',
    'New': 'جديد',
    'Used': 'مستخدم',
    'Refurbished': 'مجدد',
    'Urgent': 'عاجل',
    'VIP': 'كبار الشخصيات'
  };

  let localized = text;
  Object.entries(mapping).forEach(([eng, ar]) => {
    localized = localized.replace(new RegExp(eng, 'gi'), ar);
  });

  // Convert any numbers found in the text to Arabic numerals
  return toArabicNumerals(localized);
};
