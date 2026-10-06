import React, { useState } from 'react';
import { Radio, AlertOctagon, User, ShieldAlert } from 'lucide-react';
import { EMERGENCY_CATEGORIES } from '../data/constants';
import { useStudentAlert } from '../hooks/useStudentAlert';
import { useAuth } from '../context/AuthContext';
import CategoryCard from '../components/student/CategoryCard';
import LocationSelector from '../components/student/LocationSelector';
import SosConfirmationModal from '../components/student/SosConfirmationModal';
import SosActiveBanner from '../components/student/SosActiveBanner';

export default function StudentSosPage() {
  const { alert, delivery, send, reset } = useStudentAlert();
  const { studentData } = useAuth();

  // Emergency form state
  const [selectedCategory, setSelectedCategory] = useState('Medical');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenConfirmation = (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setErrorMessage('Please select an emergency category.');
      return;
    }
    if (!location) {
      setErrorMessage('Please choose your general campus location.');
      return;
    }
    if (location === 'Other' && !customLocation.trim()) {
      setErrorMessage('Please describe your specific campus location.');
      return;
    }
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleConfirmSendSos = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await send({
        emergencyType: selectedCategory,
        location,
        customLocation,
        description,
        studentName: studentData?.name || 'Guest User',
        studentId: studentData?.id || 'GUEST',
        gpsCoords
      });
      setIsModalOpen(false);

      // Auto-Dial fallback: Instantly pop open the student's phone dialer 
      // to place a direct cellular call to the faculty member / security.
      setTimeout(() => {
        const facultyNumber = import.meta.env.VITE_DISPATCH_PHONE_NUMBER || '+919441291655';
        window.location.href = `tel:${facultyNumber.replace(/\s+/g, '')}`;
      }, 1000);
    } catch (err) {
      console.error('[Student SOS] Broadcast error:', err);
      setErrorMessage(err.message || 'Failed to send SOS. Call campus security now.');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alert) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-6 px-4 sm:px-6 flex items-center justify-center">
        <SosActiveBanner alert={alert} delivery={delivery} onReset={reset} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-red-400">
                Student Emergency Portal
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Dispatch Online
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Campus SOS Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tap an emergency type below to initiate an immediate security & medical response.
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">{studentData?.name || 'Guest User'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">ID: {studentData?.id || 'GUEST'}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              Verified Student
            </span>
          </div>
        </div>

        <form onSubmit={handleOpenConfirmation} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Select Emergency Category
              </label>
              <span className="text-[11px] text-red-400">*Required</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {EMERGENCY_CATEGORIES.map((cat) => (
                <div key={cat.id} className={cat.id === 'Other' ? 'col-span-2 sm:col-span-1' : ''}>
                  <CategoryCard
                    category={cat}
                    isSelected={selectedCategory === cat.id}
                    onSelect={(id) => {
                      setSelectedCategory(id);
                      setErrorMessage('');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <LocationSelector
            location={location}
            setLocation={(loc) => {
              setLocation(loc);
              setErrorMessage('');
            }}
            customLocation={customLocation}
            setCustomLocation={setCustomLocation}
            gpsCoords={gpsCoords}
            setGpsCoords={setGpsCoords}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="sos-details" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Situation Details <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] text-slate-500">Provide specific cues if possible</span>
            </div>
            <textarea
              id="sos-details"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Near 2nd floor staircase, lab room 204. Patient is unconscious..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors resize-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white font-black text-xl uppercase tracking-wider shadow-2xl shadow-red-950/80 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-red-400/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
              <span>{isSubmitting ? 'TRANSMITTING...' : 'SEND SOS'}</span>
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Tap to open instant confirmation before broadcast
            </p>
          </div>
        </form>
      </div>

      <SosConfirmationModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        onConfirm={handleConfirmSendSos}
        type={selectedCategory}
        location={location}
        customLocation={customLocation}
        description={description}
      />
    </div>
  );
}