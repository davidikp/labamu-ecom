import { describe, it, expect } from 'vitest';
import { shouldShowCounter, isFieldVisible, groupFieldsInOrder } from './fieldHelpers';

describe('shouldShowCounter', () => {
  it('is false with no maxLength', () => {
    expect(shouldShowCounter('hello', undefined)).toBe(false);
  });

  it('is false when far from the limit', () => {
    expect(shouldShowCounter('hi', 100)).toBe(false);
  });

  it('is true within 20 chars of the limit and false just below it', () => {
    expect(shouldShowCounter('a'.repeat(80), 100)).toBe(true);
    expect(shouldShowCounter('a'.repeat(79), 100)).toBe(false);
  });

  it('is true at or over the limit', () => {
    expect(shouldShowCounter('a'.repeat(100), 100)).toBe(true);
  });
});

describe('isFieldVisible', () => {
  it('is true when there is no dependsOn', () => {
    expect(isFieldVisible({}, {})).toBe(true);
  });

  it('matches a single expected value', () => {
    const field = { dependsOn: { field: 'show_button', equals: true } };
    expect(isFieldVisible(field, { show_button: true })).toBe(true);
    expect(isFieldVisible(field, { show_button: false })).toBe(false);
    expect(isFieldVisible(field, {})).toBe(false);
  });

  it('matches any value in an array of expected values', () => {
    const field = { dependsOn: { field: 'source', equals: ['collection', 'handpicked'] } };
    expect(isFieldVisible(field, { source: 'handpicked' })).toBe(true);
    expect(isFieldVisible(field, { source: 'best_sellers' })).toBe(false);
  });
});

describe('groupFieldsInOrder', () => {
  it('orders groups content -> media -> layout -> color regardless of declaration order', () => {
    const fields = {
      accent: { group: 'color' },
      image: { group: 'media' },
      heading: { group: 'content' },
      radius: { group: 'layout' },
    };
    const groups = groupFieldsInOrder(fields);
    expect(groups.map((g) => g.group)).toEqual(['content', 'media', 'layout', 'color']);
  });

  it('omits empty groups entirely', () => {
    const fields = { heading: { group: 'content' } };
    const groups = groupFieldsInOrder(fields);
    expect(groups).toHaveLength(1);
    expect(groups[0].group).toBe('content');
  });

  it('defaults ungrouped fields to content', () => {
    const fields = { heading: {} };
    const groups = groupFieldsInOrder(fields);
    expect(groups[0].group).toBe('content');
  });
});
