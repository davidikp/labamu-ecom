/**
 * @module section-builder/sections/shared/scheduleWindow
 * @description Pure "is this ISO datetime window currently open" check, kept
 * separate from any Renderer for unit testing (matches countdown_timer's
 * countdownMath.js pattern). An empty/unparsable bound means "no bound on
 * that side" rather than "always closed" — so a start-only or end-only
 * schedule works as expected.
 */
export function isWithinSchedule(nowMs, startIso, endIso) {
  const startMs = Date.parse(startIso ?? '');
  const endMs = Date.parse(endIso ?? '');
  if (!Number.isNaN(startMs) && nowMs < startMs) return false;
  if (!Number.isNaN(endMs) && nowMs > endMs) return false;
  return true;
}
