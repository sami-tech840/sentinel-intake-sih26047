import React from 'react';
import {
  CheckCircle2,
  Ticket,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
  FileCheck,
  Stethoscope,
  RotateCcw,
} from 'lucide-react';
import { PatientIntakeRecord } from '../../types';

interface StepConfirmationProps {
  intakeRecord: PatientIntakeRecord;
  onGoToClinicianDashboard: (patientId: string) => void;
  onStartNewIntake: () => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  intakeRecord,
  onGoToClinicianDashboard,
  onStartNewIntake,
}) => {
  return (
    <div id="step-confirmation-container" className="max-w-2xl mx-auto py-6 space-y-6 text-center">
      {/* Success Animation & Token Card */}
      <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Intake Successfully Processed & Queued
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          Welcome to Sentinel Ayush OPD
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Your adaptive clinical intake and prior records have been synthesized by Gemini AI and dispatched directly to the attending physician&apos;s queue.
        </p>
      </div>

      {/* OPD Token Box */}
      <div className="p-6 bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200 rounded-3xl shadow-xs text-center space-y-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Ticket className="w-4 h-4 text-teal-600" />
          Your Consultation Token Number
        </span>

        <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-teal-900 font-mono">
          {intakeRecord.tokenNumber}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-600 pt-2 border-t border-teal-200/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Estimated Wait: <strong>~10 mins</strong></span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>OPD Room: <strong>Room 3 (Ayush Triage)</strong></span>
          </div>
        </div>
      </div>

      {/* Intake Receipt Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Intake Summary Receipt</span>
          <span className="text-[11px] font-medium text-slate-400">
            {new Date(intakeRecord.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-slate-400 block text-[11px]">Patient Name</span>
            <span className="font-semibold text-slate-800">{intakeRecord.patientDetails.fullName}</span>
            <span className="text-slate-500 block text-[11px]">
              {intakeRecord.patientDetails.age} yrs • {intakeRecord.patientDetails.gender}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Department / OPD</span>
            <span className="font-semibold text-teal-800">{intakeRecord.patientDetails.department}</span>
            <span className="text-slate-500 block text-[11px]">
              Language: {intakeRecord.patientDetails.preferredLanguage.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <span className="text-slate-400 block text-[11px]">Reported Chief Complaint</span>
          <p className="font-medium text-slate-800 mt-0.5">
            {intakeRecord.patientDetails.chiefComplaintBrief} ({intakeRecord.patientDetails.durationOfComplaint || 'Recent'})
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
            Adaptive questions answered: {intakeRecord.rawAnswers.length}
          </span>
          <span>
            {intakeRecord.extractedDocument ? '✓ Prior records OCR analyzed' : 'No prior records attached'}
          </span>
        </div>
      </div>

      {/* Primary Transition Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          id="btn-switch-to-clinician-detail"
          type="button"
          onClick={() => onGoToClinicianDashboard(intakeRecord.id)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-sky-800 hover:bg-sky-900 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Stethoscope className="w-4 h-4 text-sky-200" />
          <span>View in Clinician Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-start-another-intake"
          type="button"
          onClick={onStartNewIntake}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Start Another Patient Intake</span>
        </button>
      </div>
    </div>
  );
};
