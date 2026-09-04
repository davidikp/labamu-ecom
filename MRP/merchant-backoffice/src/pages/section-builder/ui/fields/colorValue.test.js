import { describe, it, expect } from 'vitest';
import { resolveColor, isSlotReference } from './colorValue';
import { builderReducer, ACTIONS } from '../../state/builderReducer';
import { withHistory, initHistory, UNDO } from '../../state/withHistory';

describe('resolveColor + theme undo (US-7.5, US-7.6)', () => {
  it('a slot-reference field automatically reflects a theme color undo — no per-section revert needed', () => {
    const history = withHistory(builderReducer);
    let state = initHistory({
      pages: [],
      header: { data: {} },
      footer: { data: {} },
      theme: { colors: { primary: '#111111' } },
      selection: { id: null },
    });

    state = history(state, {
      type: ACTIONS.UPDATE_THEME_FIELD,
      group: 'colors',
      field: 'primary',
      value: '#222222',
      meta: { label: 'Theme → Primary color' },
    });
    expect(state.present.theme.colors.primary).toBe('#222222');

    const sectionColor = { slot: 'primary' };
    expect(resolveColor(sectionColor, state.present.theme.colors)).toBe('#222222');

    state = history(state, { type: UNDO });
    expect(state.present.theme.colors.primary).toBe('#111111');
    // Same section value, re-resolved against the reverted palette — no
    // section-level undo action was needed for this to update.
    expect(resolveColor(sectionColor, state.present.theme.colors)).toBe('#111111');
  });

  it('a literal hex override is untouched by theme undo in either direction', () => {
    const history = withHistory(builderReducer);
    let state = initHistory({
      pages: [],
      header: { data: {} },
      footer: { data: {} },
      theme: { colors: { primary: '#111111' } },
      selection: { id: null },
    });

    const overrideValue = { hex: '#abcdef' };
    expect(isSlotReference(overrideValue)).toBe(false);
    expect(resolveColor(overrideValue, state.present.theme.colors)).toBe('#abcdef');

    state = history(state, { type: ACTIONS.UPDATE_THEME_FIELD, group: 'colors', field: 'primary', value: '#999999' });
    expect(resolveColor(overrideValue, state.present.theme.colors)).toBe('#abcdef');

    state = history(state, { type: UNDO });
    expect(resolveColor(overrideValue, state.present.theme.colors)).toBe('#abcdef');
  });
});
