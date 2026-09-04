// Minimal cross-page navigation guard.
//
// A page with unsaved work registers a guard via setNavigationGuard(). The app
// shell routes module navigation through requestNavigation(proceed): if a guard
// is registered it decides whether to allow the navigation now (return true) or
// defer it (return false) — typically to show a "Discard changes?" modal and
// call `proceed` itself once the user confirms.

let guard = null;

export const setNavigationGuard = (fn) => {
  guard = fn;
};

export const clearNavigationGuard = (fn) => {
  if (!fn || guard === fn) guard = null;
};

export const requestNavigation = (proceed) => {
  if (guard) {
    const allowed = guard(proceed);
    if (allowed) proceed();
    return;
  }
  proceed();
};
