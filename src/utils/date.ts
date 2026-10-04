/**
 * Returns a YYYY-MM-DD string using the user's LOCAL timezone.
 * (`toISOString()` uses UTC, which gives the wrong day for users e.g. in IST
 * between 00:00 and 05:30 and breaks daily-streak calculations.)
 */
export const toLocalDateStr = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
