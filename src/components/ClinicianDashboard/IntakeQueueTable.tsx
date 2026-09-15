import React, { useState } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  AlertOctagon,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { AyushDepartment, IntakeStatus, PatientIntakeRecord } from '../../types';

interface IntakeQueueTableProps {
  intakes: PatientIntakeRecord[];
  selectedIntakeId?: string;
  onSelectIntake: (id: string) => void;
}

export const IntakeQueueTable: React.FC<IntakeQueueTableProps> = ({
  intakes,
  selectedIntakeId,
  onSelectIntake,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredIntakes = intakes.filter((item) => {
    // Search filter
    const matchesSearch =
      item.patientDetails.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientDetails.chiefComplaintBrief.toLowerCase().includes(searchQuery.toLowerCase());

    // Department filter
    const matchesDept =
      departmentFilter === 'all' || item.patientDetails.department === departmentFilter;

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getDepartmentBadgeColor = (dept: AyushDepartment) => {
    switch (dept) {
      case 'Panchakarma':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Yoga & Naturopathy':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Unani Medicine':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Siddha Maruthuvam':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Homeopathy OPD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'General Ayurveda':
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  return (
    <div id="intake-queue-container" className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-queue"
              type="text"
              placeholder="Search by patient name, token (e.g. AYUSH-OPD-101) or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 bg-white"
            />
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-filter-department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label="Filter by department"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 bg-white text-slate-700"
            >
              <option value="all">All Specialties ({intakes.length})</option>
              <option value="General Ayurveda">General Ayurveda</option>
              <option value="Panchakarma">Panchakarma</option>
              <option value="Yoga & Naturopathy">Yoga & Naturopathy</option>
              <option value="Unani Medicine">Unani Medicine</option>
              <option value="Siddha Maruthuvam">Siddha Maruthuvam</option>
              <option value="Homeopathy OPD">Homeopathy OPD</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="validated">Clinician Validated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Cards / Rows */}
      <div className="space-y-2.5">
        {filteredIntakes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
            <User className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              No patients found matching your query
            </p>
            <p className="text-[11px] text-slate-400">
              Try changing the search keyword or filter options above.
            </p>
          </div>
        ) : (
          filteredIntakes.map((intake) => {
            const isSelected = selectedIntakeId === intake.id;
            const criticalFlags = intake.redFlags.filter(
              (f) => f.severity === 'CRITICAL' && !f.resolved
            );
            const highFlags = intake.redFlags.filter(
              (f) => f.severity === 'HIGH' && !f.resolved
            );
            const isValidated = intake.status === 'validated';

            return (
              <div
                key={intake.id}
                id={`queue-card-${intake.id}`}
                onClick={() => onSelectIntake(intake.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-600/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left demographics */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {intake.tokenNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getDepartmentBadgeColor(
                          intake.patientDetails.department
                        )}`}
                      >
                        {intake.patientDetails.department}
                      </span>
                      {isValidated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Validated by Clinician</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          AI Draft • Pending Review
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {intake.patientDetails.fullName}
                      </h4>
                      <span className="text-xs text-slate-500">
                        ({intake.patientDetails.age} y • {intake.patientDetails.gender})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      <strong className="text-slate-700">Complaint:</strong>{' '}
                      {intake.patientDetails.chiefComplaintBrief}
                    </p>
                  </div>

                  {/* Right badges & actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Red flag indicators */}
                    <div className="flex items-center gap-1.5">
                      {criticalFlags.length > 0 && (
                        <span
                          title="Critical triage risk alert"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full"
                        >
                          <AlertOctagon className="w-3 h-3 text-rose-600" />
                          <span>{criticalFlags.length} Critical</span>
                        </span>
                      )}
                      {highFlags.length > 0 && (
                        <span
                          title="High risk warning alert"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>{highFlags.length} Warning</span>
                        </span>
                      )}
                      {intake.redFlags.length === 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          No Red Flags
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 hover:text-sky-900">
                      <span>Review Sheet</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
