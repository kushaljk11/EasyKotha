export function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function base64Decode(base64) {
  if (!base64) return null;

  try {
    const standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(standardBase64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("base64Decode failed:", error);
    return null;
  }
}
