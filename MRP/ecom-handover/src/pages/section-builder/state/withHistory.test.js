import { describe, it, expect } from 'vitest';
import { withHistory, initHistory, UNDO, REDO, RESET, MAX_HISTORY } from './withHistory';

function counterReducer(state, action) {
  switch (action.type) {
    case 'INC':
      return { count: state.count + 1 };
    case 'NOOP':
      return state;
    default:
      return state;
  }
}

const SELECT = 'SELECT';
const history = withHistory(counterReducer, new Set([SELECT]));

describe('withHistory', () => {
  it('pushes a history entry per mutating action and undoes it', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: 'INC' });
    state = history(state, { type: 'INC' });
    expect(state.present).toEqual({ count: 2 });
    expect(state.past).toHaveLength(2);

    state = history(state, { type: UNDO });
    expect(state.present).toEqual({ count: 1 });
    expect(state.future).toHaveLength(1);

    state = history(state, { type: UNDO });
    expect(state.present).toEqual({ count: 0 });
  });

  it('redo restores the undone state and redo stack clears on new action', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: 'INC' });
    state = history(state, { type: UNDO });
    state = history(state, { type: REDO });
    expect(state.present).toEqual({ count: 1 });
    expect(state.future).toHaveLength(0);

    // New action after undo clears any future redo stack.
    state = history(state, { type: UNDO });
    state = history(state, { type: 'INC' });
    expect(state.future).toHaveLength(0);
  });

  it('undo/redo are no-ops at the boundaries', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: UNDO });
    expect(state.present).toEqual({ count: 0 });

    state = history(state, { type: 'INC' });
    state = history(state, { type: UNDO });
    const beforeRedo = state;
    state = history(state, { type: REDO });
    const afterRedo = state;
    state = history(state, { type: REDO }); // no future left
    expect(state.present).toEqual(afterRedo.present);
    expect(beforeRedo.present).toEqual({ count: 0 });
  });

  it('caps past entries at MAX_HISTORY', () => {
    let state = initHistory({ count: 0 });
    for (let i = 0; i < MAX_HISTORY + 10; i += 1) {
      state = history(state, { type: 'INC' });
    }
    expect(state.past).toHaveLength(MAX_HISTORY);
    expect(state.present).toEqual({ count: MAX_HISTORY + 10 });
  });

  it('coalesced actions replace present without pushing history', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: 'INC', meta: { coalesce: true } });
    state = history(state, { type: 'INC', meta: { coalesce: true } });
    expect(state.present).toEqual({ count: 2 });
    expect(state.past).toHaveLength(0);
  });

  it('transient action types never push history regardless of meta', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: SELECT });
    expect(state.past).toHaveLength(0);
  });

  it('no-op actions (unchanged reference) do not push history', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: 'NOOP' });
    expect(state.past).toHaveLength(0);
  });

  it('RESET replaces present and clears past/future/presentLabel entirely (US-8.4)', () => {
    let state = initHistory({ count: 0 });
    state = history(state, { type: 'INC', meta: { label: 'Inc' } });
    state = history(state, { type: 'INC', meta: { label: 'Inc again' } });
    expect(state.past).toHaveLength(2);

    state = history(state, { type: RESET, state: { count: 100 } });
    expect(state).toEqual({ past: [], present: { count: 100 }, future: [], presentLabel: null });
  });

  describe('labels (US-7.3)', () => {
    it('tracks presentLabel from action.meta.label and clears to null when untagged', () => {
      let state = initHistory({ count: 0 });
      state = history(state, { type: 'INC', meta: { label: 'Increment once' } });
      expect(state.presentLabel).toBe('Increment once');

      state = history(state, { type: 'INC' });
      expect(state.presentLabel).toBeNull();
    });

    it('undo restores the prior label; redo restores the label being redone', () => {
      let state = initHistory({ count: 0 });
      state = history(state, { type: 'INC', meta: { label: 'First' } });
      state = history(state, { type: 'INC', meta: { label: 'Second' } });
      expect(state.presentLabel).toBe('Second');

      state = history(state, { type: UNDO });
      expect(state.presentLabel).toBe('First');

      state = history(state, { type: REDO });
      expect(state.presentLabel).toBe('Second');
    });

    it('coalesced/transient actions do not change presentLabel', () => {
      let state = initHistory({ count: 0 });
      state = history(state, { type: 'INC', meta: { label: 'First' } });
      state = history(state, { type: 'INC', meta: { coalesce: true, label: 'ignored' } });
      expect(state.presentLabel).toBe('First');

      state = history(state, { type: SELECT, meta: { label: 'ignored' } });
      expect(state.presentLabel).toBe('First');
    });
  });
});
