import React from 'react';
import { User, Calendar, Activity, Sparkles, ChevronRight, Stethoscope } from 'lucide-react';
import { AyushDepartment, LanguageCode, PatientBasicDetails } from '../../types';

interface StepBasicDetailsProps {
  details: PatientBasicDetails;
  onChange: (updated: PatientBasicDetails) => void;
  onNext: () => void;
}

export const StepBasicDetails: React.FC<StepBasicDetailsProps> = ({ details, onChange, onNext }) => {
  const departments: { name: AyushDepartment; badge: string; desc: string }[] = [
    { name: 'General Ayurveda', badge: 'Kayachikitsa', desc: 'Holistic internal medicine & chronic health management' },
    { name: 'Panchakarma', badge: 'Shodhana', desc: 'Bio-cleansing, detox therapies & joint/neurological care' },
    { name: 'Yoga & Naturopathy', badge: 'Yoga Chikitsa', desc: 'Lifestyle rehabilitation, pranayama & hydrotherapy' },
    { name: 'Unani Medicine', badge: 'Tibb', desc: 'Humoral balance, Ilaj-bil-Tadbeer & natural remedies' },
    { name: 'Siddha Maruthuvam', badge: 'Muppu', desc: 'Traditional South Indian herbal & mineral therapies' },
    { name: 'Homeopathy OPD', badge: 'Similia', desc: 'Individualized constitutional & acute symptom treatment' },
  ];

  const commonComplaints = [
    'Knee & Joint Pain with morning stiffness',
    'Acid reflux, sour belching & stomach burning',
    'Chronic insomnia, anxiety & stress fatigue',
    'Digestive gas, sluggish appetite & bloating',
    'Cervical neck stiffness and radiating arm pain',
    'Skin itching, dry eczema & allergic dermatitis',
    'Routine constitutional health evaluation',
  ];

  const handleFieldChange = (field: keyof PatientBasicDetails, value: any) => {
    onChange({
      ...details,
      [field]: value,
    });
  };

  const isFormValid =
    details.fullName.trim().length > 1 &&
    details.age !== '' &&
    Number(details.age) > 0 &&
    details.gender !== '' &&
    details.chiefComplaintBrief.trim().length > 3;

  return (
    <div id="step-basic-details-container" className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <User className="w-3.5 h-3.5" />
          <span>Step 1 of 4 • Patient Demographics</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Patient Registration & Chief Complaint
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Please enter your details and the primary health concern for today's Ayush OPD consultation.
        </p>
      </div>

      {/* Row 1: Demographics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="input-patient-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-patient-name"
            type="text"
            required
            placeholder="e.g. Rameshwar Sharma"
            value={details.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="input-patient-age" className="block text-xs font-semibold text-slate-700 mb-1">
            Age (Years) <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-patient-age"
            type="number"
            min="1"
            max="120"
            required
            placeholder="e.g. 58"
            value={details.age}
            onChange={(e) => handleFieldChange('age', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="select-patient-gender" className="block text-xs font-semibold text-slate-700 mb-1">
            Gender <span className="text-rose-500">*</span>
          </label>
          <select
            id="select-patient-gender"
            required
            value={details.gender}
            onChange={(e) => handleFieldChange('gender', e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="input-patient-phone" className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="input-patient-phone"
            type="tel"
            placeholder="e.g. +91 98451 23098"
            value={details.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Row 2: Department Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Select Ayush Specialty Department <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept) => {
            const isSelected = details.department === dept.name;
            return (
              <button
                key={dept.name}
                id={`dept-btn-${dept.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => handleFieldChange('department', dept.name)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                    {dept.name}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {dept.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {dept.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Chief Complaint & Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="input-chief-complaint" className="block text-xs font-semibold text-slate-700">
            Chief Health Complaint / Primary Concern <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Describe in your own words</span>
        </div>

        <textarea
          id="input-chief-complaint"
          rows={3}
          required
          placeholder="e.g. Severe knee joint stiffness every morning, difficulty climbing stairs, and occasional gastric acidity..."
          value={details.chiefComplaintBrief}
          onChange={(e) => handleFieldChange('chiefComplaintBrief', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
        />

        {/* Quick select chips for touch screen kiosks */}
        <div>
          <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
            Quick-select common Ayush consultation concerns:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {commonComplaints.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleFieldChange('chiefComplaintBrief', c)}
                className="text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-800 transition-colors"
              >
                + {c}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-xs">
          <label htmlFor="input-complaint-duration" className="block text-xs font-semibold text-slate-700 mb-1">
            Duration of symptoms
          </label>
          <input
            id="input-complaint-duration"
            type="text"
            placeholder="e.g. 6 months, 2 weeks"
            value={details.durationOfComplaint}
            onChange={(e) => handleFieldChange('durationOfComplaint', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Next Step Action Button */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Next step uses Gemini AI to personalize your follow-up clinical questions</span>
        </div>

        <button
          id="btn-proceed-to-adaptive"
          type="button"
          disabled={!isFormValid}
          onClick={onNext}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            isFormValid
              ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue to Adaptive History</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
