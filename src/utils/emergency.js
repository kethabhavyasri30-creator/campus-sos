const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars, no 0/O/1/I

export function generateEmergencyId(date = new Date()) {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('');
  return `SOS-${date.getFullYear()}-${suffix}`;
}

export function toMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function formatRelativeTime(ms, now = Date.now()) {
  if (ms == null) return 'Just now';
  const sec = Math.max(0, Math.floor((now - ms) / 1000));
  if (sec < 30) return 'Just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? '' : 's'} ago`;
}

export function filterAlerts(alerts, { status = 'ALL', type = 'ALL', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return alerts.filter((a) => {
    if (status !== 'ALL' && a.status?.toUpperCase() !== status.toUpperCase()) return false;
    if (type !== 'ALL' && a.emergencyType !== type) return false;
    if (!q) return true;
    return [a.studentName, a.studentId, a.id, a.location, a.emergencyType, a.description]
      .some((field) => field?.toLowerCase().includes(q));
  });
}
