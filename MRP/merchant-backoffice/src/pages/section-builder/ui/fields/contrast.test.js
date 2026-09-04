import { describe, it, expect } from 'vitest';
import { contrastRatio, passesContrast } from './contrast';

describe('contrastRatio', () => {
  it('is 21:1 for pure black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  it('is 1:1 for identical colors', () => {
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    const a = contrastRatio('#1a1a1a', '#ffffff');
    const b = contrastRatio('#ffffff', '#1a1a1a');
    expect(a).toBeCloseTo(b, 10);
  });

  it('supports 3-digit hex shorthand', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 0);
  });
});

describe('passesContrast', () => {
  it('passes at or above the 4.5:1 default threshold', () => {
    expect(passesContrast('#1a1a1a', '#ffffff')).toBe(true);
  });

  it('fails below the threshold', () => {
    expect(passesContrast('#aaaaaa', '#ffffff')).toBe(false);
  });
});
