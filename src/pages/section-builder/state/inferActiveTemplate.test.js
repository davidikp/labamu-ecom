import { describe, it, expect } from 'vitest';
import { inferActiveTemplateId, isDefaultTheme } from './inferActiveTemplate';
import { SITE_TEMPLATES } from './siteTemplates';
import { defaultTheme } from './defaultTheme';

const fnb = SITE_TEMPLATES.find((t) => t.id === 'fnb');

describe('inferActiveTemplateId', () => {
  it('matches a theme whose colors and typography equal a known template', () => {
    expect(inferActiveTemplateId({ colors: fnb.theme.colors, typography: fnb.theme.typography })).toBe('fnb');
  });

  it('returns null for the untouched default theme (no template applied yet)', () => {
    expect(inferActiveTemplateId(defaultTheme)).toBeNull();
  });

  it('returns null once a matched theme has been hand-edited (no longer an exact match)', () => {
    const edited = { colors: { ...fnb.theme.colors, primary: '#000000' }, typography: fnb.theme.typography };
    expect(inferActiveTemplateId(edited)).toBeNull();
  });

  it('returns null for undefined/missing theme', () => {
    expect(inferActiveTemplateId(undefined)).toBeNull();
  });
});

describe('isDefaultTheme', () => {
  it('is true for the untouched schema default theme', () => {
    expect(isDefaultTheme(defaultTheme)).toBe(true);
  });

  it('is false for a known template theme', () => {
    expect(isDefaultTheme({ colors: fnb.theme.colors, typography: fnb.theme.typography })).toBe(false);
  });

  it('is false once a color has been hand-edited', () => {
    expect(isDefaultTheme({ colors: { ...defaultTheme.colors, primary: '#123456' }, typography: defaultTheme.typography })).toBe(false);
  });
});
