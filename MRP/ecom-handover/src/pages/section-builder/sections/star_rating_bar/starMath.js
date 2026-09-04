/** Pure star-fill math for Star Rating Bar, kept separate from the Renderer for unit testing. */
export function clampRating(rating) {
  const n = Number(rating);
  if (Number.isNaN(n)) return 0;
  return Math.min(5, Math.max(0, n));
}

/** Percentage (0-100) of the 5-star row that should render filled, e.g. 4.8 -> 96. */
export function starFillPercent(rating) {
  return (clampRating(rating) / 5) * 100;
}

/** Formats a rating to exactly one decimal place, e.g. 5 -> "5.0", 4.8 -> "4.8". */
export function formatRating(rating) {
  return clampRating(rating).toFixed(1);
}
