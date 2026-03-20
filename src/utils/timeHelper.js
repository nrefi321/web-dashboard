// utils/timeHelper.js
// Always display times in Bangkok timezone (UTC+7)
// Handles both:
//   - UTC time from API (no suffix):  "2026-03-20T03:32:37"   → adds +07:00
//   - Already BKK time from API:      "2026-03-20T10:32:37"   → shows as-is

const BKK_LOCALE  = 'th-TH'
const BKK_OPTIONS = {
  timeZone: 'Asia/Bangkok',
  year:     'numeric',
  month:    '2-digit',
  day:      '2-digit',
  hour:     '2-digit',
  minute:   '2-digit',
  second:   '2-digit',
  hour12:   false,
}

/**
 * Format an ISO datetime string to Bangkok time.
 * If the string has no timezone info (no Z, no +xx:xx),
 * we treat it as UTC and convert to BKK (+7).
 * If it already has timezone info, we just display in BKK timezone.
 */
export function formatBKK(iso) {
  if (!iso) return '—'

  let date
  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(iso)

  if (hasTimezone) {
    // Already has timezone — parse as-is, display in BKK
    date = new Date(iso)
  } else {
    // No timezone — API likely sending UTC without Z suffix
    // Append Z to treat as UTC, then display converts to BKK
    date = new Date(iso + 'Z')
  }

  if (isNaN(date.getTime())) return iso  // fallback: show raw string

  return date.toLocaleString('en-GB', BKK_OPTIONS)
}