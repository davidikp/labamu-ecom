import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFieldCoalescer } from './fieldCoalescer';

describe('createFieldCoalescer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('dispatches coalesced updates immediately, then commits once after the idle window', () => {
    const dispatch = vi.fn();
    const { commitField } = createFieldCoalescer(dispatch, { delayMs: 2000 });

    commitField('heading', { type: 'SET', value: 'H' });
    commitField('heading', { type: 'SET', value: 'He' });
    commitField('heading', { type: 'SET', value: 'Hel' });

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls.every(([action]) => action.meta.coalesce === true)).toBe(true);

    vi.advanceTimersByTime(2000);

    expect(dispatch).toHaveBeenCalledTimes(4);
    const finalCall = dispatch.mock.calls[3][0];
    expect(finalCall.meta.coalesce).toBe(false);
    expect(finalCall.value).toBe('Hel');
  });

  it('switching fields flushes the previous field immediately', () => {
    const dispatch = vi.fn();
    const { commitField } = createFieldCoalescer(dispatch, { delayMs: 2000 });

    commitField('heading', { type: 'SET', value: 'H' });
    commitField('subtext', { type: 'SET', value: 'S' });

    const committedTypes = dispatch.mock.calls.map(([action]) => [action.type, action.value, action.meta.coalesce]);
    expect(committedTypes).toEqual([
      ['SET', 'H', true],
      ['SET', 'H', false], // flushed because a different field started editing
      ['SET', 'S', true],
    ]);
  });
});
