// Zentrale Konfiguration für API-URLs
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3301';

// Separate Upload-URL die Cloudflare umgeht (für große Dateien)
export const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_BASE || API_BASE;

// Cloudflare Upload-Limit (100MB für kostenlose Accounts)
export const CLOUDFLARE_UPLOAD_LIMIT = 100 * 1024 * 1024; // 100MB in Bytes

// Video-Hover-Previews aktivieren/deaktivieren (temporär auf false für bessere Performance)
export const ENABLE_VIDEO_PREVIEWS = false;

// Registrierung aktivieren/deaktivieren (wenn false, ist nur Login möglich)
export const ENABLE_REGISTRATION = import.meta.env.VITE_ENABLE_REGISTRATION !== 'false';