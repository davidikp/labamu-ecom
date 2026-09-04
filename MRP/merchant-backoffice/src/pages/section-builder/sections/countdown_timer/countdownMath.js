/** Pure countdown math for Countdown Timer, kept separate from the Renderer for unit testing. */

const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;

/**
 * Resolves a merchant-entered end_datetime to a real UTC instant, so every
 * customer's countdown expires at the same moment regardless of their own
 * browser's timezone. `wallClockIso` has no offset (e.g. "2026-12-31T23:59:00")
 * and is meant to represent that wall-clock time IN `timeZone` — if it already
 * carries an explicit offset/`Z`, it's unambiguous and used as-is.
 */
export function zonedWallClockToUtcMs(wallClockIso, timeZone) {
  if (typeof wallClockIso !== 'string' || wallClockIso.trim() === '') return NaN;
  const trimmed = wallClockIso.trim();
  if (HAS_OFFSET.test(trimmed)) return Date.parse(trimmed);

  // Treat the wall-clock components as UTC first, purely as a stable numeric
  // anchor (any anchor on the right calendar date resolves DST correctly).
  const anchorMs = Date.parse(`${trimmed}Z`);
  if (Number.isNaN(anchorMs)) return NaN;
  if (!timeZone || timeZone === 'UTC') return anchorMs;

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(anchorMs).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  const asIfFormattedInZone = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  const offsetMs = asIfFormattedInZone - anchorMs;
  return anchorMs - offsetMs;
}

export function remainingParts(nowMs, endIso, timeZone) {
  const endMs = zonedWallClockToUtcMs(endIso, timeZone);
  if (Number.isNaN(endMs)) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const diffMs = endMs - nowMs;
  if (diffMs <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    expired: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}
