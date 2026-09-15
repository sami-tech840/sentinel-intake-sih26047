import React from 'react';
import {
  Sparkles,
  Flame,
  Pill,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Apple,
  FileCheck2,
} from 'lucide-react';
import { ClinicalCaseSummary } from '../../types';

interface AyushCaseSheetEditorProps {
  summary: ClinicalCaseSummary;
  isValidated: boolean;
  onChange: (updated: ClinicalCaseSummary) => void;
}

export const AyushCaseSheetEditor: React.FC<AyushCaseSheetEditorProps> = ({
  summary,
  isValidated,
  onChange,
}) => {
  const handleFieldChange = (field: keyof ClinicalCaseSummary, value: any) => {
    onChange({
      ...summary,
      [field]: value,
    });
  };

  const handleAyushAssessmentChange = (subfield: string, value: string) => {
    onChange({
      ...summary,
      ayushAssessment: {
        ...summary.ayushAssessment,
        [subfield]: value,
      },
    });
  };

  const badgeComponent = isValidated ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
      <FileCheck2 className="w-3 h-3" /> Clinician Confirmed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
      <Sparkles className="w-3 h-3 text-sky-600" /> AI Suggested
    </span>
  );

  return (
    <div id="ayush-case-sheet-editor" className="space-y-6">
      {/* Disclaimer / AI Guidance Header */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-sky-950">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-700 shrink-0" />
          <span>
            <strong>Clinical Responsibility Notice:</strong> All fields are auto-synthesized from patient responses & prior records. You may edit or override any field prior to validation.
          </span>
        </div>
        <div>{badgeComponent}</div>
      </div>

      {/* Section 1: Clinical Presentation */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Chief Complaint & History of Presenting Illness (HPI)
            </h3>
          </div>
          {badgeComponent}
        </div>

        <div>
          <label htmlFor="case-chief-complaint" className="block text-xs font-semibold text-slate-700 mb-1">
            Chief Complaint
          </label>
          <input
            id="case-chief-complaint"
            type="text"
            value={summary.chiefComplaint}
            onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="case-hpi" className="block text-xs font-semibold text-slate-700 mb-1">
            History of Presenting Illness (Chronology, Aggravating & Relieving Factors)
          </label>
          <textarea
            id="case-hpi"
            rows={3}
            value={summary.historyOfPresentingIllness}
            onChange={(e) => handleFieldChange('historyOfPresentingIllness', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white leading-relaxed"
          />
        </div>

        <div>
          <label htmlFor="case-pmh" className="block text-xs font-semibold text-slate-700 mb-1">
            Past Medical & Surgical History / Comorbidities
          </label>
          <input
            id="case-pmh"
            type="text"
            value={summary.pastMedicalHistory}
            onChange={(e) => handleFieldChange('pastMedicalHistory', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Section 2: Ayurvedic Assessment Parameters (Dashavidha / Ashtavidha Style) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Ayurvedic Assessment (Dashavidha Pariksha Parameters)
            </h3>
          </div>
          {badgeComponent}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="case-prakriti" className="block text-xs font-semibold text-slate-700 mb-1">
              Prakriti Assessment (Body Constitution Tendency)
            </label>
            <input
              id="case-prakriti"
              type="text"
              value={summary.ayushAssessment?.prakritiTendency || ''}
              onChange={(e) => handleAyushAssessmentChange('prakritiTendency', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="case-agni" className="block text-xs font-semibold text-slate-700 mb-1">
              Agni Pariksha (Digestive Fire: Vishama / Tikshna / Manda / Sama)
            </label>
            <input
              id="case-agni"
              type="text"
              value={summary.ayushAssessment?.agniState || ''}
              onChange={(e) => handleAyushAssessmentChange('agniState', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="case-koshtha" className="block text-xs font-semibold text-slate-700 mb-1">
              Koshtha Pariksha (Bowel Pattern: Mridu / Krura / Madhyama)
            </label>
            <input
              id="case-koshtha"
              type="text"
              value={summary.ayushAssessment?.koshthaHabit || ''}
              onChange={(e) => handleAyushAssessmentChange('koshthaHabit', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="case-satva" className="block text-xs font-semibold text-slate-700 mb-1">
              Satva & Nidra (Mental Stamina & Sleep Quality)
            </label>
            <input
              id="case-satva"
              type="text"
              value={summary.ayushAssessment?.satvaMentalState || ''}
              onChange={(e) => handleAyushAssessmentChange('satvaMentalState', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="case-diet" className="block text-xs font-semibold text-slate-700 mb-1">
            Ahara (Dietary Habits & Fluid Intake Observations)
          </label>
          <input
            id="case-diet"
            type="text"
            value={summary.ayushAssessment?.dietaryHabits || ''}
            onChange={(e) => handleAyushAssessmentChange('dietaryHabits', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Section 3: Medication Reconciliation & Allergies */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Dual Medication Reconciliation (Ayush & Allopathic) & Allergies
            </h3>
          </div>
          {badgeComponent}
        </div>

        <div>
          <label htmlFor="case-medications" className="block text-xs font-semibold text-slate-700 mb-1">
            Active Current Medications (Comma-separated)
          </label>
          <textarea
            id="case-medications"
            rows={2}
            value={summary.activeMedicationsList?.join(', ') || ''}
            onChange={(e) =>
              handleFieldChange(
                'activeMedicationsList',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white font-mono"
          />
        </div>

        <div>
          <label htmlFor="case-allergies" className="block text-xs font-semibold text-slate-700 mb-1">
            Known Drug / Food Allergies
          </label>
          <input
            id="case-allergies"
            type="text"
            value={summary.knownAllergies?.join(', ') || ''}
            onChange={(e) =>
              handleFieldChange(
                'knownAllergies',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Section 4: Clinical Impression, Recommended Therapy & Lifestyle */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Provisional Ayush Diagnosis & Plan of Care
            </h3>
          </div>
          {badgeComponent}
        </div>

        <div>
          <label htmlFor="case-diagnosis" className="block text-xs font-semibold text-slate-700 mb-1">
            Provisional Ayush Diagnosis (e.g. Sandhigata Vata, Urdhwaga Amlapitta, Gridhrasi)
          </label>
          <input
            id="case-diagnosis"
            type="text"
            value={summary.provisionalAyushDiagnosis}
            onChange={(e) => handleFieldChange('provisionalAyushDiagnosis', e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold text-teal-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="case-therapy" className="block text-xs font-semibold text-slate-700 mb-1">
            Recommended Investigation or Therapy (Shodhana / Shamana / Panchakarma / Yoga)
          </label>
          <textarea
            id="case-therapy"
            rows={2}
            value={summary.recommendedInvestigationOrTherapy}
            onChange={(e) => handleFieldChange('recommendedInvestigationOrTherapy', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="case-pathya" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Apple className="w-3.5 h-3.5 text-emerald-600" />
            Diet & Lifestyle Advice (Pathya & Apathya)
          </label>
          <textarea
            id="case-pathya"
            rows={2}
            value={summary.dietAndLifestyleAdvice}
            onChange={(e) => handleFieldChange('dietAndLifestyleAdvice', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
