import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Flame,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { AdaptiveQuestion, PatientBasicDetails, QuestionAnswer } from '../../types';

interface StepAdaptiveQuestionsProps {
  patientDetails: PatientBasicDetails;
  answers: QuestionAnswer[];
  onAnswersChange: (answers: QuestionAnswer[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepAdaptiveQuestions: React.FC<StepAdaptiveQuestionsProps> = ({
  patientDetails,
  answers,
  onAnswersChange,
  onNext,
  onBack,
}) => {
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch adaptive questions from backend Gemini endpoint
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/adaptive-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientDetails,
          previousAnswers: answers,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate adaptive questions');
      }

      const data = await res.json();
      const fetched: AdaptiveQuestion[] = data.questions || [];
      setQuestions(fetched);

      // Pre-populate answers array if not already present
      if (answers.length === 0 && fetched.length > 0) {
        const initialAnswers: QuestionAnswer[] = fetched.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: '',
          isAyushAssessment: q.isAyushAssessment,
          ayushDomain: q.ayushDomain,
        }));
        onAnswersChange(initialAnswers);
      }
    } catch (err: any) {
      console.error('Adaptive questions fetch error:', err);
      setError('Unable to reach AI triage service. Using standard Ayush clinical questionnaire.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [patientDetails.department]);

  const handleSelectOption = (qId: string, qText: string, optionValue: string, isAyush: boolean, domain?: string) => {
    const existingIndex = answers.findIndex((a) => a.questionId === qId);
    if (existingIndex >= 0) {
      const updated = [...answers];
      updated[existingIndex] = {
        ...updated[existingIndex],
        answer: optionValue,
      };
      onAnswersChange(updated);
    } else {
      onAnswersChange([
        ...answers,
        {
          questionId: qId,
          question: qText,
          answer: optionValue,
          isAyushAssessment: isAyush,
          ayushDomain: domain,
        },
      ]);
    }
  };

  const handleCustomTextChange = (qId: string, qText: string, text: string, isAyush: boolean, domain?: string) => {
    const existingIndex = answers.findIndex((a) => a.questionId === qId);
    if (existingIndex >= 0) {
      const updated = [...answers];
      updated[existingIndex] = {
        ...updated[existingIndex],
        answer: text,
      };
      onAnswersChange(updated);
    } else {
      onAnswersChange([
        ...answers,
        {
          questionId: qId,
          question: qText,
          answer: text,
          isAyushAssessment: isAyush,
          ayushDomain: domain,
        },
      ]);
    }
  };

  const answeredCount = answers.filter((a) => {
    if (Array.isArray(a.answer)) return a.answer.length > 0;
    return typeof a.answer === 'string' && a.answer.trim().length > 0;
  }).length;

  const totalQuestions = questions.length;
  const isReadyToProceed = answeredCount >= Math.min(3, totalQuestions);

  return (
    <div id="step-adaptive-questions-container" className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Step 2 of 4 • AI-Generated Adaptive Clinical History</span>
          </div>

          <button
            type="button"
            onClick={fetchQuestions}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate with Gemini</span>
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Personalized Clinical & Ayurvedic Assessment
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          These dynamic questions adapt to your selected specialty (
          <span className="font-semibold text-slate-700">{patientDetails.department}</span>) and primary complaint.
        </p>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Completed: {answeredCount} of {totalQuestions} questions answered</span>
          <span className="font-medium text-teal-700">
            {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Generating Adaptive Questions via Gemini AI...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Analyzing chief complaint &quot;{patientDetails.chiefComplaintBrief}&quot; for {patientDetails.department} OPD parameters...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Questions list */}
      {!isLoading && questions.length > 0 && (
        <div className="space-y-5">
          {questions.map((q, idx) => {
            const currentAnswerObj = answers.find((a) => a.questionId === q.id);
            const currentAnswer = currentAnswerObj?.answer || '';
            const isAnswered =
              typeof currentAnswer === 'string'
                ? currentAnswer.trim().length > 0
                : Array.isArray(currentAnswer) && currentAnswer.length > 0;

            return (
              <div
                key={q.id || idx}
                id={`question-card-${q.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isAnswered
                    ? 'border-teal-200 bg-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    {q.isAyushAssessment ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Flame className="w-3 h-3 text-emerald-600" />
                        <span>Ayurvedic Assessment ({q.ayushDomain || 'Constitutional'})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                        <span>{q.categoryLabel || 'Clinical History'}</span>
                      </span>
                    )}
                  </div>

                  {isAnswered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Answered</span>
                    </span>
                  )}
                </div>

                {/* Question text */}
                <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                  {q.question}
                </h3>

                {/* Guidance / Ayurvedic disclaimer if applicable */}
                {q.guidanceText && (
                  <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{q.guidanceText}</span>
                  </p>
                )}
                {q.isAyushAssessment && (
                  <p className="text-[10px] text-emerald-700/80 italic mt-0.5">
                    * Ayurvedic assessment parameter for constitutional balance — not a modern diagnostic claim.
                  </p>
                )}

                {/* Options Chips */}
                {q.options && q.options.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isSelected = currentAnswer === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, q.question, opt, q.isAyushAssessment, q.ayushDomain)}
                          className={`p-2.5 rounded-lg text-xs text-left border transition-all ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-medium ring-1 ring-teal-600'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Custom / additional text field */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Or type specific notes / additional details here..."
                    value={typeof currentAnswer === 'string' && !q.options?.includes(currentAnswer) ? currentAnswer : ''}
                    onChange={(e) =>
                      handleCustomTextChange(q.id, q.question, e.target.value, q.isAyushAssessment, q.ayushDomain)
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-proceed-to-documents"
            type="button"
            disabled={!isReadyToProceed}
            onClick={onNext}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isReadyToProceed
                ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Continue to Document OCR</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
