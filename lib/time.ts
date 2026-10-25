export function timeToMinutes(value: unknown): number | null {
  const m = String(value ?? "").match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function storeIsOpen(store: { jam_buka?: string | null; jam_tutup?: string | null }) {
  const open = timeToMinutes(store.jam_buka);
  const close = timeToMinutes(store.jam_tutup);
  if (open === null || close === null || open === close) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  return open < close ? cur >= open && cur < close : cur >= open || cur < close;
}

export function formatTime(value: unknown) {
  const minutes = timeToMinutes(value);
  if (minutes === null) return "-";
  const d = new Date();
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatStoreHours(store: { jam_buka?: string | null; jam_tutup?: string | null }) {
  if (timeToMinutes(store.jam_buka) === null || timeToMinutes(store.jam_tutup) === null) return "-";
  return `${formatTime(store.jam_buka)} - ${formatTime(store.jam_tutup)}`;
}
