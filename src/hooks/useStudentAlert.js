import { useCallback, useEffect, useState } from 'react';
import { createEmergency, subscribeToEmergency } from '../services/emergencyService';

const STORAGE_KEY = 'campus-sos:active-alert';

function readStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null; } catch { return null; }
}

export function useStudentAlert() {
  const [stored, setStored] = useState(readStored);   // { id, delivery, payload }
  const [live, setLive] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stored?.id) return undefined;
    try {
      return subscribeToEmergency(stored.id, setLive, (err) => setError(err.message));
    } catch (err) {
      setError(err.message);
      return undefined;
    }
  }, [stored?.id]);

  const send = useCallback(async (input) => {
    setError(null);
    const result = await createEmergency(input);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    setStored(result);
    return result;
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStored(null);
    setLive(null);
  }, []);

  const alert = live ?? (stored ? { ...stored.payload, createdAtMs: null, isSyncing: true } : null);
  const delivery = live && !live.isSyncing ? 'confirmed' : stored?.delivery ?? null;

  return { alert, delivery, error, send, reset };
}
