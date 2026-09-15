import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Pill,
} from 'lucide-react';
import { ExtractedDocumentData, ExtractedMedication } from '../../types';
import { PRESET_SAMPLE_PRESCRIPTIONS } from '../../data/sampleCases';

interface StepDocumentUploadProps {
  extractedData?: ExtractedDocumentData;
  onExtractedDataChange: (data?: ExtractedDocumentData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepDocumentUpload: React.FC<StepDocumentUploadProps> = ({
  extractedData,
  onExtractedDataChange,
  onNext,
  onBack,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(extractedData?.imagePreviewUrl || null);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate sample image canvas for preset prescriptions
  const createSamplePrescriptionDataUri = (title: string, clinic: string, meds: string[]) => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 650, 420);

    // Header bar
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(0, 0, 650, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('AYUSH OPD PRESCRIPTION & CLINICAL RECORD', 24, 38);

    ctx.fillStyle = '#334155';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Facility: ${clinic}`, 24, 90);
    ctx.fillText(`Date: ${new Date().toLocaleDateString('en-GB')}`, 450, 90);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 110);
    ctx.lineTo(626, 110);
    ctx.stroke();

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Rx — Prescribed Medicines & Regimen:', 24, 140);

    ctx.fillStyle = '#1e293b';
    ctx.font = '13px sans-serif';
    meds.forEach((m, idx) => {
      ctx.fillText(`• ${m}`, 36, 175 + idx * 30);
    });

    ctx.fillStyle = '#b91c1c';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('Allergies / Special Notes: Documented in Ayush clinical record', 24, 360);

    // Doctor stamp
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('Verified Clinical Copy — Sentinel Ayush Kiosk OCR Test Specimen', 24, 395);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setOcrError('Please select a valid image file (.jpg, .png, .webp).');
      return;
    }

    setOcrError(null);
    setIsProcessingOcr(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Uri = e.target?.result as string;
      setImagePreview(base64Uri);
      await triggerGeminiOcr(base64Uri, file.type);
    };
    reader.onerror = () => {
      setIsProcessingOcr(false);
      setOcrError('Error reading uploaded image.');
    };
    reader.readAsDataURL(file);
  };

  const triggerGeminiOcr = async (base64String: string, mimeType: string) => {
    setIsProcessingOcr(true);
    setOcrError(null);

    try {
      const res = await fetch('/api/ai/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64String,
          mimeType: mimeType || 'image/jpeg',
        }),
      });

      if (!res.ok) {
        throw new Error('OCR parsing failed');
      }

      const data = await res.json();
      const extracted = data.extractedData as ExtractedDocumentData;
      onExtractedDataChange({
        ...extracted,
        imagePreviewUrl: base64String,
      });
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setOcrError('Unable to extract text with Gemini Vision. Please check fields manually.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handlePresetSelect = async (presetIndex: number) => {
    const preset = PRESET_SAMPLE_PRESCRIPTIONS[presetIndex];
    const medStrings = preset.medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`);
    const generatedImageUri = createSamplePrescriptionDataUri(preset.title, preset.clinic, medStrings);
    setImagePreview(generatedImageUri);

    // Call Gemini OCR with the generated image
    await triggerGeminiOcr(generatedImageUri, 'image/jpeg');
  };

  // Editable medication management
  const handleMedicationChange = (index: number, field: keyof ExtractedMedication, value: string) => {
    if (!extractedData) return;
    const updatedMeds = [...extractedData.medications];
    updatedMeds[index] = {
      ...updatedMeds[index],
      [field]: value,
    };
    onExtractedDataChange({
      ...extractedData,
      medications: updatedMeds,
    });
  };

  const handleAddMedication = () => {
    if (!extractedData) return;
    const newMed: ExtractedMedication = {
      name: 'New Medication / Herbal Churna',
      dosage: '1 tablet / 5g',
      frequency: 'Twice daily',
      type: 'Ayurvedic',
    };
    onExtractedDataChange({
      ...extractedData,
      medications: [...extractedData.medications, newMed],
    });
  };

  const handleRemoveMedication = (index: number) => {
    if (!extractedData) return;
    const updatedMeds = extractedData.medications.filter((_, i) => i !== index);
    onExtractedDataChange({
      ...extractedData,
      medications: updatedMeds,
    });
  };

  return (
    <div id="step-document-upload-container" className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Step 3 of 4 • Prior Prescriptions & Reports OCR</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Upload Prior Medical Records or Prescriptions
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Gemini Vision automatically digitizes prior medications, lab values, and doctor notes for Ayush-Allopathic drug safety screening.
        </p>
      </div>

      {/* Upload Box & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload Input Area (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all flex flex-col items-center justify-center min-h-[210px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-teal-700 mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-xs font-semibold text-slate-800 mb-0.5">
              Click to upload or take a photo of prescription
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Supports JPEG, PNG, or mobile camera capture. Auto-analyzed with Gemini Multimodal Vision.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                <Camera className="w-3 h-3" /> Camera Ready
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                <Sparkles className="w-3 h-3 text-amber-500" /> AI OCR
              </span>
            </div>
          </div>

          {/* Quick preset prescriptions for instant testing */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Demo Preset Prescriptions (Click to test OCR):
            </span>
            <div className="space-y-2">
              {PRESET_SAMPLE_PRESCRIPTIONS.map((p, idx) => (
                <button
                  key={p.title}
                  type="button"
                  disabled={isProcessingOcr}
                  onClick={() => handlePresetSelect(idx)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 text-xs transition-all shadow-2xs"
                >
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>{p.title}</span>
                    <span className="text-[10px] text-teal-700 font-medium">Load Specimen →</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Image preview thumbnail if uploaded */}
          {imagePreview && (
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Document Preview
                </span>
                <span className="text-[10px] text-teal-700 font-medium">Image Loaded</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Prescription preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain max-h-48"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Extracted Structured Data (7 cols) */}
        <div className="lg:col-span-7">
          {/* Loading state */}
          {isProcessingOcr && (
            <div className="p-8 border border-teal-200 bg-teal-50/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
              <div className="w-10 h-10 rounded-full border-3 border-teal-600 border-t-transparent animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Gemini Multimodal OCR in progress...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Extracting prescription names, dosages, Ayurvedic vs allopathic compounds, and clinical lab values.
                </p>
              </div>
            </div>
          )}

          {/* Error notice */}
          {!isProcessingOcr && ocrError && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">OCR Notice:</span> {ocrError}
              </div>
            </div>
          )}

          {/* Extracted Structured Data Card */}
          {!isProcessingOcr && extractedData && (
            <div className="border border-slate-200 rounded-2xl bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Extracted Medical Record Data
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                      <Sparkles className="w-3 h-3" /> AI Extracted
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Please verify or edit before submission. You can adjust any dosage or name below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {/* Document metadata chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Document Type</span>
                  <input
                    type="text"
                    value={extractedData.documentType || 'Prescription'}
                    onChange={(e) =>
                      onExtractedDataChange({ ...extractedData, documentType: e.target.value })
                    }
                    className="font-medium text-slate-800 bg-transparent w-full focus:outline-none focus:border-b border-teal-500 mt-0.5"
                  />
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Prescribing Clinic / Doctor</span>
                  <input
                    type="text"
                    value={extractedData.prescribingClinicianOrFacility || 'Not stated'}
                    onChange={(e) =>
                      onExtractedDataChange({
                        ...extractedData,
                        prescribingClinicianOrFacility: e.target.value,
                      })
                    }
                    className="font-medium text-slate-800 bg-transparent w-full focus:outline-none focus:border-b border-teal-500 mt-0.5"
                  />
                </div>
              </div>

              {/* Medications List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    Identified Active Medications ({extractedData.medications.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {extractedData.medications.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      No medications detected. Use &quot;Add Medicine&quot; above if you are taking any.
                    </p>
                  )}

                  {extractedData.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)}
                            placeholder="Medicine name"
                            className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                            placeholder="Dosage (e.g. 40mg)"
                            className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div className="sm:col-span-4 flex items-center gap-1">
                          <select
                            value={med.type}
                            onChange={(e) => handleMedicationChange(idx, 'type', e.target.value as any)}
                            className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                          >
                            <option value="Ayurvedic">Ayurvedic</option>
                            <option value="Allopathic">Allopathic</option>
                            <option value="Homeopathic">Homeopathic</option>
                            <option value="Unani/Siddha">Unani/Siddha</option>
                            <option value="Unknown">Other</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical findings and allergies */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 block">
                  Extracted Clinical Findings & Allergy Warnings:
                </span>
                {extractedData.clinicalFindings.length > 0 && (
                  <ul className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {extractedData.clinicalFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {extractedData.allergiesNoted.length > 0 && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Allergies noted: {extractedData.allergiesNoted.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt when no document uploaded yet */}
          {!isProcessingOcr && !extractedData && (
            <div className="p-6 border border-slate-200 rounded-2xl bg-white text-center space-y-3 flex flex-col items-center justify-center min-h-[260px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  No Document Uploaded Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Upload an image of your previous prescription, choose one of the Demo Presets on the left, or skip this step if this is your very first visit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePresetSelect(0)}
                className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                + Try Demo Prescription (Instant Test)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Adaptive Questions</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!extractedData && (
            <button
              type="button"
              onClick={onNext}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-2"
            >
              Skip (No prior records)
            </button>
          )}

          <button
            id="btn-proceed-to-submit"
            type="button"
            disabled={isProcessingOcr}
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Review & Submit Intake</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
