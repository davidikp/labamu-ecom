import { describe, it, expect } from 'vitest';
import { clampRating, starFillPercent, formatRating } from './starMath';

describe('starMath', () => {
  it('formats a fractional rating to 1 decimal place', () => {
    expect(formatRating(4.8)).toBe('4.8');
  });

  it('formats a whole rating with a trailing .0, never .00', () => {
    expect(formatRating(5)).toBe('5.0');
  });

  it('computes partial fill percent for a fractional rating', () => {
    expect(starFillPercent(4.8)).toBeCloseTo(96);
  });

  it('computes full fill for a perfect rating', () => {
    expect(starFillPercent(5)).toBe(100);
  });

  it('clamps ratings above 5 down to 5', () => {
    expect(clampRating(7)).toBe(5);
    expect(starFillPercent(7)).toBe(100);
  });

  it('clamps ratings below 0 up to 0', () => {
    expect(clampRating(-2)).toBe(0);
  });

  it('treats a non-numeric rating as 0', () => {
    expect(clampRating(undefined)).toBe(0);
    expect(formatRating('not a number')).toBe('0.0');
  });
});
