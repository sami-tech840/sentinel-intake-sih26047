import { PatientIntakeRecord } from '../types';

export const INITIAL_SAMPLE_INTAKES: PatientIntakeRecord[] = [
  {
    id: 'intake-sih-001',
    tokenNumber: 'AYUSH-OPD-101',
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'pending_review',
    patientDetails: {
      fullName: 'Rameshwar Sharma',
      age: 58,
      gender: 'Male',
      phone: '+91 98451 23098',
      preferredLanguage: 'hi',
      department: 'Panchakarma',
      chiefComplaintBrief: 'Bilateral knee pain with morning stiffness and swelling for 8 months; worsens in cold weather.',
      durationOfComplaint: '8 months'
    },
    rawAnswers: [
      {
        questionId: 'q-1',
        question: 'How severe is the joint pain and does it restrict daily morning walking or climbing stairs?',
        answer: 'Severe pain, unable to climb stairs without support. Morning stiffness lasts about 45 minutes.',
        isAyushAssessment: false
      },
      {
        questionId: 'q-2',
        question: 'Ayurvedic Assessment (Agni): How is your digestion and appetite after regular meals?',
        answer: 'Irregular appetite (Vishamagni). Heavy feeling and bloating after dinner.',
        isAyushAssessment: true,
        ayushDomain: 'Agni'
      },
      {
        questionId: 'q-3',
        question: 'Ayurvedic Assessment (Koshtha): Describe your bowel movements and evacuation pattern.',
        answer: 'Hard, dry stools passing once every 2 days; feels incomplete (Krura Koshtha).',
        isAyushAssessment: true,
        ayushDomain: 'Koshtha'
      },
      {
        questionId: 'q-4',
        question: 'Ayurvedic Assessment (Prakriti): Do you feel excessive sensitivity to cold weather or dry skin?',
        answer: 'Very sensitive to dry and cold weather; dry skin and cracking sound (crepitus) in joints.',
        isAyushAssessment: true,
        ayushDomain: 'Prakriti'
      },
      {
        questionId: 'q-5',
        question: 'Do you have any diagnosed medical conditions like hypertension, diabetes or cardiac disorders?',
        answer: 'High blood pressure for 5 years, on Telmisartan 40mg. Blood pressure was 168/98 mmHg at home yesterday.',
        isAyushAssessment: false
      },
      {
        questionId: 'q-6',
        question: 'Do you take any blood thinners or allopathic pain relief tablets?',
        answer: 'Taking Aspirin 75mg daily post-angioplasty 4 years ago and Aceclofenac when knee pain is bad.',
        isAyushAssessment: false
      }
    ],
    extractedDocument: {
      documentType: 'Prior Prescription & Blood Pressure Log',
      documentDate: '12-Aug-2025',
      prescribingClinicianOrFacility: 'City Heart & Ortho Clinic',
      medications: [
        { name: 'Tab Telmisartan', dosage: '40 mg', frequency: 'Once daily (morning)', type: 'Allopathic' },
        { name: 'Tab Ecosprin (Aspirin)', dosage: '75 mg', frequency: 'Once daily after lunch', type: 'Allopathic' },
        { name: 'Tab Aceclofenac + Paracetamol', dosage: '100/325 mg', frequency: 'SOS (as needed)', type: 'Allopathic' }
      ],
      clinicalFindings: [
        'BP recorded at 168/98 mmHg (Stage 2 Hypertension)',
        'Bilateral knee osteoarthritis Grade 3 (Kellgren-Lawrence)',
        'History of coronary angioplasty in 2021'
      ],
      allergiesNoted: ['Penicillin - skin rashes'],
      rawSummary: 'Known CAD post-PCI on DAPT/aspirin and ARB. Presenting with knee osteoarthritic exacerbation and uncontrolled systolic BP.'
    },
    aiCaseSummary: {
      chiefComplaint: 'Bilateral knee pain (Sandhigata Vata) with joint crepitus, morning stiffness (45 mins), and impaired stair climbing for 8 months.',
      historyOfPresentingIllness: '58-year-old male with chronic degenerative knee pain aggravated in cold climate. Reports Vishamagni (irregular appetite) and Krura Koshtha (constipation). Associated with home BP readings of 168/98 mmHg.',
      pastMedicalHistory: 'Known hypertensive (5 yrs) on Telmisartan 40mg. History of CAD status post-coronary angioplasty (2021) on daily Aspirin 75mg.',
      ayushAssessment: {
        prakritiTendency: 'Vata-Pitta Pradhana (Vata predominant with degenerative bone tissue affliction)',
        agniState: 'Vishamagni (Irregular digestion with post-prandial abdominal fullness)',
        koshthaHabit: 'Krura Koshtha (tendency to dry, hard, delayed bowel movements)',
        satvaMentalState: 'Madhyama Satva (moderate tolerance, anxious about mobility)',
        dietaryHabits: 'Irregular lunch timings, consumes dry spicy snacks, low water intake',
        sleepQuality: 'Disturbed sleep due to joint ache when turning in bed',
        additionalObservations: 'Sandhi-sphutana (joint crepitus) present in both patellofemoral joints.'
      },
      activeMedicationsList: ['Telmisartan 40mg OD', 'Aspirin (Ecosprin) 75mg OD', 'Aceclofenac SOS'],
      knownAllergies: ['Penicillin (skin rash)'],
      provisionalAyushDiagnosis: 'Sandhigata Vata (Osteoarthritis) with Rakta Gata Vata / Vata-Pitta Dushti',
      recommendedInvestigationOrTherapy: 'Plan Janu Basti and Patra Pinda Sweda after BP stabilization. Deepana-Pachana with Panchakola Churna. Caution: Withhold vigorous Shodhana until systolic BP < 140 mmHg.',
      dietAndLifestyleAdvice: 'Pathya: Warm, unctuous diet (Snigdha Ahara), cow ghee, warm sesame oil massage. Apathya: Cold food, dry gram/chana, high-salt intake, prolonged standing.'
    },
    redFlags: [
      {
        id: 'rf-1',
        severity: 'CRITICAL',
        category: 'Red-Flag Symptom',
        title: 'Uncontrolled Hypertension (168/98 mmHg) with Coronary History',
        description: 'Patient reports recent home BP of 168/98 mmHg with past history of coronary angioplasty. Vigorous Panchakarma Swedana (sudation) or heavy oil therapies can trigger acute cardiovascular strain.',
        clinicalActionNeeded: 'Measure clinical BP immediately at triage. Refer for antihypertensive dose titration before scheduling hyperthermic Panchakarma therapies.'
      },
      {
        id: 'rf-2',
        severity: 'HIGH',
        category: 'Therapy Contraindication',
        title: 'Concurrent Aspirin Antiplatelet Therapy & Ayurvedic Blood Purifiers',
        description: 'Patient is on daily Aspirin 75mg. Concomitant administration of high-dose Guggulu, Shallaki or Raktamokshana may increase bleeding diathesis.',
        clinicalActionNeeded: 'Clinician must review potential herbal-drug interaction before prescribing anticoagulant herbs.'
      }
    ]
  },
  {
    id: 'intake-sih-002',
    tokenNumber: 'AYUSH-OPD-102',
    submittedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    status: 'validated',
    validatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    validatedByDoctorName: 'Dr. Ananya Iyer, BAMS, MD (Ayu)',
    doctorRegistrationNumber: 'AYUSH-KA-2016-08492',
    clinicianNotes: 'Clinician verified. Patient counselled on dietary restrictions (Pathya) for Amlapitta. Prescribed Kamadudha Rasa & Sutshekhar Rasa for 2 weeks. Advised endoscopy if night pain persists.',
    patientDetails: {
      fullName: 'Priya Sundaram',
      age: 34,
      gender: 'Female',
      phone: '+91 94441 87612',
      preferredLanguage: 'ta',
      department: 'General Ayurveda',
      chiefComplaintBrief: 'Severe retrosternal burning, sour eructations, and nausea every evening for 3 months.',
      durationOfComplaint: '3 months'
    },
    rawAnswers: [
      {
        questionId: 'q-10',
        question: 'When does the burning sensation peak, and does it keep you awake at night?',
        answer: 'Peaks around 11 PM and 2 hours after lunch. Sometimes wake up with sour water in throat.',
        isAyushAssessment: false
      },
      {
        questionId: 'q-11',
        question: 'Ayurvedic Assessment (Agni): Describe your hunger intensity and digestion rate.',
        answer: 'Tikshnagni (sharp, excessive hunger but burning immediately upon eating spicy or sour food).',
        isAyushAssessment: true,
        ayushDomain: 'Agni'
      },
      {
        questionId: 'q-12',
        question: 'Ayurvedic Assessment (Prakriti): Do you experience excessive heat sensations, sweating, or irritability?',
        answer: 'Pitta dominant: highly intolerant to heat, frequent mouth ulcers, irritable when hungry.',
        isAyushAssessment: true,
        ayushDomain: 'Prakriti'
      },
      {
        questionId: 'q-13',
        question: 'Any unexplained weight loss, difficulty swallowing (dysphagia), or black tarry stools?',
        answer: 'No difficulty swallowing, no black stools. Weight stable.',
        isAyushAssessment: false
      }
    ],
    aiCaseSummary: {
      chiefComplaint: 'Urdhwaga Amlapitta (Gastroesophageal acid reflux) with sour belching, epigastric burning, and evening regurgitation for 3 months.',
      historyOfPresentingIllness: '34-year-old software architect with irregular meal timings and high tea/coffee consumption presenting with symptomatic hyperacidity.',
      pastMedicalHistory: 'No chronic comorbidities. Occasional tension-type headaches.',
      ayushAssessment: {
        prakritiTendency: 'Pitta-Vata Prakriti with acute Pitta Prakopa in Amashaya (stomach)',
        agniState: 'Tikshnagni with Vidagdha Jeerna (sharp fire turning sour/acidic during digestion)',
        koshthaHabit: 'Madhyama Koshtha with soft acidic stools twice daily',
        satvaMentalState: 'Pravara-Madhyama (high occupational stress, work screen time 10+ hrs)',
        dietaryHabits: 'Frequent sour pickles, tomato gravies, late-night dinners (10:30 PM)',
        sleepQuality: 'Interrupted by reflux regurgitation when lying flat',
        additionalObservations: 'Jihwa (tongue) has reddish edges with central yellowish coating.'
      },
      activeMedicationsList: ['Over-the-counter Antacid gel (Gelusil) SOS'],
      knownAllergies: ['No known food or drug allergies'],
      provisionalAyushDiagnosis: 'Urdhwaga Amlapitta (Pitta Dushti with Amashayottha vyadhi)',
      recommendedInvestigationOrTherapy: 'Vamana or mild Virechana with Avipattikar Churna once acute burning settles. Kamadudha Rasa (Mukta yukta) 250mg BD with cold milk.',
      dietAndLifestyleAdvice: 'Pathya: Poha, old rice, barley, pomegranate, coriander water, early dinner before 8 PM. Apathya: Fermented batter, spicy curry, midnight eating, coffee.'
    },
    redFlags: [
      {
        id: 'rf-3',
        severity: 'MEDIUM',
        category: 'Red-Flag Symptom',
        title: 'Nocturnal Aspiration / Acid Regurgitation Risk',
        description: 'Patient reports waking up with sour fluid in throat. Poses risk for nocturnal bronchospasm or erosive esophagitis.',
        clinicalActionNeeded: 'Advise head-of-bed elevation (6 inches), finish meals 3 hours before bed; review with upper GI endoscopy if red-flag symptoms develop.',
        resolved: true
      }
    ]
  }
];

export const PRESET_SAMPLE_PRESCRIPTIONS = [
  {
    title: 'Ayush & Allopathic Integrative Prescription (Sample)',
    description: 'Sample OPD slip with Ayurvedic formulations, Metformin, and BP readings',
    doctor: 'Dr. S. K. Namboodiri, BAMS, MD (Ayu)',
    clinic: 'Sentinel Integrated Ayush Research OPD',
    date: '2025-11-04',
    medications: [
      { name: 'Kashaya Yogaraja Guggulu', dosage: '2 tablets', frequency: 'Twice daily with warm water', type: 'Ayurvedic' as const },
      { name: 'Dasamoola Haritaki Lehyam', dosage: '1 teaspoon (10g)', frequency: 'Bedtime', type: 'Ayurvedic' as const },
      { name: 'Tab Metformin HCl', dosage: '500 mg', frequency: 'Once daily after breakfast', type: 'Allopathic' as const },
      { name: 'Chandraprabha Vati', dosage: '1 tablet', frequency: 'Morning and evening', type: 'Ayurvedic' as const }
    ],
    findings: [
      'Fasting Blood Glucose: 142 mg/dL',
      'HbA1c: 7.2%',
      'BP: 138/86 mmHg',
      'Mild pedal edema noted in bilateral ankles'
    ],
    allergies: ['Known allergy to Shellfish and Sulfa drugs']
  },
  {
    title: 'Panchakarma Consultation Record (Sample)',
    description: 'Initial assessment slip with Shirodhara advice and cervical spine notes',
    doctor: 'Dr. Meenakshi Sundaram, MD (Ayur)',
    clinic: 'AyurSutra Panchakarma Specialty Center',
    date: '2025-12-18',
    medications: [
      { name: 'Ksheerabala 101 Taila (Nasya)', dosage: '4 drops each nostril', frequency: 'Early morning empty stomach', type: 'Ayurvedic' as const },
      { name: 'Ashwagandharishta', dosage: '20 ml with equal water', frequency: 'Twice daily after food', type: 'Ayurvedic' as const },
      { name: 'Brahmi Vati (Gold coated)', dosage: '1 tablet', frequency: 'Bedtime with warm milk', type: 'Ayurvedic' as const }
    ],
    findings: [
      'Cervical spondylosis with C5-C6 disc osteophyte complex on MRI',
      'Chronic tension headaches and anxiety-induced insomnia',
      'Nadi: Vata-Kapha gati, slow irregular amplitude'
    ],
    allergies: ['No known drug allergies reported']
  }
];
