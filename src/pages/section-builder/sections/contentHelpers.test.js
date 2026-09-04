import { describe, it, expect } from 'vitest';
import { hasNonDefaultContent } from './contentHelpers';

describe('hasNonDefaultContent', () => {
  it('is false for missing/empty data', () => {
    expect(hasNonDefaultContent({ data: {} })).toBe(false);
    expect(hasNonDefaultContent({})).toBe(false);
  });

  it('is false for blank strings and empty arrays', () => {
    expect(hasNonDefaultContent({ data: { heading: '  ', items: [] } })).toBe(false);
  });

  it('is true when any field has a real value', () => {
    expect(hasNonDefaultContent({ data: { heading: 'Hello' } })).toBe(true);
    expect(hasNonDefaultContent({ data: { items: [1] } })).toBe(true);
    expect(hasNonDefaultContent({ data: { enabled: false } })).toBe(true);
  });
});
