import {
  collection, doc, getDoc, limit, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { EMERGENCY_TYPES, STATUS, TEAM_ROUTING } from '../data/constants';
import { generateEmergencyId, toMillis } from '../utils/emergency';

const COLLECTION = 'emergencies';
const WRITE_ACK_TIMEOUT_MS = 8000;
const MAX_ID_ATTEMPTS = 3;

function requireDb() {
  if (!db) {
    throw new Error('Emergency network is not connected. Please call campus security directly.');
  }
  return db;
}

export function normalizeEmergency(snap) {
  const data = snap.data({ serverTimestamps: 'estimate' });
  return {
    ...data,
    docId: snap.id,
    createdAtMs: toMillis(data.createdAt),
    respondedAtMs: toMillis(data.respondedAt),
    resolvedAtMs: toMillis(data.resolvedAt),
    isSyncing: snap.metadata.hasPendingWrites,
  };
}

/**
 * MOBILE SIREN (ntfy via local alert server)
 * Fired first and independently so nothing (email, Firestore latency) can delay it.
 */
async function sendSirenAlert(payload) {
  const body = JSON.stringify({
    id: payload.id,
    studentName: payload.studentName,
    studentId: payload.studentId,
    emergencyType: payload.emergencyType,
    location: payload.location,
    description: payload.description,
    gpsCoords: payload.gpsCoords,
  });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true, // survives page navigation / tab switch
      });
      if (res.ok) {
        console.log('[SOS] Mobile siren dispatched');
        return true;
      }
      console.warn(`[SOS] Siren attempt ${attempt} failed: HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[SOS] Siren attempt ${attempt} failed:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 700 * attempt));
  }
  console.error('[SOS] Mobile siren could not be delivered');
  return false;
}

/**
 * FREE TIER EMAIL (EmailJS)
 */
async function sendEmailAlert(payload) {
  const mapLink = payload.gpsCoords ? `GPS Map: https://maps.google.com/?q=${payload.gpsCoords.lat},${payload.gpsCoords.lng}` : '';
  const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!(emailJsServiceId && emailJsTemplateId && emailJsPublicKey)) return;

  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailJsServiceId,
        template_id: emailJsTemplateId,
        user_id: emailJsPublicKey,
        template_params: {
          student_name: payload.studentName,
          student_id: payload.studentId,
          emergency_type: payload.emergencyType,
          location: payload.location,
          description: payload.description,
          map_link: mapLink
        }
      })
    });
    console.log('Email sent via EmailJS');
  } catch (err) {
    console.error('EmailJS failed:', err);
  }
}

function sendFreeNotifications(payload) {
  // Both run in parallel; neither blocks the other or the UI.
  sendSirenAlert(payload);
  sendEmailAlert(payload);
}

export async function createEmergency(input) {
  const database = requireDb();
  const { emergencyType, location, customLocation, description, studentName, studentId, gpsCoords } = input;

  if (!EMERGENCY_TYPES.includes(emergencyType)) {
    throw new Error('Please select a valid emergency category.');
  }
  const custom = customLocation?.trim();
  if (!location || (location === 'Other' && !custom)) {
    throw new Error('Please select your campus location.');
  }

  for (let attempt = 1; attempt <= MAX_ID_ATTEMPTS; attempt += 1) {
    const id = generateEmergencyId();
    const ref = doc(database, COLLECTION, id);

    const payload = {
      id,
      studentName,
      studentId,
      emergencyType,
      location: location === 'Other' ? `Other (${custom})` : location,
      description: (description ?? '').trim().slice(0, 1000),
      gpsCoords: gpsCoords || null,
      status: STATUS.ACTIVE,
      assignedTeam: TEAM_ROUTING[emergencyType],
      createdAt: serverTimestamp(),
      respondedAt: null,
      resolvedAt: null,
    };

    const write = setDoc(ref, payload);
    write.catch(() => {}); // prevent unhandled rejection if it fails after the timeout

    try {
      const delivery = await Promise.race([
        write.then(() => 'confirmed'),
        new Promise((resolve) => setTimeout(() => resolve('queued'), WRITE_ACK_TIMEOUT_MS)),
      ]);
      
      // Fire the siren for BOTH 'confirmed' and 'queued' — an emergency must never
      // be silenced just because Firestore was slow to acknowledge on mobile data.
      sendFreeNotifications(payload);

      return { id, delivery, payload };
    } catch (err) {
      const isCollision = err?.code === 'permission-denied'
        && (await getDoc(ref).then((s) => s.exists()).catch(() => false));
      if (isCollision && attempt < MAX_ID_ATTEMPTS) continue;
      throw err;
    }
  }
  throw new Error('Could not allocate an emergency ID. Please call campus security.');
}

async function transition(docId, allowedFrom, patch) {
  const database = requireDb();
  const ref = doc(database, COLLECTION, docId);
  await runTransaction(database, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('This emergency no longer exists.');
    const current = snap.data().status;
    if (!allowedFrom.includes(current)) {
      throw new Error(`Already ${current.toLowerCase()} — no change made.`);
    }
    tx.update(ref, patch);
  });
}

export const respondToEmergency = (docId) =>
  transition(docId, [STATUS.ACTIVE], {
    status: STATUS.RESPONDING,
    respondedAt: serverTimestamp(),
  });

export const resolveEmergency = (docId) =>
  transition(docId, [STATUS.ACTIVE, STATUS.RESPONDING], {
    status: STATUS.RESOLVED,
    resolvedAt: serverTimestamp(),
  });

export function subscribeToEmergencies(onData, onError, max = 200) {
  const database = requireDb();
  const q = query(collection(database, COLLECTION), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snap) => onData(snap.docs.map(normalizeEmergency)),
    onError,
  );
}

export function subscribeToEmergency(id, onData, onError) {
  const database = requireDb();
  return onSnapshot(
    doc(database, COLLECTION, id),
    { includeMetadataChanges: true },
    (snap) => onData(snap.exists() ? normalizeEmergency(snap) : null),
    onError,
  );
}
