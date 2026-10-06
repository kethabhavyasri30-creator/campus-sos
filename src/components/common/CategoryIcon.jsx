import React from 'react';
import { HeartPulse, Flame, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';

export default function CategoryIcon({ type, className = "w-5 h-5" }) {
  switch (type?.toLowerCase()) {
    case 'medical':
      return <HeartPulse className={className} />;
    case 'fire':
      return <Flame className={className} />;
    case 'security':
      return <ShieldAlert className={className} />;
    case 'accident':
      return <AlertTriangle className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}
