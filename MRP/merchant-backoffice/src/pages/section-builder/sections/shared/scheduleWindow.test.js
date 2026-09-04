import { describe, it, expect } from 'vitest';
import { isWithinSchedule } from './scheduleWindow';

const NOW = Date.parse('2026-06-15T12:00:00Z');

describe('isWithinSchedule', () => {
  it('is open with no bounds at all', () => {
    expect(isWithinSchedule(NOW, '', '')).toBe(true);
    expect(isWithinSchedule(NOW, undefined, undefined)).toBe(true);
  });

  it('is closed before an unbounded-end start date', () => {
    const start = new Date(NOW + 1000).toISOString();
    expect(isWithinSchedule(NOW, start, '')).toBe(false);
  });

  it('is open after an unbounded-end start date', () => {
    const start = new Date(NOW - 1000).toISOString();
    expect(isWithinSchedule(NOW, start, '')).toBe(true);
  });

  it('is closed after an unbounded-start end date', () => {
    const end = new Date(NOW - 1000).toISOString();
    expect(isWithinSchedule(NOW, '', end)).toBe(false);
  });

  it('is open before an unbounded-start end date', () => {
    const end = new Date(NOW + 1000).toISOString();
    expect(isWithinSchedule(NOW, '', end)).toBe(true);
  });

  it('is open strictly between both bounds', () => {
    const start = new Date(NOW - 1000).toISOString();
    const end = new Date(NOW + 1000).toISOString();
    expect(isWithinSchedule(NOW, start, end)).toBe(true);
  });

  it('is closed outside both bounds', () => {
    const start = new Date(NOW + 1000).toISOString();
    const end = new Date(NOW + 2000).toISOString();
    expect(isWithinSchedule(NOW, start, end)).toBe(false);
  });

  it('treats an unparsable bound as no bound rather than throwing', () => {
    expect(isWithinSchedule(NOW, 'not a date', 'also not a date')).toBe(true);
  });
});
