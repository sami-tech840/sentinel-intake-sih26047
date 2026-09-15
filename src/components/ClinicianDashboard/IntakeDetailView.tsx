import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  ShieldCheck,
  Printer,
  Sparkles,
  Save,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  FileText,
} from 'lucide-react';
import { ClinicalCaseSummary, PatientIntakeRecord } from '../../types';
import { RedFlagAlertCard } from './RedFlagAlertCard';
import { AyushCaseSheetEditor } from './AyushCaseSheetEditor';
import { RawIntakeDrawer } from './RawIntakeDrawer';
import { PatientHistoryVisualization } from './PatientHistoryVisualization';


interface IntakeDetailViewProps {
  intake: PatientIntakeRecord;
  onBackToQueue: () => void;
  onUpdateIntake: (updated: PatientIntakeRecord) => void;
}

export const IntakeDetailView: React.FC<IntakeDetailViewProps> = ({
  intake,
  onBackToQueue,
  onUpdateIntake,
}) => {
  const [currentSummary, setCurrentSummary] = useState<ClinicalCaseSummary>(
    intake.editedCaseSummary || intake.aiCaseSummary
  );
  const [redFlags, setRedFlags] = useState(intake.redFlags || []);
  const [doctorName, setDoctorName] = useState(
    intake.validatedByDoctorName || 'Dr. V. S. Sharma, MD (Ayurveda)'
  );
  const [doctorRegNo, setDoctorRegNo] = useState(
    intake.doctorRegistrationNumber || 'AYUSH-CCIM-2018-94102'
  );
  const [clinicianNotes, setClinicianNotes] = useState(intake.clinicianNotes || '');
  const [activeTab, setActiveTab] = useState<'case_sheet' | 'history_visualization'>('case_sheet');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const isValidated = intake.status === 'validated';

  // Toggle Red flag acknowledged
  const handleToggleRedFlag = (alertId: string) => {
    const updatedFlags = redFlags.map((f) =>
      f.id === alertId ? { ...f, resolved: !f.resolved } : f
    );
    setRedFlags(updatedFlags);
    onUpdateIntake({
      ...intake,
      redFlags: updatedFlags,
    });
  };

  // Save edits to server
  const handleSaveEdits = async (markValidated: boolean = false) => {
    setIsSaving(true);
    setSaveSuccessMsg(null);

    const updatedRecord: PatientIntakeRecord = {
      ...intake,
      editedCaseSummary: currentSummary,
      redFlags,
      clinicianNotes,
      status: markValidated ? 'validated' : intake.status,
      validatedAt: markValidated ? new Date().toISOString() : intake.validatedAt,
      validatedByDoctorName: markValidated ? doctorName : intake.validatedByDoctorName,
      doctorRegistrationNumber: markValidated ? doctorRegNo : intake.doctorRegistrationNumber,
    };

    try {
      const res = await fetch(`/api/intakes/${intake.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      });

      if (!res.ok) {
        throw new Error('Failed to update record');
      }

      const saved: PatientIntakeRecord = await res.json();
      onUpdateIntake(saved);
      setSaveSuccessMsg(
        markValidated
          ? 'Case sheet successfully validated and digitally stamped by clinician.'
          : 'Changes saved successfully.'
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Update intake error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="intake-detail-view-container" className="space-y-6 pb-12">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          id="btn-back-to-queue"
          type="button"
          onClick={onBackToQueue}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Case Sheet</span>
          </button>

          <button
            id="btn-save-draft"
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveEdits(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-sky-800 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-sky-700" />
            <span>Save Draft Edits</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Patient Demographics Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-300">
                {intake.tokenNumber}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                {intake.patientDetails.department}
              </span>
              {isValidated ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Validated by Clinician</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>AI Synthesized Draft • Requires Doctor Sign-off</span>
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              {intake.patientDetails.fullName}
            </h1>
            <p className="text-xs text-slate-500">
              Age: <strong>{intake.patientDetails.age} years</strong> • Gender:{' '}
              <strong>{intake.patientDetails.gender}</strong> • Preferred Language:{' '}
              <strong className="uppercase">{intake.patientDetails.preferredLanguage}</strong> • Phone:{' '}
              <strong>{intake.patientDetails.phone || 'Not provided'}</strong>
            </p>
          </div>

          <div className="text-xs text-slate-500 text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            <div>Submitted: {new Date(intake.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            {isValidated && intake.validatedAt && (
              <div className="text-emerald-700 font-semibold mt-0.5">
                Validated: {new Date(intake.validatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinician Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            id="tab-case-sheet"
            type="button"
            onClick={() => setActiveTab('case_sheet')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'case_sheet'
                ? 'border-sky-600 text-sky-800 bg-sky-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ayush Case Sheet & Triage</span>
            {redFlags.length > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {redFlags.length} Alert{redFlags.length > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <button
            id="tab-history-visualization"
            type="button"
            onClick={() => setActiveTab('history_visualization')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history_visualization'
                ? 'border-teal-600 text-teal-900 bg-teal-50/60 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Longitudinal History & Metrics</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Timeline & Graphs
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-[11px] text-slate-400 italic pr-2">
          {activeTab === 'case_sheet'
            ? 'Editable clinical documentation & sign-off'
            : 'Multi-year event milestones & vital trends'}
        </div>
      </div>

      {activeTab === 'case_sheet' ? (
        <div className="space-y-6">
          {/* Longitudinal History Callout Banner */}
          <div className="bg-gradient-to-r from-teal-50/80 via-sky-50/80 to-slate-50 border border-teal-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-950 block">
                  Comprehensive Patient History & Metric Trajectory Available
                </span>
                <span className="text-[11px] text-teal-800">
                  Interactive timeline tracking prior procedures, diagnoses, medications, and vital sign trends over time.
                </span>
              </div>
            </div>
            <button
              id="btn-switch-to-history-tab"
              type="button"
              onClick={() => setActiveTab('history_visualization')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span>Inspect History Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Red-Flag Alerts Section */}
          {redFlags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  AI Red-Flag Safety Screen ({redFlags.length} Prompt{redFlags.length > 1 ? 's' : ''})
                </h3>
                <span className="text-[11px] text-slate-500">
                  High-risk symptoms, contraindicated herbal therapies & drug interactions
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {redFlags.map((alert) => (
                  <RedFlagAlertCard
                    key={alert.id}
                    alert={alert}
                    onToggleResolve={handleToggleRedFlag}
                    isClinicianEditable={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Core Clinical Case Sheet (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-700" />
                <span>Ayush OPD Clinical Case Sheet & Assessment</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Click any field to edit directly
              </span>
            </div>

            <AyushCaseSheetEditor
              summary={currentSummary}
              isValidated={isValidated}
              onChange={setCurrentSummary}
            />
          </div>

          {/* Clinician Validation Confirmation Action Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold">
                    Clinician Validation & Authorization
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  As the attending registered Ayush practitioner, you review, modify, and authorize this digital clinical record. The AI operates solely as an intake and documentation assistant.
                </p>
              </div>

              {isValidated && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Signed & Approved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor="input-doctor-name" className="block text-slate-300 font-semibold mb-1">
                  Physician / Vaidya Name
                </label>
                <input
                  id="input-doctor-name"
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. V. S. Sharma, BAMS, MD (Ayu)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-teal-400 text-xs"
                />
              </div>

              <div>
                <label htmlFor="input-doctor-reg" className="block text-slate-300 font-semibold mb-1">
                  State Board / NCISM Registration No.
                </label>
                <input
                  id="input-doctor-reg"
                  type="text"
                  value={doctorRegNo}
                  onChange={(e) => setDoctorRegNo(e.target.value)}
                  placeholder="e.g. AYUSH-CCIM-2018-94102"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-teal-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-clinician-remarks" className="block text-slate-300 font-semibold mb-1 text-xs">
                Clinician Directives / Prescription Orders / Follow-up Advice
              </label>
              <textarea
                id="input-clinician-remarks"
                rows={2}
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                placeholder="Add final clinical orders, specific dosage titrations, or follow-up instructions..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-teal-400 text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 italic">
                Stamping marks this case sheet as &quot;Clinician Validated&quot; across all audit logs.
              </span>

              <button
                id="btn-validate-case-sheet"
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveEdits(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>
                  {isValidated ? 'Re-confirm Clinician Validation' : 'Confirm & Validate by Clinician'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient History Visualization Component */}
          <PatientHistoryVisualization
            intake={intake}
            onUpdateIntake={onUpdateIntake}
          />
        </div>
      )}

      {/* Raw Intake & Source Documents Audit Drawer */}
      <RawIntakeDrawer intake={intake} />
    </div>
  );
};
