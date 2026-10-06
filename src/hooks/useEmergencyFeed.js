import { useEffect, useMemo, useState } from 'react';
import { subscribeToEmergencies } from '../services/emergencyService';
import { firebaseInitError } from '../firebase/config';
import { STATUS } from '../data/constants';

export function useEmergencyFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(!firebaseInitError);
  const [error, setError] = useState(firebaseInitError?.message ?? null);

  useEffect(() => {
    if (firebaseInitError) return undefined;
    try {
      return subscribeToEmergencies(
        (rows) => { setAlerts(rows); setLoading(false); setError(null); },
        (err) => { setError(err.message); setLoading(false); },
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return undefined;
    }
  }, []);

  const stats = useMemo(() => ({
    total: alerts.length,
    active: alerts.filter((a) => a.status === STATUS.ACTIVE).length,
    responding: alerts.filter((a) => a.status === STATUS.RESPONDING).length,
    resolved: alerts.filter((a) => a.status === STATUS.RESOLVED).length,
  }), [alerts]);

  return { alerts, stats, loading, error };
}
