/**
 * @module section-builder/state/withHistory
 * @description Generic undo/redo enhancer for a reducer (US-7.1, US-7.2, US-7.5).
 *
 * Wraps `{ past, present, future, presentLabel }` around any reducer. Every
 * dispatched action is passed through the inner reducer to compute the next
 * `present`. Unless the action opts out via `meta.coalesce` (debounced
 * text-field edits, US-7.4) or its type is in `transientTypes` (selection —
 * not undoable content), the previous `present` is pushed onto `past`
 * (capped at MAX_HISTORY, US-7.1) tagged with the label describing how it
 * got there.
 *
 * `presentLabel` is the human-readable description of the action that
 * produced the *current* present — i.e. exactly what "Undo" would undo
 * (US-7.3). Callers attach it via `action.meta.label`; untagged actions
 * default to null and simply don't get a tooltip label.
 *
 * UNDO/REDO are handled here directly and never reach the inner reducer.
 */
export const MAX_HISTORY = 20;

export const UNDO = 'HISTORY/UNDO';
export const REDO = 'HISTORY/REDO';
export const RESET = 'HISTORY/RESET';

export function initHistory(present) {
  return { past: [], present, future: [], presentLabel: null };
}

/**
 * @param {Function} reducer
 * @param {Set<string>} transientTypes - action types that mutate `present`
 *   but should never be undoable (e.g. SELECT) — treated like a coalesced
 *   edit regardless of `meta.coalesce`.
 */
export function withHistory(reducer, transientTypes = new Set()) {
  return function historyReducer(state, action) {
    // Full state replacement, bypassing the inner reducer — used by discard
    // (US-8.4), which explicitly clears the undo stack rather than pushing
    // one more entry onto it.
    if (action.type === RESET) {
      return initHistory(action.state);
    }

    if (action.type === UNDO) {
      if (state.past.length === 0) return state;
      const entry = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: entry.state,
        future: [{ state: state.present, label: state.presentLabel }, ...state.future],
        presentLabel: entry.label,
      };
    }

    if (action.type === REDO) {
      if (state.future.length === 0) return state;
      const [entry, ...rest] = state.future;
      return {
        past: [...state.past, { state: state.present, label: state.presentLabel }].slice(-MAX_HISTORY),
        present: entry.state,
        future: rest,
        presentLabel: entry.label,
      };
    }

    const nextPresent = reducer(state.present, action);

    // No-op action (nothing changed) — don't pollute the undo stack.
    if (nextPresent === state.present) return state;

    // Coalesced edits (e.g. mid-typing keystrokes) replace `present` without
    // creating a new undo step. The final keystroke/blur commits a normal
    // action that pushes history — see fieldCoalescer.
    if (action.meta?.coalesce || transientTypes.has(action.type)) {
      return { ...state, present: nextPresent };
    }

    return {
      past: [...state.past, { state: state.present, label: state.presentLabel }].slice(-MAX_HISTORY),
      present: nextPresent,
      future: [],
      presentLabel: action.meta?.label ?? null,
    };
  };
}
