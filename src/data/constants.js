export const EMERGENCY_TYPES = ['Medical', 'Fire', 'Security', 'Accident', 'Other'];

export const STATUS = Object.freeze({
  ACTIVE: 'Active',
  RESPONDING: 'Responding',
  RESOLVED: 'Resolved',
});

export const TEAM_ROUTING = Object.freeze({
  Medical: 'Medical Team',
  Fire: 'Fire Response Team',
  Security: 'Security Team',
  Accident: 'Medical + Security Team',
  Other: 'Security Team',
});

export const CAMPUS_LOCATIONS = [
  'library',
  'cse dept',
  'mech dept',
  'csit dept',
  'civil dept',
  'cafeteria',
  'hostel',
  's-block',
  'w-block',
  'u-block',
  'IT dept',
  'girls waiting hall',
  'ece dept',
  'AD block',
  'Other'
];

export const EMERGENCY_CONTACTS = Object.freeze({
  phone: import.meta.env.VITE_EMERGENCY_PHONE || '112',
  controlRoomExt: import.meta.env.VITE_CONTROL_ROOM_EXT || '',
});

export { EMERGENCY_CATEGORIES } from './categories';
