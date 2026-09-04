import { describe, it, expect } from 'vitest';
import { slugify, isSlugTaken, defaultMetaTitle } from './pageHelpers';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('About Us')).toBe('about-us');
  });

  it('strips punctuation and collapses repeated separators', () => {
    expect(slugify("Shipping & Returns!!")).toBe('shipping-returns');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('-Leading and trailing-')).toBe('leading-and-trailing');
  });
});

describe('isSlugTaken', () => {
  const pages = [{ id: 'a', slug: 'about-us' }, { id: 'b', slug: 'faq' }];

  it('detects a collision', () => {
    expect(isSlugTaken('about-us', pages)).toBe(true);
  });

  it('is false for a unique slug', () => {
    expect(isSlugTaken('contact', pages)).toBe(false);
  });

  it('excludes the page being edited from the collision check', () => {
    expect(isSlugTaken('about-us', pages, 'a')).toBe(false);
  });
});

describe('defaultMetaTitle', () => {
  it('formats as "Page — Store"', () => {
    expect(defaultMetaTitle('About Us', 'Bloom & Co.')).toBe('About Us — Bloom & Co.');
  });
});
