/**
 * Resolves the 3-letter category code based on product category.
 * @param category Product Category (e.g. "WOMEN", "MEN", "KIDS")
 */
export const getCategoryCode = (category: string): string => {
  const upper = category.toUpperCase().trim();
  if (upper === 'WOMEN') return 'WOM';
  if (upper === 'MEN') return 'MEN';
  if (upper === 'KIDS') return 'KID';
  return 'GEN';
};

/**
 * Resolves the 3-letter fabric code based on textile material description.
 * @param fabric Product Fabric name (e.g. "Mulberry Silk", "Banarasi Brocade")
 */
export const getFabricCode = (fabric: string): string => {
  const upper = fabric.toUpperCase().trim();
  if (upper.includes('SILK') && !upper.includes('COTTON') && !upper.includes('TUSSAR') && !upper.includes('CHANDERI')) return 'SIL';
  if (upper.includes('BROCADE')) return 'BRO';
  if (upper.includes('CHANDERI')) return 'CHA';
  if (upper.includes('GEORGETTE')) return 'GEO';
  if (upper.includes('ORGANZA')) return 'ORG';
  if (upper.includes('TUSSAR')) return 'TUS';
  if (upper.includes('COTTON')) return 'COT';
  return 'GEN';
};

/**
 * Auto-generates a product SKU following the structured format: {CATEGORY_CODE}-{FABRIC_CODE}-{SEQUENCE}
 * @param category Product Category
 * @param fabric Product Fabric
 * @param sequence Unique sequence number (will be padded to 4 digits)
 */
export const generateSku = (
  category: string,
  fabric: string,
  sequence: number
): string => {
  const cat = getCategoryCode(category);
  const fab = getFabricCode(fabric);
  const seqStr = String(sequence).padStart(4, '0');
  return `${cat}-${fab}-${seqStr}`;
};

export default {
  getCategoryCode,
  getFabricCode,
  generateSku,
};
