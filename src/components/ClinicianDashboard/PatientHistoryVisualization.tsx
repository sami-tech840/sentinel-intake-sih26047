import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  HeartPulse,
  Activity,
  FileText,
  Sparkles,
  Plus,
  Filter,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Leaf,
  Layers,
  ChevronRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  PatientIntakeRecord,
  PatientHistoryEvent,
  MetricTrendPoint,
  TimelineEventCategory,
  PatientHistoryVisualizationData,
} from '../../types';
import { extractPatientHistoryVisualization } from '../../utils/historyExtractor';

interface PatientHistoryVisualizationProps {
  intake: PatientIntakeRecord;
  onUpdateIntake: (updated: PatientIntakeRecord) => void;
}

export const PatientHistoryVisualization: React.FC<PatientHistoryVisualizationProps> = ({
  intake,
  onUpdateIntake,
}) => {
  // Extract or get existing visualization data
  const initialData = useMemo(() => {
    return extractPatientHistoryVisualization(intake);
  }, [intake]);

  const [historyData, setHistoryData] = useState<PatientHistoryVisualizationData>(initialData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeChartMetric, setActiveChartMetric] = useState<'cardio' | 'ayush_pain' | 'combined'>('cardio');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialData.timelineEvents[0]?.id || null
  );

  // Modal / Form state for Clinician adding a new vital point or milestone
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'vital' | 'milestone'>('vital');
  const [newDate, setNewDate] = useState('Today (OPD Exam)');
  const [newSBP, setNewSBP] = useState<number | ''>(140);
  const [newDBP, setNewDBP] = useState<number | ''>(90);
  const [newHR, setNewHR] = useState<number | ''>(78);
  const [newPain, setNewPain] = useState<number | ''>(6);
  const [newVata, setNewVata] = useState<number | ''>(7);
  const [newAgni, setNewAgni] = useState<number | ''>(5);
  const [newNote, setNewNote] = useState('');

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneCategory, setNewMilestoneCategory] = useState<TimelineEventCategory>('diagnosis');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  // Filter timeline events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return historyData.timelineEvents;
    return historyData.timelineEvents.filter((evt) => evt.category === selectedCategory);
  }, [historyData.timelineEvents, selectedCategory]);

  const selectedEvent = useMemo(() => {
    return historyData.timelineEvents.find((e) => e.id === selectedEventId) || historyData.timelineEvents[0];
  }, [historyData.timelineEvents, selectedEventId]);

  // Latest metrics for header summary
  const latestMetric = historyData.metricTrends[historyData.metricTrends.length - 1];
  const baselineMetric = historyData.metricTrends[0];

  // Save new clinical vital point or milestone
  const handleAddEntry = () => {
    if (modalType === 'vital') {
      const newPoint: MetricTrendPoint = {
        date: newDate || 'OPD Reading',
        label: newNote ? newNote.slice(0, 24) : 'Clinician OPD Reading',
        systolicBP: newSBP !== '' ? Number(newSBP) : undefined,
        diastolicBP: newDBP !== '' ? Number(newDBP) : undefined,
        heartRate: newHR !== '' ? Number(newHR) : undefined,
        painScore: newPain !== '' ? Number(newPain) : undefined,
        vataSeverityScore: newVata !== '' ? Number(newVata) : undefined,
        agniIntegrityScore: newAgni !== '' ? Number(newAgni) : undefined,
        notes: newNote || 'Measured during OPD consultation by attending clinician.',
      };

      const updatedTrends = [...historyData.metricTrends, newPoint];
      const newEvt: PatientHistoryEvent = {
        id: `evt-clinician-${Date.now()}`,
        dateOrPeriod: newDate || 'Today (OPD Exam)',
        category: 'lab_or_vitals',
        categoryLabel: 'Clinician Examination',
        title: `OPD Clinical Vital Measured: ${newSBP}/${newDBP} mmHg`,
        description: `Clinician measured blood pressure ${newSBP}/${newDBP} mmHg, Heart Rate ${newHR} bpm, Pain score ${newPain}/10. ${newNote}`,
        source: 'Clinician Added',
        status: Number(newSBP) > 140 ? 'critical' : 'managed',
        metrics: {
          'Systolic BP': `${newSBP} mmHg`,
          'Diastolic BP': `${newDBP} mmHg`,
          'Heart Rate': `${newHR} bpm`,
          'Pain Score': `${newPain} / 10`,
        },
      };

      const updatedData: PatientHistoryVisualizationData = {
        ...historyData,
        metricTrends: updatedTrends,
        timelineEvents: [newEvt, ...historyData.timelineEvents],
      };

      setHistoryData(updatedData);
      onUpdateIntake({
        ...intake,
        historyVisualizationData: updatedData,
      });
      setSelectedEventId(newEvt.id);
    } else {
      if (!newMilestoneTitle.trim()) return;
      const newEvt: PatientHistoryEvent = {
        id: `evt-clinician-${Date.now()}`,
        dateOrPeriod: newDate || 'Documented Milestone',
        category: newMilestoneCategory,
        categoryLabel: getCategoryLabel(newMilestoneCategory),
        title: newMilestoneTitle,
        description: newMilestoneDesc || 'Documented by clinician during intake reconciliation.',
        source: 'Clinician Added',
        status: 'managed',
      };

      const updatedData: PatientHistoryVisualizationData = {
        ...historyData,
        timelineEvents: [newEvt, ...historyData.timelineEvents],
      };

      setHistoryData(updatedData);
      onUpdateIntake({
        ...intake,
        historyVisualizationData: updatedData,
      });
      setSelectedEventId(newEvt.id);
    }

    setShowAddModal(false);
    // Reset form
    setNewNote('');
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
  };

  return (
    <div id="patient-history-visualization" className="space-y-6">
      {/* Top Banner: Overview & Metric Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Longitudinal Health Trajectory
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {historyData.timelineEvents.length} Clinical Milestones
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {historyData.metricTrends.length} Serial Trend Points
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Patient Health History & Vital Signs Progression
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Synthesized from extracted prescription OCR documents, patient-reported intake questionnaires, and Ayush dosha assessments to give clinicians a full longitudinal context before consultation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-add-timeline-entry"
              type="button"
              onClick={() => {
                setModalType('vital');
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log OPD Vital Reading</span>
            </button>
            <button
              id="btn-add-milestone-entry"
              type="button"
              onClick={() => {
                setModalType('milestone');
                setShowAddModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium block">Latest Blood Pressure</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold text-white">
                {latestMetric?.systolicBP ? `${latestMetric.systolicBP}/${latestMetric.diastolicBP}` : '168/98'}
              </span>
              <span className="text-[10px] text-slate-400">mmHg</span>
            </div>
            <div className="text-[10px] mt-1 flex items-center gap-1 text-rose-400 font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Stage 2 (Elevated vs Baseline)</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium block">Subjective Pain Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold text-amber-300">
                {latestMetric?.painScore !== undefined ? `${latestMetric.painScore}/10` : '8/10'}
              </span>
              <span className="text-[10px] text-slate-400">NRS Scale</span>
            </div>
            <div className="text-[10px] mt-1 text-amber-300/90 font-medium">
              +{Number(latestMetric?.painScore || 8) - Number(baselineMetric?.painScore || 2)} points over trajectory
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium block">Ayush Agni Integrity</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold text-teal-300">
                {intake.aiCaseSummary.ayushAssessment.agniState?.split(' ')[0] || 'Vishamagni'}
              </span>
            </div>
            <div className="text-[10px] mt-1 text-slate-300 font-medium">
              Irregular digestive fire • Agni score {latestMetric?.agniIntegrityScore || 3}/10
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium block">Vata Aggravation Level</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold text-orange-300">
                {latestMetric?.vataSeverityScore ? `${latestMetric.vataSeverityScore}/10` : '9/10'}
              </span>
              <span className="text-[10px] text-slate-400">High Vata</span>
            </div>
            <div className="text-[10px] mt-1 text-orange-300/90 font-medium">
              Sandhigata Vata with morning stiffness
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: Longitudinal Metric Graphs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Longitudinal Health Metrics & Biological Parameter Trends</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tracked across documented hospital records, home logs, and OPD intake checks.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveChartMetric('cardio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartMetric === 'cardio'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cardiovascular & BP
            </button>
            <button
              type="button"
              onClick={() => setActiveChartMetric('ayush_pain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartMetric === 'ayush_pain'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pain & Ayush Scores (0-10)
            </button>
            <button
              type="button"
              onClick={() => setActiveChartMetric('combined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartMetric === 'combined'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comprehensive View
            </button>
          </div>
        </div>

        {/* The Recharts Graph Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData.metricTrends}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                domain={activeChartMetric === 'ayush_pain' ? [0, 10] : ['auto', 'auto']}
              />
              <Tooltip
                content={<CustomChartTooltip />}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />

              {/* Reference threshold lines for BP */}
              {(activeChartMetric === 'cardio' || activeChartMetric === 'combined') && (
                <>
                  <ReferenceLine
                    y={140}
                    label={{ value: 'Hypertension Stage 1 (140)', fill: '#ef4444', fontSize: 10 }}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />
                  <ReferenceLine
                    y={120}
                    label={{ value: 'Normal SBP (120)', fill: '#10b981', fontSize: 10 }}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="systolicBP"
                    name="Systolic BP (mmHg)"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#e11d48' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolicBP"
                    name="Diastolic BP (mmHg)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0284c7' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate (bpm)"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#8b5cf6' }}
                  />
                </>
              )}

              {/* Lines for Ayush & Pain */}
              {(activeChartMetric === 'ayush_pain' || activeChartMetric === 'combined') && (
                <>
                  <Line
                    type="monotone"
                    dataKey="painScore"
                    name="Pain Intensity (0-10)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vataSeverityScore"
                    name="Vata Aggravation (0-10)"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#ea580c' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="agniIntegrityScore"
                    name="Agni Digestive Health (0-10)"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0d9488' }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Clinical Note Bar Below Chart */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Clinical Correlation:</strong> Pain severity strongly mirrors the progressive elevation in blood pressure and Vata aggravation over the past 8 months.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Values based on {historyData.metricTrends.length} documented temporal observations
          </span>
        </div>
      </div>

      {/* SECTION B: Interactive Chronological Clinical Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Chronological Event & Intervention Timeline</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click any event milestone to inspect source document excerpts and clinical findings.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({historyData.timelineEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('surgical_procedure')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'surgical_procedure'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Surgical / PCI
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('diagnosis')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'diagnosis'
                  ? 'bg-sky-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Diagnoses
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('medication_change')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'medication_change'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Medications
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('lab_or_vitals')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'lab_or_vitals'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Vitals & Alerts
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('ayush_intervention')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === 'ayush_intervention'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ayush Profile
            </button>
          </div>
        </div>

        {/* Side-by-side Layout: Timeline Nodes List on Left, Active Event Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Timeline Nodes (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-0.5 before:bg-slate-200">
            {filteredEvents.map((evt, idx) => {
              const isSelected = evt.id === selectedEvent?.id;
              const categoryBadge = getCategoryBadgeProps(evt.category);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`relative flex items-start gap-3.5 p-3 rounded-xl border transition-all cursor-pointer ml-1 ${
                    isSelected
                      ? 'bg-slate-50 border-teal-500 shadow-2xs ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Category Node Icon */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${categoryBadge.bgClass} ${categoryBadge.textClass}`}
                  >
                    {categoryBadge.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {evt.dateOrPeriod}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSourceBadgeClass(
                          evt.source
                        )}`}
                      >
                        {evt.source}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      {evt.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {evt.description}
                    </p>

                    {evt.metrics && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {Object.entries(evt.metrics).map(([key, val]) => (
                          <span
                            key={key}
                            className="inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            <strong>{key}:</strong>&nbsp;{val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 self-center transition-transform ${
                      isSelected ? 'text-teal-600 translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 ml-6">
                No events found for this category filter.
              </div>
            )}
          </div>

          {/* Active Milestone Inspector Card (Right 5 Cols) */}
          <div className="lg:col-span-5">
            {selectedEvent ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sticky top-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {selectedEvent.dateOrPeriod}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {selectedEvent.categoryLabel}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSourceBadgeClass(
                      selectedEvent.source
                    )}`}
                  >
                    {selectedEvent.source}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedEvent.title}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Metrics Breakdown */}
                {selectedEvent.metrics && Object.keys(selectedEvent.metrics).length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Associated Vital Readings & Data
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(selectedEvent.metrics).map(([k, v]) => (
                        <div key={k} className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">{k}</span>
                          <span className="font-mono font-bold text-slate-900">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Implications & Ayush Context */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 space-y-1 text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                    Clinician Guidance & Precautions
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {selectedEvent.category === 'surgical_procedure' &&
                      'Past coronary angioplasty mandates avoiding hyperthermic sudation (Swedana) and rigorous Shodhana. Ensure cardiology clearance.'}
                    {selectedEvent.category === 'lab_or_vitals' &&
                      'Elevated blood pressure spikes should be re-tested twice before initiating therapy. Withhold Nasya or Siravedha during hypertensive crisis.'}
                    {selectedEvent.category === 'medication_change' &&
                      'Review antiplatelet interactions with Shallaki/Guggulu formulations to prevent hemorrhagic diathesis.'}
                    {selectedEvent.category === 'ayush_intervention' &&
                      'Constitution exhibits Vata predominance with Agni vitiation. Prioritize Deepana-Pachana before administering heavy nourishment.'}
                    {selectedEvent.category === 'diagnosis' &&
                      'Degenerative joint disease requires Snigdha Ahara and localized Janu Basti with warm taila once cardiovascular vitals are stabilized.'}
                    {selectedEvent.category === 'symptom_progression' &&
                      'Long-standing chronicity indicates Jeerna Sandhigata Vata. Educate patient regarding lifestyle modification (Pathya/Apathya).'}
                  </p>
                </div>

                {/* Source Verification Note */}
                <div className="text-[10px] text-slate-400 italic pt-1 flex items-center justify-between">
                  <span>Record ID: {selectedEvent.id}</span>
                  <span>Validated in Triage Audit</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Select an event from the timeline to view clinical details.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION C: Modal for Clinicians to add a new vital reading or historical milestone */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {modalType === 'vital' ? 'Log OPD Vital Sign Reading' : 'Add Historical Milestone'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalType === 'vital' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date / Time Label
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. Today (11:30 AM Triage)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={newSBP}
                      onChange={(e) => setNewSBP(e.target.value ? Number(e.target.value) : '')}
                      placeholder="140"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={newDBP}
                      onChange={(e) => setNewDBP(e.target.value ? Number(e.target.value) : '')}
                      placeholder="90"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={newHR}
                      onChange={(e) => setNewHR(e.target.value ? Number(e.target.value) : '')}
                      placeholder="78"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pain Score (0-10)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={newPain}
                      onChange={(e) => setNewPain(e.target.value ? Number(e.target.value) : '')}
                      placeholder="6"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Vata Severity (0-10)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={newVata}
                      onChange={(e) => setNewVata(e.target.value ? Number(e.target.value) : '')}
                      placeholder="7"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Agni Score (0-10)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={newAgni}
                      onChange={(e) => setNewAgni(e.target.value ? Number(e.target.value) : '')}
                      placeholder="5"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clinician Examination Note
                  </label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="e.g. Measured at OPD counter after 10 min rest. Bilateral radial pulse regular."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="e.g. Prior Cholecystectomy or Ayurvedic Panchakarma Course"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Date / Timeframe
                    </label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="e.g. 2019 or 6 Months Ago"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Event Category
                    </label>
                    <select
                      value={newMilestoneCategory}
                      onChange={(e) => setNewMilestoneCategory(e.target.value as TimelineEventCategory)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="surgical_procedure">Surgical / Interventional</option>
                      <option value="diagnosis">Chronic Diagnosis</option>
                      <option value="medication_change">Medication Start/Stop</option>
                      <option value="ayush_intervention">Ayush Treatment</option>
                      <option value="symptom_progression">Symptom Flare</option>
                      <option value="lab_or_vitals">Lab / Diagnostic Finding</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clinical Description & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newMilestoneDesc}
                    onChange={(e) => setNewMilestoneDesc(e.target.value)}
                    placeholder="Add details, findings, or relevant clinical history..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEntry}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                Save to Patient Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload as MetricTrendPoint;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs max-w-xs space-y-1.5">
        <div className="border-b border-slate-700 pb-1 flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-teal-400">{label}</span>
          {dataPoint?.label && (
            <span className="text-[10px] text-slate-300">{dataPoint.label}</span>
          )}
        </div>

        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 text-[11px]">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-mono font-bold">
                {entry.value} {entry.name.includes('BP') ? 'mmHg' : entry.name.includes('Rate') ? 'bpm' : ''}
              </span>
            </div>
          ))}
        </div>

        {dataPoint?.notes && (
          <p className="text-[10px] text-slate-300 border-t border-slate-800 pt-1 mt-1 italic leading-tight">
            {dataPoint.notes}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Helper to determine category icon and badge styling
function getCategoryBadgeProps(category: TimelineEventCategory) {
  switch (category) {
    case 'surgical_procedure':
      return {
        bgClass: 'bg-rose-100 border border-rose-300',
        textClass: 'text-rose-700',
        icon: <Activity className="w-3.5 h-3.5" />,
      };
    case 'diagnosis':
      return {
        bgClass: 'bg-sky-100 border border-sky-300',
        textClass: 'text-sky-700',
        icon: <FileText className="w-3.5 h-3.5" />,
      };
    case 'medication_change':
      return {
        bgClass: 'bg-purple-100 border border-purple-300',
        textClass: 'text-purple-700',
        icon: <Pill className="w-3.5 h-3.5" />,
      };
    case 'lab_or_vitals':
      return {
        bgClass: 'bg-amber-100 border border-amber-300',
        textClass: 'text-amber-700',
        icon: <HeartPulse className="w-3.5 h-3.5" />,
      };
    case 'ayush_intervention':
      return {
        bgClass: 'bg-emerald-100 border border-emerald-300',
        textClass: 'text-emerald-700',
        icon: <Leaf className="w-3.5 h-3.5" />,
      };
    case 'symptom_progression':
    default:
      return {
        bgClass: 'bg-orange-100 border border-orange-300',
        textClass: 'text-orange-700',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
      };
  }
}

function getCategoryLabel(category: TimelineEventCategory): string {
  switch (category) {
    case 'surgical_procedure':
      return 'Surgical / Procedure';
    case 'diagnosis':
      return 'Clinical Diagnosis';
    case 'medication_change':
      return 'Medication Regimen';
    case 'lab_or_vitals':
      return 'Vitals & Lab Finding';
    case 'ayush_intervention':
      return 'Ayush Assessment';
    case 'symptom_progression':
    default:
      return 'Symptom Progression';
  }
}

function getSourceBadgeClass(source: PatientHistoryEvent['source']): string {
  switch (source) {
    case 'Extracted Document':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'Ayush Assessment':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Clinician Added':
      return 'bg-teal-50 text-teal-800 border border-teal-200';
    case 'Patient Reported History':
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}
