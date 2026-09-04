import { describe, it, expect } from 'vitest';
import { remainingParts, pad2, zonedWallClockToUtcMs } from './countdownMath';

const NOW = Date.parse('2026-01-01T00:00:00Z');

describe('countdownMath', () => {
  it('splits remaining time into days/hours/minutes/seconds', () => {
    const end = new Date(NOW + (1 * 86400 + 2 * 3600 + 3 * 60 + 4) * 1000).toISOString();
    const parts = remainingParts(NOW, end);
    expect(parts).toEqual({ expired: false, days: 1, hours: 2, minutes: 3, seconds: 4 });
  });

  it('reports expired when the end time is in the past', () => {
    const end = new Date(NOW - 1000).toISOString();
    expect(remainingParts(NOW, end).expired).toBe(true);
  });

  it('reports expired when the end time equals now', () => {
    expect(remainingParts(NOW, new Date(NOW).toISOString()).expired).toBe(true);
  });

  it('treats an empty or unparsable end_datetime as expired rather than throwing', () => {
    expect(remainingParts(NOW, '').expired).toBe(true);
    expect(remainingParts(NOW, undefined).expired).toBe(true);
    expect(remainingParts(NOW, 'not a date').expired).toBe(true);
  });

  it('pads single-digit values to two digits', () => {
    expect(pad2(4)).toBe('04');
    expect(pad2(23)).toBe('23');
  });
});

describe('zonedWallClockToUtcMs', () => {
  it('treats a wall clock with no timezone as UTC when no zone is given', () => {
    expect(zonedWallClockToUtcMs('2026-06-15T10:00:00')).toBe(Date.parse('2026-06-15T10:00:00Z'));
  });

  it('treats a wall clock as UTC when timeZone is explicitly "UTC"', () => {
    expect(zonedWallClockToUtcMs('2026-06-15T10:00:00', 'UTC')).toBe(Date.parse('2026-06-15T10:00:00Z'));
  });

  it('converts a wall clock in a fixed-offset zone (no DST) to the correct UTC instant', () => {
    // Asia/Jakarta is UTC+7 year-round — 10:00 there is 03:00 UTC.
    expect(zonedWallClockToUtcMs('2026-06-15T10:00:00', 'Asia/Jakarta')).toBe(Date.parse('2026-06-15T03:00:00Z'));
  });

  it('respects an explicit offset already present on the string, ignoring timeZone', () => {
    expect(zonedWallClockToUtcMs('2026-06-15T10:00:00+07:00', 'UTC')).toBe(Date.parse('2026-06-15T10:00:00+07:00'));
    expect(zonedWallClockToUtcMs('2026-06-15T10:00:00Z', 'Asia/Jakarta')).toBe(Date.parse('2026-06-15T10:00:00Z'));
  });

  it('returns NaN for an empty or unparsable wall clock', () => {
    expect(Number.isNaN(zonedWallClockToUtcMs('', 'UTC'))).toBe(true);
    expect(Number.isNaN(zonedWallClockToUtcMs(undefined, 'UTC'))).toBe(true);
    expect(Number.isNaN(zonedWallClockToUtcMs('not a date', 'UTC'))).toBe(true);
  });
});
