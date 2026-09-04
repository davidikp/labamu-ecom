import { describe, it, expect } from 'vitest';
import { countEntitiesUsingSlot } from './themeHelpers';

function makeState({ header, footer, sections }) {
  return {
    header: { data: header ?? {} },
    footer: { data: footer ?? {} },
    pages: [{ sections: sections ?? [] }],
  };
}

describe('countEntitiesUsingSlot', () => {
  it('counts header, footer, and sections referencing the slot', () => {
    const state = makeState({
      header: { background_color: { slot: 'primary' } },
      footer: { background_color: { slot: 'accent' } },
      sections: [
        { data: { text_color: { slot: 'primary' } } },
        { data: { text_color: { hex: '#123456' } } },
      ],
    });
    expect(countEntitiesUsingSlot(state, 'primary')).toBe(2);
    expect(countEntitiesUsingSlot(state, 'accent')).toBe(1);
  });

  it('ignores literal hex overrides entirely', () => {
    const state = makeState({ sections: [{ data: { text_color: { hex: '#fff' } } }] });
    expect(countEntitiesUsingSlot(state, 'primary')).toBe(0);
  });

  it('is 0 when nothing references the slot', () => {
    expect(countEntitiesUsingSlot(makeState({}), 'primary')).toBe(0);
  });
});
