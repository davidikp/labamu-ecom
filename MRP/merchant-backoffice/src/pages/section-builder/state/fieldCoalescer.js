/**
 * @module section-builder/state/fieldCoalescer
 * @description Debounces per-field edits into a single undo step (US-7.4).
 *
 * Every keystroke dispatches the action with `meta.coalesce = true` so
 * withHistory updates `present` without pushing a new undo entry. After
 * `delayMs` of inactivity on that field, the same action is re-dispatched
 * without the coalesce flag, committing exactly one history entry for the
 * whole edit. Switching focus to a different field (a different `key`)
 * flushes the previous field's pending commit immediately.
 */
export function createFieldCoalescer(dispatch, { delayMs = 2000 } = {}) {
  let timers = new Map(); // key -> { timeoutId, lastAction }

  function flush(key) {
    const pending = timers.get(key);
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    timers.delete(key);
    dispatch({ ...pending.lastAction, meta: { ...pending.lastAction.meta, coalesce: false } });
  }

  function flushAll() {
    for (const key of Array.from(timers.keys())) flush(key);
  }

  function commitField(key, action) {
    // A different field is being edited — commit the previous one now.
    for (const otherKey of timers.keys()) {
      if (otherKey !== key) flush(otherKey);
    }

    const existing = timers.get(key);
    if (existing) clearTimeout(existing.timeoutId);

    dispatch({ ...action, meta: { ...action.meta, coalesce: true } });

    const timeoutId = setTimeout(() => flush(key), delayMs);
    timers.set(key, { timeoutId, lastAction: action });
  }

  return { commitField, flush, flushAll };
}
