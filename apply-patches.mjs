import fs from 'fs';

function updateFile(path, updater) {
  const code = fs.readFileSync(path, 'utf8');
  const newCode = updater(code);
  if (code !== newCode) {
    fs.writeFileSync(path, newCode, 'utf8');
    console.log(`Updated ${path}`);
  }
}

// 1. AlertTable.jsx
updateFile('src/components/staff/AlertTable.jsx', (c) => {
  let res = c;
  res = res.replace(
    'export default function AlertTable({ alerts, onRespond, onResolve }) {',
    'import { formatRelativeTime } from "../../utils/emergency";\nexport default function AlertTable({ alerts, onRespond, onResolve, pendingIds, now }) {'
  );
  res = res.replace(/alert\.id \|\| alert\._docId/g, 'alert.docId');
  res = res.replace(/<span className="text-white">\{alert\.time\}<\/span>/g, '<span className="text-white">{formatRelativeTime(alert.createdAtMs, now)}</span>');
  res = res.replace(
    /onClick=\{\(\) => onRespond\(alert\.id \|\| alert\._docId\)\}/g,
    'disabled={pendingIds.has(alert.docId)} onClick={() => onRespond(alert.docId)}'
  );
  res = res.replace(
    /onClick=\{\(\) => onResolve\(alert\.id \|\| alert\._docId\)\}/g,
    'disabled={pendingIds.has(alert.docId)} onClick={() => onResolve(alert.docId)}'
  );
  return res;
});

// 2. AlertCardMobile.jsx
updateFile('src/components/staff/AlertCardMobile.jsx', (c) => {
  let res = c;
  res = res.replace(
    'export default function AlertCardMobile({ alert, onRespond, onResolve }) {',
    'import { formatRelativeTime } from "../../utils/emergency";\nexport default function AlertCardMobile({ alert, onRespond, onResolve, pendingIds, now }) {'
  );
  res = res.replace(/alert\.id \|\| alert\._docId/g, 'alert.docId');
  res = res.replace(/<span className="text-slate-200">\{alert\.time\}<\/span>/g, '<span className="text-slate-200">{formatRelativeTime(alert.createdAtMs, now)}</span>');
  res = res.replace(
    /onClick=\{\(\) => onRespond\(alert\.id \|\| alert\._docId\)\}/g,
    'disabled={pendingIds.has(alert.docId)} onClick={() => onRespond(alert.docId)}'
  );
  res = res.replace(
    /onClick=\{\(\) => onResolve\(alert\.id \|\| alert\._docId\)\}/g,
    'disabled={pendingIds.has(alert.docId)} onClick={() => onResolve(alert.docId)}'
  );
  return res;
});

// 3. SosActiveBanner.jsx
updateFile('src/components/student/SosActiveBanner.jsx', (c) => {
  let res = c;
  res = res.replace(
    'export default function SosActiveBanner({ alert, onReset }) {',
    'import { EMERGENCY_CONTACTS } from "../../data/constants";\nimport { useNow } from "../../hooks/useNow";\nimport { formatRelativeTime } from "../../utils/emergency";\nexport default function SosActiveBanner({ alert, delivery, onReset }) {\nconst now = useNow();'
  );
  res = res.replace(/alert\.time/g, 'formatRelativeTime(alert.createdAtMs, now)');
  res = res.replace(/href="tel:911"/g, 'href={`tel:${EMERGENCY_CONTACTS.phone}`}');
  res = res.replace(
    '<div className="w-full max-w-lg mx-auto bg-slate-900',
    `{delivery === 'queued' && (
        <div role="status" className="mb-4 p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-200 text-xs">
          <strong>Weak connection:</strong> your SOS is saved on this device and will send automatically.
          Please also call <a className="underline font-bold" href={\`tel:\${EMERGENCY_CONTACTS.phone}\`}>{EMERGENCY_CONTACTS.phone}</a> now.
        </div>
      )}\n      <div className="w-full max-w-lg mx-auto bg-slate-900`
  );
  return res;
});

// 4. SosConfirmationModal.jsx
updateFile('src/components/student/SosConfirmationModal.jsx', (c) => {
  let res = c;
  res = res.replace(
    'import { AlertTriangle, X, ShieldAlert, MapPin, Clock } from \'lucide-react\';',
    'import { useEffect, useRef } from "react";\nimport { AlertTriangle, X, ShieldAlert, MapPin, Clock } from \'lucide-react\';'
  );
  res = res.replace(
    'export default function SosConfirmationModal({ isOpen, onClose, onConfirm, type, location, customLocation, description }) {',
    `export default function SosConfirmationModal({ isOpen, isSubmitting, onClose, onConfirm, type, location, customLocation, description }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    confirmRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);`
  );
  res = res.replace(
    '<div className="relative w-full max-w-sm bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">',
    '<div role="dialog" aria-modal="true" aria-labelledby="sos-confirm-title" aria-describedby="sos-confirm-desc" className="relative w-full max-w-sm bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">'
  );
  res = res.replace(
    '<h3 className="text-xl font-black text-white">',
    '<h3 id="sos-confirm-title" className="text-xl font-black text-white">'
  );
  res = res.replace(
    '<p className="text-sm text-slate-400 mt-1">',
    '<p id="sos-confirm-desc" className="text-sm text-slate-400 mt-1">'
  );
  res = res.replace(
    /<button\s+type="button"\s+onClick=\{onConfirm\}/g,
    '<button ref={confirmRef} disabled={isSubmitting} aria-busy={isSubmitting} type="button" onClick={onConfirm}'
  );
  res = res.replace(
    />\s*Broadcast Emergency SOS Now\s*<\/button>/g,
    '>{isSubmitting ? "Sending..." : "Broadcast Emergency SOS Now"}</button>'
  );
  res = res.replace(
    /<button\s+onClick=\{onClose\}\s+className="text-slate-400 hover:text-white transition-colors p-1"/g,
    '<button aria-label="Close" onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1"'
  );
  return res;
});

// 5. CategoryCard.jsx
updateFile('src/components/student/CategoryCard.jsx', (c) => {
  let res = c;
  res = res.replace('<button\n      type="button"', '<button\n      type="button"\n      aria-pressed={isSelected}');
  res = res.replace('<CategoryIcon type={category.id} className="w-6 h-6" />', '<CategoryIcon aria-hidden="true" type={category.id} className="w-6 h-6" />');
  return res;
});

// 6. LocationSelector.jsx
updateFile('src/components/student/LocationSelector.jsx', (c) => {
  let res = c;
  res = res.replace(
    '<label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">',
    '<label htmlFor="sos-location" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">'
  );
  res = res.replace(
    '<select\n          value={location}',
    '<select\n          id="sos-location"\n          required\n          value={location}'
  );
  return res;
});

// 7. StatCards.jsx (Fix STATUS usage to uppercase properties to match constants if it was lowercase)
// Wait, in StatCards it expects stats.active, stats.responding, stats.resolved. That is correct.
