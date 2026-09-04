import { describe, it, expect } from 'vitest';
import { defaultsForSchema } from './schemaDefaults';

describe('defaultsForSchema', () => {
  it('maps each field to its declared default', () => {
    const schema = {
      heading: { type: 'text', default: 'Hello' },
      background_color: { type: 'color', default: { slot: 'surface' } },
    };
    expect(defaultsForSchema(schema)).toEqual({
      heading: 'Hello',
      background_color: { slot: 'surface' },
    });
  });

  it('falls back to null for fields with no declared default (e.g. repeaters)', () => {
    const schema = { items: { type: 'repeater' } };
    expect(defaultsForSchema(schema)).toEqual({ items: null });
  });
});
