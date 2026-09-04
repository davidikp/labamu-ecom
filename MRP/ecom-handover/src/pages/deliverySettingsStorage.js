// Client-side persistence for the Delivery Settings page. There is no backend
// endpoint for this yet — everything lives in localStorage until "Save Changes"
// is clicked, and is reloaded from here the next time the page mounts.
const STORAGE_KEY = 'lb_delivery_settings_v1';

export function loadDeliverySettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDeliverySettings(data) {
  const payload = { ...data, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}
