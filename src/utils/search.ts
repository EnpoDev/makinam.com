/**
 * Normalizes text for Turkish search, properly handling uppercase 'İ' / 'I' and case folding.
 */
export function normalizeSearchText(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .trim();
}

/**
 * Extracts only clean numeric digits from a string or number.
 */
export function extractDigits(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[^0-9]/g, '');
}

/**
 * Checks if a listing matches a search query by Listing Number (İlan No), ID, or text fields.
 */
export function matchesListingSearch(item: any, query: string): boolean {
  if (!query || !query.trim()) return true;

  const q = normalizeSearchText(query).replace(/["']/g, '');
  const queryDigits = extractDigits(q);

  // 1. Direct ID checks
  const itemId = normalizeSearchText(item.id);
  const itemDigits = extractDigits(itemId);

  if (itemId === q || itemId.includes(q)) return true;

  // 2. Listing / Ad Number checks (from item.adNo or features array)
  const adNoVal = String(
    item.adNo ||
    item.features?.find((f: any) =>
      normalizeSearchText(f.label).includes('ilan')
    )?.value ||
    ''
  );
  const adNoNormalized = normalizeSearchText(adNoVal);
  const adNoDigits = extractDigits(adNoNormalized);

  if (adNoNormalized && (adNoNormalized === q || adNoNormalized.includes(q))) {
    return true;
  }

  // 3. Numeric matches (e.g. searching 1098338557, 4231, or partial numbers)
  if (queryDigits.length >= 3) {
    if (adNoDigits && adNoDigits.includes(queryDigits)) return true;
    if (itemDigits && itemDigits.includes(queryDigits)) return true;
    if (
      Array.isArray(item.features) &&
      item.features.some((f: any) => extractDigits(f.value).includes(queryDigits))
    ) {
      return true;
    }
  }

  // 4. Text matches (Title, Brand, Model, City, District, Description)
  const title = normalizeSearchText(item.title);
  const brand = normalizeSearchText(item.brand);
  const model = normalizeSearchText(item.model);
  const city = normalizeSearchText(item.city);
  const district = normalizeSearchText(item.district);
  const description = normalizeSearchText(item.description);

  return (
    title.includes(q) ||
    brand.includes(q) ||
    model.includes(q) ||
    city.includes(q) ||
    district.includes(q) ||
    description.includes(q)
  );
}
