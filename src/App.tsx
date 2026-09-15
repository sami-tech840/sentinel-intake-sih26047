import React, { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { PatientKioskFlow } from './components/PatientKiosk/PatientKioskFlow';
import { ClinicianDashboardView } from './components/ClinicianDashboard/ClinicianDashboardView';
import { LanguageCode, PatientIntakeRecord } from './types';
import { INITIAL_SAMPLE_INTAKES } from './data/sampleCases';
import { Activity, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'patient' | 'clinician'>('patient');
  const [intakes, setIntakes] = useState<PatientIntakeRecord[]>(INITIAL_SAMPLE_INTAKES);
  const [activePatientId, setActivePatientId] = useState<string | undefined>(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Fetch initial intakes from backend
  const fetchIntakes = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/intakes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setIntakes(data);
        }
      }
    } catch (err) {
      console.warn('Backend sync failed, using local in-memory fallback:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  // When a new intake is submitted from Patient Kiosk
  const handleIntakeSubmitted = (newRecord: PatientIntakeRecord) => {
    setIntakes((prev) => [newRecord, ...prev.filter((i) => i.id !== newRecord.id)]);
  };

  // Jump directly to Clinician view and open the newly submitted patient's case sheet
  const handleGoToClinicianDetail = (patientId: string) => {
    setActivePatientId(patientId);
    setCurrentView('clinician');
  };

  // Clinician updates or validates a record
  const handleUpdateIntake = (updated: PatientIntakeRecord) => {
    setIntakes((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  // Reset demo data to initial state for testing
  const handleResetSampleData = () => {
    setIntakes(JSON.parse(JSON.stringify(INITIAL_SAMPLE_INTAKES)));
    setActivePatientId(undefined);
  };

  const pendingCount = intakes.filter((i) => i.status !== 'validated').length;
  const criticalFlagCount = intakes.reduce(
    (acc, curr) => acc + (curr.redFlags?.filter((f) => f.severity === 'CRITICAL' && !f.resolved).length || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 antialiased font-sans">
      {/* Top Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main App Navigation & Screen Switcher */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'clinician' && !activePatientId) {
            // Keep on queue view
          }
        }}
        pendingCount={pendingCount}
        totalCount={intakes.length}
        criticalFlagCount={criticalFlagCount}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onResetSampleData={handleResetSampleData}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'patient' ? (
          <PatientKioskFlow
            selectedLanguage={selectedLanguage}
            onIntakeSubmitted={handleIntakeSubmitted}
            onGoToClinicianDashboard={handleGoToClinicianDetail}
          />
        ) : (
          <ClinicianDashboardView
            intakes={intakes}
            activePatientId={activePatientId}
            onUpdateIntake={handleUpdateIntake}
            onSelectPatient={setActivePatientId}
          />
        )}
      </main>

      {/* Trust & Clinical Disclaimer Footer */}
      <footer id="sentinel-footer" className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sentinel Intake</span>
            <span>•</span>
            <span>AYUSH OPD Digital Triage (SIH26047 Prototype)</span>
          </div>

          <div className="text-center sm:text-right font-medium text-slate-600">
            Prototype for demonstration only — not for clinical use.
          </div>
        </div>
      </footer>
    </div>
  );
}
