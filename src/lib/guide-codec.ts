import { Guide } from './types';

export const CUSTOM_GUIDES_STORAGE_KEY = 'composio_custom_guides';

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a Guide object into a compact, URL-safe string.
 * Uses CompressionStream('deflate') when available, falling back to base64url.
 */
export async function encodeGuide(guide: Guide): Promise<string> {
  const jsonStr = JSON.stringify(guide);
  try {
    if (typeof CompressionStream !== 'undefined') {
      const cs = new CompressionStream('deflate');
      const writer = cs.writable.getWriter();
      writer.write(new TextEncoder().encode(jsonStr) as unknown as BufferSource);
      writer.close();
      const buf = await new Response(cs.readable).arrayBuffer();
      return 'cz.' + uint8ArrayToBase64Url(new Uint8Array(buf));
    }
  } catch (err) {
    console.warn('CompressionStream failed, using base64 fallback:', err);
  }

  return 'b64.' + uint8ArrayToBase64Url(new TextEncoder().encode(jsonStr));
}

/**
 * Decodes an encoded Guide string back into a Guide object.
 * Supports 'cz.' (deflate compressed), 'b64.' (base64url), or raw JSON.
 */
export async function decodeGuide(encoded: string): Promise<Guide | null> {
  if (!encoded) return null;
  const trimmed = encoded.trim();

  try {
    if (trimmed.startsWith('cz.')) {
      const raw = trimmed.slice(3);
      const bytes = base64UrlToUint8Array(raw);
      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('deflate');
        const writer = ds.writable.getWriter();
        writer.write(bytes as unknown as BufferSource);
        writer.close();
        const text = await new Response(ds.readable).text();
        const parsed = JSON.parse(text);
        if (parsed && parsed.appName && parsed.slug) return parsed as Guide;
      }
    }

    if (trimmed.startsWith('b64.')) {
      const raw = trimmed.slice(4);
      const bytes = base64UrlToUint8Array(raw);
      const text = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(text);
      if (parsed && parsed.appName && parsed.slug) return parsed as Guide;
    }

    // Attempt direct base64 decode if neither prefix is present
    try {
      const bytes = base64UrlToUint8Array(trimmed);
      const text = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(text);
      if (parsed && parsed.appName && parsed.slug) return parsed as Guide;
    } catch {
      // Ignore
    }

    // Direct JSON attempt
    const parsed = JSON.parse(trimmed);
    if (parsed && parsed.appName && parsed.slug) return parsed as Guide;
  } catch (err) {
    console.warn('Failed to decode guide payload:', err);
  }

  return null;
}

/**
 * Builds the appropriate share URL for a guide.
 * Curated presets use the clean URL: /guides/:slug
 * Custom generated guides include the encoded payload in the URL hash: /guides/:slug#data=...
 * This ensures the link works for ANY recipient even across different devices or serverless instances.
 */
export async function getShareUrl(guide: Guide, origin?: string): Promise<string> {
  const baseOrigin =
    origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanPath = `${baseOrigin}/guides/${guide.slug}`;

  // Curated archetypes are guaranteed to exist on server
  if (guide.isPreset) {
    return cleanPath;
  }

  try {
    const encoded = await encodeGuide(guide);
    if (encoded) {
      return `${cleanPath}#data=${encoded}`;
    }
  } catch {
    // Fallback to clean path if encoding fails
  }

  return cleanPath;
}

/**
 * Local storage helpers to persist custom generated guides across browser reloads
 */
export function getStoredGuides(): Guide[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_GUIDES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Guide[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredGuide(guide: Guide): void {
  if (typeof window === 'undefined' || !guide || !guide.id) return;
  try {
    const current = getStoredGuides();
    const updated = [
      guide,
      ...current.filter((g) => g.id !== guide.id && g.slug !== guide.slug),
    ];
    localStorage.setItem(CUSTOM_GUIDES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save guide to localStorage:', err);
  }
}

export function removeStoredGuide(guideId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredGuides();
    const updated = current.filter((g) => g.id !== guideId);
    localStorage.setItem(CUSTOM_GUIDES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to remove guide from localStorage:', err);
  }
}

export function findStoredGuide(idOrSlug: string): Guide | null {
  if (typeof window === 'undefined' || !idOrSlug) return null;
  const normalized = idOrSlug.toLowerCase().trim();
  const current = getStoredGuides();
  return (
    current.find(
      (g) => g.id === idOrSlug || g.slug.toLowerCase() === normalized
    ) || null
  );
}
