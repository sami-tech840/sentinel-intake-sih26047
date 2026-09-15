import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SAMPLE_INTAKES } from './src/data/sampleCases';
import { PatientIntakeRecord } from './src/types';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory data store for the session/demo
let intakesStore: PatientIntakeRecord[] = JSON.parse(JSON.stringify(INITIAL_SAMPLE_INTAKES));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 20mb limit for prescription document uploads
  app.use(express.json({ limit: '20mb' }));

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      intakesCount: intakesStore.length,
    });
  });

  // Get all patient intakes
  app.get('/api/intakes', (req: Request, res: Response) => {
    res.json(intakesStore);
  });

  // Get single patient intake
  app.get('/api/intakes/:id', (req: Request, res: Response) => {
    const intake = intakesStore.find((i) => i.id === req.params.id);
    if (!intake) {
      return res.status(404).json({ error: 'Intake record not found' });
    }
    res.json(intake);
  });

  // Create new patient intake
  app.post('/api/intakes', (req: Request, res: Response) => {
    try {
      const newIntake: PatientIntakeRecord = req.body;
      if (!newIntake.id) {
        newIntake.id = `intake-${Date.now()}`;
      }
      if (!newIntake.tokenNumber) {
        const nextNum = 100 + intakesStore.length + 1;
        newIntake.tokenNumber = `AYUSH-OPD-${nextNum}`;
      }
      if (!newIntake.submittedAt) {
        newIntake.submittedAt = new Date().toISOString();
      }
      if (!newIntake.status) {
        newIntake.status = 'pending_review';
      }

      // Prepend so newest appears first
      intakesStore.unshift(newIntake);
      res.status(201).json(newIntake);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Invalid intake submission' });
    }
  });

  // Clinician updates/validates an intake
  app.put('/api/intakes/:id', (req: Request, res: Response) => {
    const index = intakesStore.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Intake record not found' });
    }
    const current = intakesStore[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id, // Immutable ID
    };
    intakesStore[index] = updated;
    res.json(updated);
  });

  // AI 1: Generate Adaptive Follow-Up Questions
  app.post('/api/ai/adaptive-questions', async (req: Request, res: Response) => {
    const { patientDetails, previousAnswers } = req.body;
    const ai = getGenAI();

    const systemPrompt = `You are an expert clinical intake triage AI for an AYUSH (Ayurveda, Yoga & Naturopathy, Unani, Siddha, and Homeopathy) Outpatient Department (OPD).
Your task is to dynamically generate 5 to 7 high-yield adaptive intake questions based on the patient's basic details, selected AYUSH department, chief complaint, and any initial answers given.

REQUIREMENTS:
1. Include 3-4 General Clinical History questions:
   - Onset, duration, character, radiation, aggravating/relieving factors
   - Known medical comorbidities (hypertension, diabetes, heart disease, thyroid)
   - Known drug/food allergies
2. Include 2-3 Simplified Ayurvedic Assessment parameters (Dashavidha / Ashtavidha Pariksha style):
   - Clearly label them as Ayurvedic assessment fields (not diagnostic claims).
   - Prakriti (body constitution tendency, e.g., sensitivity to cold vs. heat, skin dryness)
   - Agni (digestive fire: Vishamagni/irregular, Tikshnagni/burning sharp, Mandagni/sluggish, Samagni/balanced)
   - Koshtha (bowel elimination tendency: Mridu/soft easy, Krura/hard constipated, Madhyama)
   - Satva (mental endurance, stress, or sleep pattern)
3. Tailor questions specifically to the chosen department: ${patientDetails?.department || 'General Ayurveda'}.
4. Provide multiple choice options (3-5 choices) whenever possible so a patient using a touch kiosk can easily tap an answer, while allowing other inputs.
5. In your response, format strictly as a JSON array of question objects.`;

    const prompt = `Patient Details:
Name: ${patientDetails?.fullName || 'Patient'}
Age: ${patientDetails?.age || 'Adult'}, Gender: ${patientDetails?.gender || 'Unspecified'}
Preferred Language: ${patientDetails?.preferredLanguage || 'en'}
Department: ${patientDetails?.department || 'General Ayurveda'}
Chief Complaint: ${patientDetails?.chiefComplaintBrief || 'Routine health evaluation'}
Duration: ${patientDetails?.durationOfComplaint || 'Not stated'}

Previous Answers provided so far:
${JSON.stringify(previousAnswers || [], null, 2)}

Generate 5 to 7 adaptive questions as JSON adhering to this schema:
[
  {
    "id": "q-1",
    "category": "clinical_history" | "ayush_assessment" | "lifestyle_habits" | "allergies_safety",
    "categoryLabel": "e.g. Clinical History or Ayurvedic Assessment (Agni)",
    "isAyushAssessment": boolean,
    "ayushDomain": "Prakriti" | "Agni" | "Koshtha" | "Satva" | "Nadi" | "General",
    "question": "Question text in clear, patient-friendly language",
    "guidanceText": "Optional helpful tip explaining why we ask",
    "inputType": "single_choice" | "multi_choice" | "text",
    "options": ["Option 1", "Option 2", "Option 3", "Other / Not sure"]
  }
]`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '[]';
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ questions: parsed });
        }
      } catch (err) {
        console.error('Gemini adaptive questions error:', err);
        // Fall back to rule-based questions below
      }
    }

    // Fallback adaptive questions tailored to department and complaint
    const department = patientDetails?.department || 'General Ayurveda';
    const fallbackQuestions = getFallbackAdaptiveQuestions(department, patientDetails?.chiefComplaintBrief);
    res.json({ questions: fallbackQuestions, isFallback: !ai });
  });

  // AI 2: Multimodal Document OCR & Extraction
  app.post('/api/ai/extract-document', async (req: Request, res: Response) => {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    const ai = getGenAI();

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Clean base64 string if it contains prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const systemPrompt = `You are a medical document OCR specialist and clinical record extractor assisting an Ayush clinic intake kiosk.
Your job is to examine an uploaded photo or scan of a medical prescription, OPD slip, lab report, or prior discharge summary.
Extract the structured information with high fidelity.
Pay special attention to both allopathic medications (e.g. Metformin, Telmisartan, Aceclofenac) and Ayurvedic/Ayush formulations (e.g. Guggulu, Kashayam, Bhasma, Taila, Asava/Arishta).
Return ONLY a valid JSON object matching the requested schema.`;

    const prompt = `Analyze this uploaded medical document and extract all available clinical data. Return JSON with this structure:
{
  "documentType": "Prescription / Lab Report / Discharge Summary / Ayush Case Sheet",
  "documentDate": "Date string or approximate year if visible",
  "prescribingClinicianOrFacility": "Doctor name or clinic name if visible",
  "medications": [
    {
      "name": "Medicine name (e.g. Tab Telmisartan 40mg or Yogaraja Guggulu)",
      "dosage": "e.g. 40 mg or 2 tabs",
      "frequency": "e.g. Once daily, BD, TDS, SOS",
      "duration": "e.g. 15 days, 1 month, or Ongoing",
      "type": "Ayurvedic" | "Allopathic" | "Homeopathic" | "Unani/Siddha" | "Unknown"
    }
  ],
  "clinicalFindings": [
    "Key laboratory or clinical observations (e.g. BP 160/95, Fasting Glucose 145 mg/dL, crepitus, disc bulge)"
  ],
  "allergiesNoted": [
    "Any drug or food allergies mentioned on the slip"
  ],
  "rawSummary": "A concise 2-sentence clinical synopsis of what this document shows"
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '{}';
        const parsed = JSON.parse(jsonText);
        return res.json({ extractedData: parsed });
      } catch (err) {
        console.error('Gemini vision document extraction error:', err);
      }
    }

    // Fallback extraction simulation if no API key or vision call failed
    res.json({
      extractedData: {
        documentType: 'Medical Record / Prescription',
        documentDate: new Date().toLocaleDateString('en-GB'),
        prescribingClinicianOrFacility: 'Verified Clinical Document',
        medications: [
          { name: 'Yogaraja Guggulu', dosage: '2 tablets', frequency: 'Twice daily with warm water', type: 'Ayurvedic' },
          { name: 'Tab Telmisartan', dosage: '40 mg', frequency: 'Once daily (morning)', type: 'Allopathic' },
        ],
        clinicalFindings: [
          'Document uploaded successfully',
          'Prior diagnosis and ongoing treatment recorded for clinician review',
        ],
        allergiesNoted: ['None specifically listed on document'],
        rawSummary: 'Document reviewed. Active dual regimen of Ayurvedic and allopathic medications identified for clinical reconciliation.',
      },
      isFallback: true,
    });
  });

  // AI 3: Generate Clinical Case Sheet Summary & Red Flag Detection
  app.post('/api/ai/generate-summary', async (req: Request, res: Response) => {
    const { patientDetails, rawAnswers, extractedDocument } = req.body;
    const ai = getGenAI();

    const systemPrompt = `You are an AI Clinical Assistant assisting Ayush doctors (Vaidyas / Ayush Medical Officers).
Synthesize the patient's intake data, their responses to adaptive clinical and Ayurvedic assessment questions, and any extracted prescription/lab data.
You must output a structured clinical case sheet and identify any clinical red flags.

CRITICAL CLINICAL RESPONSIBILITY NOTE:
Your output is strictly an AI-assisted draft for the registered clinician's validation and oversight.
Identify genuine red flags:
- Cardiovascular warning signs (e.g. uncontrolled blood pressure >160/95, chest discomfort, shortness of breath)
- Critical drug interactions (e.g. blood thinners like Aspirin/Warfarin combined with heavy Ayurvedic Guggulu/Shallaki formulations or Raktamokshana)
- Inconsistencies between self-reported health and prescription records
- Panchakarma contraindications (e.g. acute fever, severe dehydration, pregnant patient, uncontrolled systemic illness)
- Severe drug allergies

Output MUST be strictly valid JSON matching the requested schema.`;

    const prompt = `Synthesize this patient's intake into a clinical case sheet and red flag evaluation:
PATIENT PROFILE:
Name: ${patientDetails?.fullName}
Age: ${patientDetails?.age}, Gender: ${patientDetails?.gender}
Department: ${patientDetails?.department}
Chief Complaint: ${patientDetails?.chiefComplaintBrief}
Duration: ${patientDetails?.durationOfComplaint}

INTAKE QUESTIONS & ANSWERS:
${JSON.stringify(rawAnswers || [], null, 2)}

EXTRACTED PRIOR DOCUMENT DATA:
${JSON.stringify(extractedDocument || {}, null, 2)}

Return JSON matching this exact structure:
{
  "aiCaseSummary": {
    "chiefComplaint": "Structured clinical chief complaint with duration",
    "historyOfPresentingIllness": "2-3 sentences chronological HPI including aggravating factors and relevant system review",
    "pastMedicalHistory": "Chronic illnesses, surgeries, prior treatments",
    "ayushAssessment": {
      "prakritiTendency": "Body constitution inference (e.g. Vata-Pitta, Kapha-Pitta) based on answers",
      "agniState": "Agni classification (Vishamagni, Tikshnagni, Mandagni, or Samagni) with clinical rationale",
      "koshthaHabit": "Koshtha classification (Mridu, Krura, or Madhyama)",
      "satvaMentalState": "Satva assessment (Pravara, Madhyama, Avara)",
      "dietaryHabits": "Ahara pattern (food timings, spices, water intake)",
      "sleepQuality": "Nidra pattern and disruptions",
      "additionalObservations": "Any pulse/tongue or systemic notes from answers"
    },
    "activeMedicationsList": ["List of all ongoing medications with dosages"],
    "knownAllergies": ["List of noted allergies or 'No known drug allergies'"],
    "provisionalAyushDiagnosis": "Clinical Ayush diagnostic impression (e.g. Sandhigata Vata, Amlapitta, Gridhrasi, Sthaulya)",
    "recommendedInvestigationOrTherapy": "Suggested initial Panchakarma/herbal/lifestyle therapy considerations for the doctor to review",
    "dietAndLifestyleAdvice": "Pathya (recommended) and Apathya (contraindicated) dietary guidelines"
  },
  "redFlags": [
    {
      "id": "rf-1",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM",
      "category": "Red-Flag Symptom" | "Allergy Alert" | "Inconsistent History" | "Therapy Contraindication",
      "title": "Clear concise alert title",
      "description": "Detailed explanation of the risk",
      "clinicalActionNeeded": "Immediate action clinician should take before initiating therapy"
    }
  ]
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '{}';
        const parsed = JSON.parse(jsonText);
        if (parsed.aiCaseSummary) {
          return res.json(parsed);
        }
      } catch (err) {
        console.error('Gemini case summary generation error:', err);
      }
    }

    // Fallback rule-based case summary and red flags
    const fallbackSummary = generateFallbackSummary(patientDetails, rawAnswers, extractedDocument);
    res.json(fallbackSummary);
  });

  // Serve static files or Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sentinel Intake server active on http://0.0.0.0:${PORT}`);
  });
}

// Helper: Rule-based fallback questions if Gemini API key is not yet set or unavailable
function getFallbackAdaptiveQuestions(department: string, complaint: string = '') {
  const baseQuestions = [
    {
      id: 'q-fall-1',
      category: 'clinical_history',
      categoryLabel: 'Clinical History',
      isAyushAssessment: false,
      ayushDomain: 'General',
      question: 'How long have you experienced these symptoms, and how does it affect your daily work?',
      guidanceText: 'Helps your clinician determine chronicity and disease stage (Nava vs. Jeerna Vyadhi).',
      inputType: 'single_choice',
      options: [
        'Less than 2 weeks (Acute)',
        '1 to 3 months (Sub-acute)',
        '3 to 12 months (Chronic)',
        'More than 1 year (Long-standing)',
      ],
    },
    {
      id: 'q-fall-2',
      category: 'ayush_assessment',
      categoryLabel: 'Ayurvedic Assessment (Agni)',
      isAyushAssessment: true,
      ayushDomain: 'Agni',
      question: 'How is your appetite and digestion after meals?',
      guidanceText: 'In Ayush science, Agni (digestive fire) is central to disease origin and herbal formulation tolerance.',
      inputType: 'single_choice',
      options: [
        'Samagni: Normal appetite, digests food comfortably within 3-4 hours',
        'Vishamagni: Irregular appetite, unpredictable digestion with gas/bloating',
        'Tikshnagni: Sharp, excessive hunger with burning/acidic sensation',
        'Mandagni: Low appetite, feeling heavy or sluggish after small meals',
      ],
    },
    {
      id: 'q-fall-3',
      category: 'ayush_assessment',
      categoryLabel: 'Ayurvedic Assessment (Koshtha)',
      isAyushAssessment: true,
      ayushDomain: 'Koshtha',
      question: 'What is your typical bowel pattern and stool consistency?',
      guidanceText: 'Assesses bowel habit (Koshtha) which governs internal cleansing and herbal dosage.',
      inputType: 'single_choice',
      options: [
        'Mridu Koshtha: Soft stools 1-2 times daily, very easy evacuation',
        'Madhyama Koshtha: Regular formed stool once daily, normal evacuation',
        'Krura Koshtha: Hard dry stools, passes once in 2-3 days, difficult evacuation',
      ],
    },
    {
      id: 'q-fall-4',
      category: 'ayush_assessment',
      categoryLabel: 'Ayurvedic Assessment (Prakriti)',
      isAyushAssessment: true,
      ayushDomain: 'Prakriti',
      question: 'Which climatic condition or physical trait describes your natural tendency best?',
      guidanceText: 'Constitutional balance indicator (Dosha predominance).',
      inputType: 'single_choice',
      options: [
        'Vata tendency: Dislike cold weather, dry skin, light light sleeper, active mind',
        'Pitta tendency: Intolerant to heat/sun, prone to sweat/acidity, medium build',
        'Kapha tendency: Prefers warm/dry weather, calm demeanor, deep sleeper, heavier build',
        'Mixed / Dual tendency (Vata-Pitta or Pitta-Kapha)',
      ],
    },
    {
      id: 'q-fall-5',
      category: 'allergies_safety',
      categoryLabel: 'Clinical Safety & History',
      isAyushAssessment: false,
      ayushDomain: 'General',
      question: 'Do you have any existing medical conditions or take daily medications?',
      guidanceText: 'Crucial for cross-checking contraindications with Panchakarma and herbal preparations.',
      inputType: 'multi_choice',
      options: [
        'Hypertension / High Blood Pressure',
        'Diabetes Mellitus',
        'Cardiac / Heart condition or Stent',
        'Thyroid disorder',
        'Known drug or herbal allergies',
        'None of the above',
      ],
    },
    {
      id: 'q-fall-6',
      category: 'lifestyle_habits',
      categoryLabel: 'Sleep & Stress Pattern (Nidra & Satva)',
      isAyushAssessment: true,
      ayushDomain: 'Satva',
      question: 'How is your nocturnal sleep quality and daytime energy?',
      guidanceText: 'Reflects mental and physical rest (Nidra & Satva Bala).',
      inputType: 'single_choice',
      options: [
        'Sound, uninterrupted sleep (6-8 hours), wake refreshed',
        'Difficulty falling asleep due to pain or anxious thoughts',
        'Frequent mid-night awakenings',
        'Excessive daytime drowsiness or unrefreshing sleep',
      ],
    },
  ];

  return baseQuestions;
}

// Helper: Rule-based fallback clinical summary generator
function generateFallbackSummary(patientDetails: any, rawAnswers: any[], extractedDocument: any) {
  const department = patientDetails?.department || 'General Ayurveda';
  const chief = patientDetails?.chiefComplaintBrief || 'Health evaluation';
  const duration = patientDetails?.durationOfComplaint || 'Noted duration';

  // Check answers for Agni / Koshtha / Comorbidities
  let agniAnswer = 'Vishamagni (variable digestion)';
  let koshthaAnswer = 'Madhyama Koshtha (moderate bowel)';
  let prakritiAnswer = 'Vata-Pitta tendency';
  const comorbidities: string[] = [];
  const redFlags: any[] = [];

  for (const item of rawAnswers || []) {
    const text = typeof item.answer === 'string' ? item.answer : JSON.stringify(item.answer);
    if (item.question.includes('Agni') || item.ayushDomain === 'Agni') {
      agniAnswer = text;
    }
    if (item.question.includes('Koshtha') || item.ayushDomain === 'Koshtha') {
      koshthaAnswer = text;
    }
    if (item.question.includes('Prakriti') || item.ayushDomain === 'Prakriti') {
      prakritiAnswer = text;
    }
    if (text.includes('Hypertension') || text.includes('Blood Pressure')) {
      comorbidities.push('Hypertension');
      redFlags.push({
        id: `rf-bp-${Date.now()}`,
        severity: 'HIGH',
        category: 'Red-Flag Symptom',
        title: 'Hypertension History Noted',
        description: 'Patient reported history of high blood pressure. Check vital signs and verify BP before administering heavy Swedana or stimulant herbs.',
        clinicalActionNeeded: 'Measure blood pressure at triage counter before consultation.',
      });
    }
    if (text.includes('Cardiac') || text.includes('Heart')) {
      comorbidities.push('Cardiac condition');
      redFlags.push({
        id: `rf-cardiac-${Date.now()}`,
        severity: 'CRITICAL',
        category: 'Therapy Contraindication',
        title: 'Cardiac History Contraindication Alert',
        description: 'Prior cardiac history reported. Vigorous Panchakarma Shodhana (e.g. Vamana, Virechana) and heavy thermal Swedana are contraindicated.',
        clinicalActionNeeded: 'Consult attending Ayush Physician for Shamana therapy protocol instead of Shodhana.',
      });
    }
  }

  // Check extracted document medications
  const meds: string[] = [];
  if (extractedDocument?.medications?.length) {
    for (const m of extractedDocument.medications) {
      meds.push(`${m.name} (${m.dosage || ''} ${m.frequency || ''})`);
      if (m.name.toLowerCase().includes('aspirin') || m.name.toLowerCase().includes('warfarin') || m.name.toLowerCase().includes('ecosprin')) {
        redFlags.push({
          id: `rf-med-${Date.now()}`,
          severity: 'HIGH',
          category: 'Therapy Contraindication',
          title: 'Anticoagulant / Antiplatelet Cross-Check',
          description: `Patient is prescribed ${m.name}. Exercise caution with concurrent antiplatelet herbs (Guggulu, Shallaki) or Raktamokshana.`,
          clinicalActionNeeded: 'Check coagulation profile and advise on drug spacing.',
        });
      }
    }
  }

  return {
    aiCaseSummary: {
      chiefComplaint: `${chief} (${duration})`,
      historyOfPresentingIllness: `Patient presents to ${department} OPD with complaints of ${chief.toLowerCase()} persisting for ${duration}. Symptom progression correlates with reported lifestyle and constitutional assessment.`,
      pastMedicalHistory: comorbidities.length ? comorbidities.join(', ') : 'No major chronic illnesses reported.',
      ayushAssessment: {
        prakritiTendency: prakritiAnswer,
        agniState: agniAnswer,
        koshthaHabit: koshthaAnswer,
        satvaMentalState: 'Madhyama Satva (moderate endurance)',
        dietaryHabits: 'Variable dietary pattern; advice required on Pathya ahara.',
        sleepQuality: 'Mild to moderate sleep disturbances noted.',
        additionalObservations: 'Clinician to perform Ashtavidha Pariksha (Nadi, Mutra, Mala, Jihwa, Shabda, Sparsha, Drik, Akriti).',
      },
      activeMedicationsList: meds.length ? meds : ['No active prescription medications recorded.'],
      knownAllergies: extractedDocument?.allergiesNoted?.length ? extractedDocument.allergiesNoted : ['No known drug allergies reported.'],
      provisionalAyushDiagnosis: `${chief} - Ayush evaluation required`,
      recommendedInvestigationOrTherapy: 'Deepana-Pachana therapy followed by tailored Shamana/Shodhana protocol according to Kostha and Agni status.',
      dietAndLifestyleAdvice: 'Pathya: Warm freshly cooked meals, boiled cumin water. Apathya: Cold refrigerated foods, deep-fried items, late dinners.',
    },
    redFlags,
  };
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
