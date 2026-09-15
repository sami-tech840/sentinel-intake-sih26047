export type AyushDepartment =
  | 'General Ayurveda'
  | 'Panchakarma'
  | 'Yoga & Naturopathy'
  | 'Unani Medicine'
  | 'Siddha Maruthuvam'
  | 'Homeopathy OPD';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'mr';

export interface PatientBasicDetails {
  fullName: string;
  age: number | '';
  gender: 'Male' | 'Female' | 'Other' | '';
  phone?: string;
  preferredLanguage: LanguageCode;
  department: AyushDepartment;
  chiefComplaintBrief: string;
  durationOfComplaint: string;
}

export interface AdaptiveQuestion {
  id: string;
  category: 'clinical_history' | 'ayush_assessment' | 'lifestyle_habits' | 'allergies_safety';
  categoryLabel: string;
  isAyushAssessment: boolean;
  question: string;
  guidanceText?: string;
  inputType: 'single_choice' | 'multi_choice' | 'text';
  options?: string[];
  ayushDomain?: 'Prakriti' | 'Agni' | 'Koshtha' | 'Nadi' | 'Satva' | 'Dhatu' | 'General';
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string | string[];
  isAyushAssessment: boolean;
  ayushDomain?: string;
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  type: 'Ayurvedic' | 'Allopathic' | 'Homeopathic' | 'Unani/Siddha' | 'Unknown';
}

export interface ExtractedDocumentData {
  documentType: string;
  documentDate?: string;
  prescribingClinicianOrFacility?: string;
  medications: ExtractedMedication[];
  clinicalFindings: string[];
  allergiesNoted: string[];
  rawSummary: string;
  imagePreviewUrl?: string;
}

export type RedFlagSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface RedFlagAlert {
  id: string;
  severity: RedFlagSeverity;
  category: 'Red-Flag Symptom' | 'Allergy Alert' | 'Inconsistent History' | 'Therapy Contraindication';
  title: string;
  description: string;
  clinicalActionNeeded: string;
  resolved?: boolean;
}

export interface AyushAssessmentData {
  prakritiTendency: string; // e.g. Vata-Pitta, Pitta-Kapha
  agniState: string; // Mandagni, Tikshnagni, Vishamagni, Samagni
  koshthaHabit: string; // Mridu, Krura, Madhyama
  satvaMentalState: string; // Pravara, Madhyama, Avara
  dietaryHabits: string; // Ahara details, timing
  sleepQuality: string; // Nidra pattern
  additionalObservations?: string;
}

export interface ClinicalCaseSummary {
  chiefComplaint: string;
  historyOfPresentingIllness: string;
  pastMedicalHistory: string;
  ayushAssessment: AyushAssessmentData;
  activeMedicationsList: string[];
  knownAllergies: string[];
  provisionalAyushDiagnosis: string;
  recommendedInvestigationOrTherapy: string;
  dietAndLifestyleAdvice: string; // Pathya / Apathya
}

export type IntakeStatus = 'pending_review' | 'under_review' | 'validated';

export interface PatientIntakeRecord {
  id: string;
  tokenNumber: string;
  submittedAt: string;
  status: IntakeStatus;
  patientDetails: PatientBasicDetails;
  rawAnswers: QuestionAnswer[];
  extractedDocument?: ExtractedDocumentData;
  aiCaseSummary: ClinicalCaseSummary;
  redFlags: RedFlagAlert[];
  // Clinician edits and approval
  validatedAt?: string;
  validatedByDoctorName?: string;
  doctorRegistrationNumber?: string;
  clinicianNotes?: string;
  editedCaseSummary?: ClinicalCaseSummary;
  historyVisualizationData?: PatientHistoryVisualizationData;
}

export type TimelineEventCategory =
  | 'surgical_procedure'
  | 'diagnosis'
  | 'medication_change'
  | 'lab_or_vitals'
  | 'symptom_progression'
  | 'ayush_intervention';

export interface PatientHistoryEvent {
  id: string;
  dateOrPeriod: string;
  timestampApprox?: number;
  category: TimelineEventCategory;
  categoryLabel: string;
  title: string;
  description: string;
  source: 'Extracted Document' | 'Patient Reported History' | 'Clinician Added' | 'Ayush Assessment';
  status?: 'resolved' | 'ongoing' | 'critical' | 'managed';
  metrics?: { [key: string]: string | number };
  badgeColor?: string;
}

export interface MetricTrendPoint {
  date: string;
  label: string;
  timestampApprox?: number;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  fastingBloodSugar?: number;
  painScore?: number; // 0 to 10 scale
  vataSeverityScore?: number; // 0 to 10 scale
  agniIntegrityScore?: number; // 0 to 10 scale (10 = Samagni balanced, 3 = Vishama/Manda)
  notes?: string;
}

export interface PatientHistoryVisualizationData {
  timelineEvents: PatientHistoryEvent[];
  metricTrends: MetricTrendPoint[];
  clinicalObservations: string[];
}

