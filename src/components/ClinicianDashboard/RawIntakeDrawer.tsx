import React, { useState } from 'react';
import {
  FileCode,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
} from 'lucide-react';
import { PatientIntakeRecord } from '../../types';

interface RawIntakeDrawerProps {
  intake: PatientIntakeRecord;
}

export const RawIntakeDrawer: React.FC<RawIntakeDrawerProps> = ({ intake }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div id="raw-intake-audit-container" className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-100/80 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-slate-600" />
          <span>Raw Intake & Audit Traceability Section</span>
          <span className="text-[10px] text-slate-500 font-normal">
            ({intake.rawAnswers.length} Questions answered • {intake.extractedDocument ? 'Document attached' : 'No document'})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>{isOpen ? 'Collapse' : 'Expand for Clinical Audit'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5 text-xs text-slate-700 border-t border-slate-200">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Intake Submitted: {new Date(intake.submittedAt).toLocaleString()}</span>
            </div>
            <div>
              <span>Record ID: <code className="font-mono text-slate-700">{intake.id}</code></span>
            </div>
          </div>

          {/* Original Q&A Transcript */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              Original Patient Intake Questions & Answers Transcript
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {intake.rawAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Question #{idx + 1}</span>
                    {item.isAyushAssessment && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Flame className="w-2.5 h-2.5 text-emerald-600" /> Ayush Assessment ({item.ayushDomain || 'Constitutional'})
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-slate-900 text-xs">
                    {item.question}
                  </p>
                  <div className="pt-1 text-slate-700 bg-slate-50/70 p-2 rounded border border-slate-100">
                    <strong className="text-slate-800 text-[11px]">Patient Answer: </strong>
                    <span>
                      {Array.isArray(item.answer)
                        ? item.answer.join(', ')
                        : item.answer || '(No answer provided)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document OCR extract and image */}
          {intake.extractedDocument && (
            <div className="pt-3 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-3.5 h-3.5 text-sky-700" />
                OCR Extracted Prescription & Medical Records
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intake.extractedDocument.imagePreviewUrl && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Uploaded Image Document</span>
                    <img
                      src={intake.extractedDocument.imagePreviewUrl}
                      alt="Prescription Scan"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-52 object-contain rounded border border-slate-100"
                    />
                  </div>
                )}

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block">Structured OCR Fields</span>
                  <div>
                    <strong>Document:</strong> {intake.extractedDocument.documentType} ({intake.extractedDocument.documentDate || 'N/A'})
                  </div>
                  <div>
                    <strong>Facility:</strong> {intake.extractedDocument.prescribingClinicianOrFacility || 'N/A'}
                  </div>
                  <div>
                    <strong>Medications Identified:</strong> {intake.extractedDocument.medications.length} items
                  </div>
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    &quot;{intake.extractedDocument.rawSummary}&quot;
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
