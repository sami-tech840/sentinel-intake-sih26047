import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      id="sentinel-disclaimer-bar"
      className="bg-sky-900 text-sky-100 text-xs px-4 py-2 border-b border-sky-800 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-2 mx-auto sm:mx-0">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-medium">
          Prototype for demonstration only — not for clinical use.
        </span>
        <span className="hidden md:inline text-sky-300">
          | SENTINELS / SIH26047 Ayush Digital OPD Triage System (Assisted by Gemini AI)
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-sky-200">
        <Info className="w-3.5 h-3.5 text-sky-300" />
        <span>Clinician retains ultimate responsibility for all clinical decisions & prescriptions</span>
      </div>
    </div>
  );
};
