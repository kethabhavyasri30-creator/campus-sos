import { describe, it, expect } from 'vitest';
import { generateEmergencyId, formatRelativeTime, filterAlerts } from './emergency';
import { TEAM_ROUTING, EMERGENCY_TYPES } from '../data/constants';

describe('generateEmergencyId', () => {
  it('matches SOS-YYYY-XXXXXX with unambiguous chars', () => {
    expect(generateEmergencyId(new Date('2026-10-04'))).toMatch(/^SOS-2026-[A-HJ-NP-Z2-9]{6}$/);
  });
  it('produces no duplicates in 10,000 draws', () => {
    const ids = new Set(Array.from({ length: 10000 }, () => generateEmergencyId()));
    expect(ids.size).toBe(10000);
  });
});

describe('TEAM_ROUTING', () => {
  it('covers every emergency type', () => {
    EMERGENCY_TYPES.forEach((t) => expect(TEAM_ROUTING[t]).toBeTruthy());
    expect(TEAM_ROUTING.Accident).toBe('Medical + Security Team');
  });
});

describe('formatRelativeTime', () => {
  const now = 1_000_000_000_000;
  it.each([
    [now - 10_000, 'Just now'],
    [now - 45_000, '45s ago'],
    [now - 60_000, '1 min ago'],
    [now - 3 * 3600_000, '3 hours ago'],
    [now - 2 * 86400_000, '2 days ago'],
  ])('%s -> %s', (ms, label) => expect(formatRelativeTime(ms, now)).toBe(label));
});

describe('filterAlerts', () => {
  const alerts = [
    { id: 'SOS-1', studentName: 'Priya', studentId: 'S1', location: 'Library', emergencyType: 'Medical', status: 'Active' },
    { id: 'SOS-2', studentName: 'Marcus', studentId: 'S2', location: 'Hostel B', emergencyType: 'Fire', status: 'Resolved' },
  ];
  it('search actually narrows results (regression for B-6)', () => {
    expect(filterAlerts(alerts, { query: 'priya' })).toHaveLength(1);
    expect(filterAlerts(alerts, { query: 'zzz' })).toHaveLength(0);
  });
  it('filters by status and type', () => {
    expect(filterAlerts(alerts, { status: 'ACTIVE' })).toHaveLength(1);
    expect(filterAlerts(alerts, { type: 'Fire' })).toHaveLength(1);
  });
});
