import { describe, it, expect } from 'vitest';
import { hasUnpublishedChanges } from './draftComparison';

const base = { pages: [{ id: 'home', sections: [] }], theme: { colors: { primary: '#000' } }, header: {}, footer: {} };

describe('hasUnpublishedChanges', () => {
  it('is true whenever nothing has ever been published', () => {
    expect(hasUnpublishedChanges(base, null)).toBe(true);
  });

  it('is false when content is identical to the published snapshot', () => {
    const published = { ...base, savedAt: '2026-01-01T00:00:00Z' };
    expect(hasUnpublishedChanges(base, published)).toBe(false);
  });

  it('is true when pages differ', () => {
    const published = { ...base };
    const current = { ...base, pages: [{ id: 'home', sections: [{ id: 's1' }] }] };
    expect(hasUnpublishedChanges(current, published)).toBe(true);
  });

  it('ignores selection and mediaLibrary differences', () => {
    const published = { ...base, selection: { id: null }, mediaLibrary: [] };
    const current = { ...base, selection: { id: 'header' }, mediaLibrary: [{ id: 'img1' }] };
    expect(hasUnpublishedChanges(current, published)).toBe(false);
  });
});
