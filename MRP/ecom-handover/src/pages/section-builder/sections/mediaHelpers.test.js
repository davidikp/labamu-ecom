import { describe, it, expect } from 'vitest';
import { matchesSearch, findUsages, isMediaInUse } from './mediaHelpers';

describe('matchesSearch', () => {
  it('is true for an empty query', () => {
    expect(matchesSearch({ filename: 'hero.png' }, '')).toBe(true);
  });

  it('matches case-insensitively and partially', () => {
    expect(matchesSearch({ filename: 'Hero-Banner.png' }, 'banner')).toBe(true);
    expect(matchesSearch({ filename: 'Hero-Banner.png' }, 'BANNER')).toBe(true);
  });

  it('is false when the query does not match', () => {
    expect(matchesSearch({ filename: 'hero.png' }, 'logo')).toBe(false);
  });
});

function makeState({ header, footer, sections } = {}) {
  return {
    header: { data: header ?? {} },
    footer: { data: footer ?? {} },
    pages: [{ sections: sections ?? [] }],
  };
}

describe('findUsages / isMediaInUse', () => {
  it('finds header, footer, and section usages', () => {
    const state = makeState({
      header: { logo: { mediaId: 'm1' } },
      sections: [
        { type: 'hero_banner', data: { background_image: { mediaId: 'm1' } } },
        { type: 'image_with_text', data: { image: { mediaId: 'm2' } } },
      ],
    });
    expect(findUsages(state, 'm1')).toEqual(['header', 'hero_banner']);
    expect(isMediaInUse(state, 'm1')).toBe(true);
    expect(isMediaInUse(state, 'm2')).toBe(true);
  });

  it('is false when nothing references the media id', () => {
    const state = makeState();
    expect(isMediaInUse(state, 'm1')).toBe(false);
  });
});
