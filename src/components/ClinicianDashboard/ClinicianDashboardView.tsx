import React, { useState } from 'react';
import {
  Users,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { PatientIntakeRecord } from '../../types';
import { IntakeQueueTable } from './IntakeQueueTable';
import { IntakeDetailView } from './IntakeDetailView';

interface ClinicianDashboardViewProps {
  intakes: PatientIntakeRecord[];
  activePatientId?: string;
  onUpdateIntake: (updated: PatientIntakeRecord) => void;
  onSelectPatient: (id?: string) => void;
}

export const ClinicianDashboardView: React.FC<ClinicianDashboardViewProps> = ({
  intakes,
  activePatientId,
  onUpdateIntake,
  onSelectPatient,
}) => {
  const selectedIntake = intakes.find((i) => i.id === activePatientId);

  // Summary Metrics
  const totalCount = intakes.length;
  const pendingCount = intakes.filter((i) => i.status !== 'validated').length;
  const validatedCount = intakes.filter((i) => i.status === 'validated').length;
  const totalRedFlags = intakes.reduce(
    (acc, curr) => acc + (curr.redFlags?.filter((f) => !f.resolved).length || 0),
    0
  );

  return (
    <div id="clinician-dashboard-wrapper" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* If a patient is selected, show detail view */}
      {selectedIntake ? (
        <IntakeDetailView
          intake={selectedIntake}
          onBackToQueue={() => onSelectPatient(undefined)}
          onUpdateIntake={onUpdateIntake}
        />
      ) : (
        /* Otherwise show Queue list and Stats */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-sky-800 text-xs font-semibold uppercase tracking-wider mb-1">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Ayush OPD Clinician Triage Workstation</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Patient Intake Queue & Clinical Review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review AI-synthesized clinical summaries, verify red-flag alerts, edit assessment parameters, and validate case sheets.
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total Intakes</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across all Ayush OPDs</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Pending Review</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-sky-700">{pendingCount}</div>
              <div className="text-[11px] text-sky-600/80 mt-0.5">Awaiting doctor sign-off</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Validated Cases</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">{validatedCount}</div>
              <div className="text-[11px] text-emerald-600/80 mt-0.5">Doctor approved</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Active Red Flags</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-rose-700">{totalRedFlags}</div>
              <div className="text-[11px] text-rose-600/80 mt-0.5">Requiring priority triage</div>
            </div>
          </div>

          {/* Queue Table */}
          <IntakeQueueTable
            intakes={intakes}
            onSelectIntake={(id) => onSelectPatient(id)}
          />
        </div>
      )}
    </div>
  );
};
