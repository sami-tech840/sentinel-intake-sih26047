import React from 'react';
import { Stethoscope, UserCheck, Activity, Globe, RefreshCw } from 'lucide-react';
import { LanguageCode } from '../types';

interface NavbarProps {
  currentView: 'patient' | 'clinician';
  onViewChange: (view: 'patient' | 'clinician') => void;
  pendingCount: number;
  totalCount: number;
  criticalFlagCount: number;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onResetSampleData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  pendingCount,
  totalCount,
  criticalFlagCount,
  selectedLanguage,
  onLanguageChange,
  onResetSampleData,
}) => {
  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <header id="sentinel-main-navbar" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Sentinel Intake
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  AYUSH OPD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Patient-First Digital Intake & AI Triage Assistant
              </p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="tab-patient-view"
              type="button"
              onClick={() => onViewChange('patient')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'patient'
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Patient / Kiosk Intake</span>
            </button>

            <button
              id="tab-clinician-view"
              type="button"
              onClick={() => onViewChange('clinician')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentView === 'clinician'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Clinician Dashboard</span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-sky-600 text-white min-w-4">
                  {pendingCount}
                </span>
              )}
              {criticalFlagCount > 0 && (
                <span
                  title={`${criticalFlagCount} active high-risk alerts`}
                  className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                />
              )}
            </button>
          </div>

          {/* Right controls: Language & Reset */}
          <div className="flex items-center gap-2">
            {currentView === 'patient' && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <select
                  id="kiosk-language-selector"
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  aria-label="Preferred Language"
                  className="bg-transparent text-slate-700 font-medium text-xs focus:outline-none cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.label})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="btn-reset-sample-data"
              type="button"
              onClick={onResetSampleData}
              title="Reset sample queue for testing"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
