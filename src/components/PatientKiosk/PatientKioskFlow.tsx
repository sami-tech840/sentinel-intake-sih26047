import React, { useState } from 'react';
import { User, Sparkles, FileText, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import {
  ExtractedDocumentData,
  LanguageCode,
  PatientBasicDetails,
  PatientIntakeRecord,
  QuestionAnswer,
} from '../../types';
import { StepBasicDetails } from './StepBasicDetails';
import { StepAdaptiveQuestions } from './StepAdaptiveQuestions';
import { StepDocumentUpload } from './StepDocumentUpload';
import { StepConfirmation } from './StepConfirmation';

interface PatientKioskFlowProps {
  selectedLanguage: LanguageCode;
  onIntakeSubmitted: (newRecord: PatientIntakeRecord) => void;
  onGoToClinicianDashboard: (patientId: string) => void;
}

export const PatientKioskFlow: React.FC<PatientKioskFlowProps> = ({
  selectedLanguage,
  onIntakeSubmitted,
  onGoToClinicianDashboard,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Patient Intake State
  const [basicDetails, setBasicDetails] = useState<PatientBasicDetails>({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    preferredLanguage: selectedLanguage,
    department: 'General Ayurveda',
    chiefComplaintBrief: '',
    durationOfComplaint: '',
  });

  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | undefined>(undefined);
  const [createdRecord, setCreatedRecord] = useState<PatientIntakeRecord | null>(null);

  // When step 3 finishes, trigger AI summary synthesis and persist to backend
  const handleFinalSubmit = async () => {
    setIsSubmittingFinal(true);
    setSubmissionError(null);

    try {
      // 1. Call Gemini to synthesize full clinical summary + red flag detection
      const summaryRes = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientDetails: basicDetails,
          rawAnswers: answers,
          extractedDocument: extractedData,
        }),
      });

      if (!summaryRes.ok) {
        throw new Error('Failed to generate clinical summary');
      }

      const { aiCaseSummary, redFlags } = await summaryRes.json();

      // 2. Submit new intake record to in-memory store
      const newIntakePayload = {
        patientDetails: basicDetails,
        rawAnswers: answers,
        extractedDocument: extractedData,
        aiCaseSummary,
        redFlags: redFlags || [],
        status: 'pending_review',
      };

      const postRes = await fetch('/api/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntakePayload),
      });

      if (!postRes.ok) {
        throw new Error('Failed to save patient intake record');
      }

      const savedRecord: PatientIntakeRecord = await postRes.json();
      setCreatedRecord(savedRecord);
      onIntakeSubmitted(savedRecord);
      setCurrentStep(4);
    } catch (err: any) {
      console.error('Final submission error:', err);
      setSubmissionError('Error finalizing intake. Please retry.');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleStartNewIntake = () => {
    setBasicDetails({
      fullName: '',
      age: '',
      gender: '',
      phone: '',
      preferredLanguage: selectedLanguage,
      department: 'General Ayurveda',
      chiefComplaintBrief: '',
      durationOfComplaint: '',
    });
    setAnswers([]);
    setExtractedData(undefined);
    setCreatedRecord(null);
    setCurrentStep(1);
  };

  const stepsMeta = [
    { num: 1, title: 'Basic Details', icon: User },
    { num: 2, title: 'Adaptive History', icon: Sparkles },
    { num: 3, title: 'Document OCR', icon: FileText },
    { num: 4, title: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div id="patient-kiosk-wrapper" className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Kiosk Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {stepsMeta.map((s, idx) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-teal-700 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-teal-900' : isDone ? 'text-teal-700' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>

                {idx < stepsMeta.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > idx + 1 ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Step Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Step 1 */}
        {currentStep === 1 && (
          <StepBasicDetails
            details={basicDetails}
            onChange={setBasicDetails}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <StepAdaptiveQuestions
            patientDetails={basicDetails}
            answers={answers}
            onAnswersChange={setAnswers}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div>
            <StepDocumentUpload
              extractedData={extractedData}
              onExtractedDataChange={setExtractedData}
              onNext={handleFinalSubmit}
              onBack={() => setCurrentStep(2)}
            />

            {isSubmittingFinal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mx-auto flex items-center justify-center animate-spin">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Generating Clinical Case Sheet & Screening Red Flags...
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gemini AI is synthesizing clinical complaint, Ayurvedic parameters (Agni, Prakriti, Koshtha), and medication history into the OPD queue.
                  </p>
                </div>
              </div>
            )}

            {submissionError && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && createdRecord && (
          <StepConfirmation
            intakeRecord={createdRecord}
            onGoToClinicianDashboard={onGoToClinicianDashboard}
            onStartNewIntake={handleStartNewIntake}
          />
        )}
      </div>
    </div>
  );
};
