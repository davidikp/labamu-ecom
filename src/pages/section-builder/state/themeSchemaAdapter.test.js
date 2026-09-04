import { describe, it, expect } from 'vitest';
import { getThemePanelGroups, getGroupSchema } from './themeSchemaAdapter';

describe('getThemePanelGroups', () => {
  it('returns exactly the 5 Epic 5 groups, in order, excluding favicon_and_meta', () => {
    const groups = getThemePanelGroups();
    expect(groups.map((g) => g.key)).toEqual(['typography', 'colors', 'buttons', 'layout', 'product_cards']);
  });

  it('each group carries its raw fields object through untouched', () => {
    const groups = getThemePanelGroups();
    const colors = groups.find((g) => g.key === 'colors');
    expect(colors.fields.primary.default).toBe('#1a1a1a');
    expect(colors.fields.primary_text.contrastCheck).toEqual({ against: 'primary', minRatio: 4.5 });
  });
});

describe('getGroupSchema', () => {
  it('looks up a single group by key', () => {
    expect(getGroupSchema('buttons').fields.corner_radius.default).toBe(4);
  });
});
