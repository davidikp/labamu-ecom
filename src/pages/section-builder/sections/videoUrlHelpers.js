/**
 * @module section-builder/sections/videoUrlHelpers
 * @description Recognizes a pasted YouTube/Vimeo URL and turns it into the
 * bits FilesManagement.jsx's "Upload from URL" flow needs — a `{provider,
 * videoId}` pair, an embed URL for real inline playback, and a thumbnail.
 * Shared (not FilesManagement-local) since the same video-aware `mediaType`
 * items it produces also render in every other picker that reads
 * `mediaLibrary` (SelectImageModal, MediaLibraryPanel) — see those files'
 * own video-badge handling.
 */

// Recognizes youtube.com/watch, youtu.be/<id>, youtube.com/shorts/<id>,
// youtube.com/embed/<id>, vimeo.com/<id>, and player.vimeo.com/video/<id>.
// Returns null for anything else (including a malformed URL), so callers
// can fall back to treating the input as a plain image URL.
export function parseVideoUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return id ? { provider: 'youtube', videoId: id } : null;
  }
  if (host === 'youtube.com') {
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return id ? { provider: 'youtube', videoId: id } : null;
    }
    const match = u.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/);
    return match ? { provider: 'youtube', videoId: match[1] } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = u.pathname.match(/(\d+)/);
    return match ? { provider: 'vimeo', videoId: match[1] } : null;
  }
  return null;
}

export function youtubeThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function embedUrlFor(provider, videoId) {
  return provider === 'youtube' ? `https://www.youtube.com/embed/${videoId}` : `https://player.vimeo.com/video/${videoId}`;
}

export function watchUrlFor(provider, videoId) {
  return provider === 'youtube' ? `https://www.youtube.com/watch?v=${videoId}` : `https://vimeo.com/${videoId}`;
}

// Vimeo has no static, key-free thumbnail URL the way YouTube does — this
// hits Vimeo's public oEmbed endpoint (no auth, CORS-enabled) to get one.
// Resolves to null (never throws) on any network/parse failure so callers
// can treat that the same as "not a valid video" without a try/catch of
// their own.
export async function fetchVimeoThumbnail(videoId) {
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(watchUrlFor('vimeo', videoId))}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}
