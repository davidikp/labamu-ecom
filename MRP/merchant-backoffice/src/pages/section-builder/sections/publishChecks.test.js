import { describe, it, expect } from 'vitest';
import { PUBLISH_CHECKS, createInitialCheckState, allChecksPass } from './publishChecks';

describe('publishChecks', () => {
  it('starts every check as failing', () => {
    const state = createInitialCheckState();
    expect(Object.values(state).every((v) => v === false)).toBe(true);
    expect(Object.keys(state)).toEqual(PUBLISH_CHECKS.map((c) => c.key));
  });

  it('allChecksPass is true only when every check is true', () => {
    const state = createInitialCheckState();
    expect(allChecksPass(state)).toBe(false);
    PUBLISH_CHECKS.forEach((c) => { state[c.key] = true; });
    expect(allChecksPass(state)).toBe(true);
  });
});
