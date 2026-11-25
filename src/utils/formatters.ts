/**
 * Format paise (integer) into Indian Rupee display format (e.g., 125050 -> "₹1,250.50").
 */
export function formatPaiseToINR(paise: number | null | undefined): string {
  if (paise === null || paise === undefined || Number.isNaN(paise)) {
    return '—'
  }
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees)
}

/**
 * Convert a rupees string input (e.g. "1250.50") to integer paise (e.g. 125050).
 * Returns null if the string is empty/whitespace, or NaN if invalid.
 */
export function rupeesToPaise(rupeesStr: string): number | null {
  const trimmed = rupeesStr.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < 0) return Number.NaN
  return Math.round(num * 100)
}

/**
 * Convert integer paise to a clean rupees string for form inputs (e.g. 49900 -> "499.00").
 */
export function paiseToRupeesInput(paise: number | null | undefined): string {
  if (paise === null || paise === undefined || Number.isNaN(paise)) {
    return ''
  }
  return (paise / 100).toFixed(2)
}

/**
 * Generate a URL-safe slug matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate whether a slug matches the PostgreSQL CHECK constraint.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
