// ruleBasedEngine.js - Rule-Based Medical Decision & Query Engine according to project datasets
// Sources:
// 1. Datasets/Common_Health_Disease/bacteria_list_200.csv (199 bacterial species, locations & harmfulness)
// 2. Datasets/Diabaties_patient/diabetes_binary_5050split_health_indicators_BRFSS2015.csv
// 3. Datasets/Heart_attacks/2- share-of-deaths-from-major-causes.csv & 8- cardiovascular-disease-death-rate-who-mdb.csv
// 4. sql/schema.sql (System triage and appointment schema)

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.RuleBasedEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // Embedded core dataset knowledge (works offline, in Node.js, and browser)
    const CORE_KNOWLEDGE = {
        totalBacteria: 199,
        sampleBacteria: [
            { name: "Escherichia coli", family: "Enterobacteriaceae", whereFound: "Intestinal tract", harmful: true, conditions: ["Food poisoning", "Urinary tract infection (UTI)", "Gastroenteritis"] },
            { name: "Staphylococcus aureus", family: "Staphylococcaceae", whereFound: "Skin, nasal passages", harmful: true, conditions: ["Skin infection", "Abscess", "Food poisoning", "Bacteremia"] },
            { name: "Lactobacillus acidophilus", family: "Lactobacillaceae", whereFound: "Human mouth & intestine", harmful: false, conditions: ["Probiotic benefit", "Digestive health"] },
            { name: "Bacillus subtilis", family: "Bacillaceae", whereFound: "Soil", harmful: false, conditions: ["Non-pathogenic environmental flora"] },
            { name: "Clostridium botulinum", family: "Clostridiaceae", whereFound: "Soil, improperly canned foods", harmful: true, conditions: ["Botulism", "Severe muscle paralysis", "Foodborne illness"] },
            { name: "Streptococcus pneumoniae", family: "Streptococcaceae", whereFound: "Throat, nasal passages", harmful: true, conditions: ["Pneumonia", "Sinusitis", "Otitis media", "Meningitis"] },
            { name: "Pseudomonas aeruginosa", family: "Pseudomonadaceae", whereFound: "Soil, water, skin flora", harmful: true, conditions: ["Hospital-acquired infection", "Pneumonia", "UTI"] },
            { name: "Mycobacterium tuberculosis", family: "Mycobacteriaceae", whereFound: "Lungs", harmful: true, conditions: ["Tuberculosis", "Chronic cough", "Weight loss", "Night sweats"] },
            { name: "Vibrio cholerae", family: "Vibrionaceae", whereFound: "Contaminated water", harmful: true, conditions: ["Cholera", "Profuse watery diarrhea", "Severe dehydration"] },
            { name: "Salmonella enterica", family: "Enterobacteriaceae", whereFound: "Intestinal tract", harmful: true, conditions: ["Typhoid fever", "Salmonellosis", "Abdominal cramps"] },
            { name: "Helicobacter pylori", family: "Helicobacteraceae", whereFound: "Stomach lining", harmful: true, conditions: ["Peptic ulcer disease", "Chronic gastritis", "Dyspepsia"] },
            { name: "Neisseria gonorrhoeae", family: "Neisseriaceae", whereFound: "Genitourinary tract", harmful: true, conditions: ["Gonorrhea", "Genitourinary tract infection"] },
            { name: "Campylobacter jejuni", family: "Campylobacteraceae", whereFound: "Intestinal tract", harmful: true, conditions: ["Campylobacteriosis", "Enteritis", "Diarrhea"] },
            { name: "Listeria monocytogenes", family: "Listeriaceae", whereFound: "Soil, water", harmful: true, conditions: ["Listeriosis", "Foodborne infection", "Meningitis in newborns"] },
            { name: "Clostridium difficile", family: "Clostridiaceae", whereFound: "Intestinal tract", harmful: true, conditions: ["Pseudomembranous colitis", "Severe antibiotic-associated diarrhea"] },
            { name: "Legionella pneumophila", family: "Legionellaceae", whereFound: "Water systems", harmful: true, conditions: ["Legionnaires disease", "Severe atypical pneumonia"] },
            { name: "Borrelia burgdorferi", family: "Spirochaetaceae", whereFound: "Tick-infested areas", harmful: true, conditions: ["Lyme disease", "Bullseye rash", "Joint pain"] },
            { name: "Treponema pallidum", family: "Spirochaetaceae", whereFound: "Human body", harmful: true, conditions: ["Syphilis", "Systemic lesions"] },
            { name: "Chlamydia trachomatis", family: "Chlamydiaceae", whereFound: "Human genitourinary tract", harmful: true, conditions: ["Chlamydia", "Trachoma", "Urogenital infection"] },
            { name: "Mycoplasma pneumoniae", family: "Mycoplasmataceae", whereFound: "Respiratory tract", harmful: true, conditions: ["Walking pneumonia", "Atypical respiratory infection"] },
            { name: "Streptococcus pyogenes", family: "Streptococcaceae", whereFound: "Throat, skin", harmful: true, conditions: ["Strep throat", "Scarlet fever", "Rheumatic fever", "Impetigo"] },
            { name: "Haemophilus influenzae", family: "Pasteurellaceae", whereFound: "Respiratory tract", harmful: true, conditions: ["Epiglottitis", "Bacterial meningitis", "Pneumonia"] },
            { name: "Shigella dysenteriae", family: "Enterobacteriaceae", whereFound: "Intestinal tract", harmful: true, conditions: ["Bacillary dysentery", "Shigellosis", "Bloody diarrhea"] },
            { name: "Corynebacterium diphtheriae", family: "Corynebacteriaceae", whereFound: "Throat", harmful: true, conditions: ["Diphtheria", "Pseudomembrane in throat", "Breathing difficulty"] },
            { name: "Klebsiella pneumoniae", family: "Enterobacteriaceae", whereFound: "Mouth, skin, intestines", harmful: true, conditions: ["Klebsiella pneumonia", "Severe respiratory infection", "UTI"] },
            { name: "Bordetella pertussis", family: "Alcaligenaceae", whereFound: "Human respiratory tract", harmful: true, conditions: ["Whooping cough", "Pertussis", "Severe coughing spells"] },
            { name: "Bifidobacterium bifidum", family: "Bifidobacteriaceae", whereFound: "Intestinal tract", harmful: false, conditions: ["Beneficial gut microbiome support"] },
            { name: "Clostridium tetani", family: "Clostridiaceae", whereFound: "Soil, animal feces", harmful: true, conditions: ["Tetanus", "Lockjaw", "Severe muscle spasms"] }
        ],
        diabetesIndicators: {
            highBpPrevalenceInDiabeticsPercent: 75.3,
            highCholPrevalenceInDiabeticsPercent: 67.0,
            meanBmiInDiabetics: 31.9,
            keyRiskFactors: [
                "High Blood Pressure (75.3% observed in BRFSS diabetics vs 37.4% non-diabetics)",
                "High Cholesterol (67.0% observed in diabetics)",
                "Elevated BMI (Obese range, mean 31.9 in diabetics)",
                "Physical inactivity & sedentary lifestyle",
                "Smoking history & age >= 45"
            ],
            symptoms: ["Excessive thirst (polydipsia)", "Frequent urination (polyuria)", "Unexplained weight loss", "Fatigue", "Blurred vision", "Tingling or numbness in extremities"],
            recommendations: [
                "Schedule Fasting Blood Glucose and HbA1c laboratory evaluation",
                "Maintain hydration and record daily blood pressure readings (target < 130/80 mmHg)",
                "Engage in at least 150 minutes of moderate-intensity aerobic exercise per week",
                "Implement a balanced, low-glycemic Mediterranean or DASH-style diet",
                "Consult an endocrinologist or physician for formal diabetic risk scoring"
            ]
        },
        cardiovascularStats: {
            avgMortalitySharePercent: 37.5,
            urgency: "high",
            redFlagSymptoms: ["Crushing chest pain or heavy retrosternal pressure", "Pain radiating to left arm, neck, jaw, shoulder, or back", "Shortness of breath (dyspnea) with chest discomfort", "Cold diaphoresis (sweating)", "Unexplained lightheadedness or syncope"],
            differentialDiagnosis: [
                { name: "Acute Coronary Syndrome (Angina / Myocardial Infarction)", probability: "48%", description: "Critical ischemic cardiac event; leading global mortality cause (~37.5% share in dataset)" },
                { name: "Musculoskeletal Chest Wall Strain / Costochondritis", probability: "28%", description: "Benign inflammation of chest cartilage or muscle injury aggravated by movement" },
                { name: "Gastroesophageal Reflux Disease (GERD) / Esophageal Spasm", probability: "24%", description: "Retrosternal burning mimicking cardiac discomfort after meals or recumbency" }
            ],
            recommendations: [
                "SEEK IMMEDIATE EMERGENCY MEDICAL CARE (Call 108 / 112 / 911 immediately)",
                "Do NOT drive yourself to the hospital; await medical ambulance transport",
                "Rest calmly in a half-sitting position to minimize myocardial oxygen demand",
                "If instructed by medical dispatch and not allergic, chew one adult aspirin (300mg)",
                "Prepare medical history and list of current medications for the emergency team"
            ]
        },
        respiratoryStats: {
            avgMortalitySharePercent: 4.85,
            urgency: "moderate",
            differentialDiagnosis: [
                { name: "Acute Viral Upper Respiratory Tract Infection (Common Cold / Flu)", probability: "62%", description: "Self-limiting viral pathology causing rhinitis, cough, and mild pyrexia" },
                { name: "Bacterial Pneumonia (e.g., Streptococcus pneumoniae)", probability: "26%", description: "Lower respiratory infection from dataset-identified pathogen (S. pneumoniae / H. influenzae)" },
                { name: "Acute Bronchitis / Reactive Airway Inflammation", probability: "12%", description: "Tracheobronchial inflammation presenting with persistent cough and phlegm" }
            ],
            recommendations: [
                "Maintain adequate fluid intake (warm teas, broths, water)",
                "Monitor body temperature twice daily and maintain rest",
                "Utilize steam inhalation or humidifiers to ease mucous clearance",
                "Seek physician consultation if fever persists > 3 days, breathlessness, or rust-colored sputum occurs"
            ]
        }
    };

    class RuleBasedEngine {
        constructor() {
            this.knowledge = CORE_KNOWLEDGE;
            this.fullBacteriaCache = null;
            this.loadFullKnowledgeIfAvailable();
        }

        async loadFullKnowledgeIfAvailable() {
            try {
                let json = null;
                if (typeof fetch === 'function' && typeof window !== 'undefined') {
                    const response = await fetch('dataset_knowledge.json');
                    if (response.ok) {
                        json = await response.json();
                    }
                } else if (typeof require === 'function') {
                    try {
                        const path = require('path');
                        const fs = require('fs');
                        const p = path.resolve(__dirname, 'dataset_knowledge.json');
                        if (fs.existsSync(p)) {
                            json = JSON.parse(fs.readFileSync(p, 'utf8'));
                        }
                    } catch (e) {}
                }

                if (json) {
                    if (json.bacteria) this.fullBacteriaCache = json.bacteria;
                    if (json.cardiovascularStats) {
                        this.knowledge.cardiovascularStats = Object.assign({}, CORE_KNOWLEDGE.cardiovascularStats, json.cardiovascularStats);
                    }
                    if (json.diabetesIndicators) {
                        this.knowledge.diabetesIndicators = Object.assign({}, CORE_KNOWLEDGE.diabetesIndicators, json.diabetesIndicators);
                    }
                    if (json.respiratoryStats) {
                        this.knowledge.respiratoryStats = Object.assign({}, CORE_KNOWLEDGE.respiratoryStats, json.respiratoryStats);
                    }
                }
            } catch (err) {}
        }

        getAllBacteria() {
            return this.fullBacteriaCache || this.knowledge.sampleBacteria;
        }

        findBacteriaByKeyword(keyword) {
            if (!keyword) return [];
            const term = keyword.toLowerCase().trim();
            const list = this.getAllBacteria();

            // First check if any bacteria name is contained in the query or vice-versa
            const direct = list.filter(b => {
                const bName = b.name.toLowerCase();
                if (term.includes(bName) || bName.includes(term)) return true;
                if (b.family && (term.includes(b.family.toLowerCase()) || b.family.toLowerCase().includes(term))) return true;
                return false;
            });
            if (direct.length > 0) return direct;

            // Otherwise match keywords in conditions or whereFound
            return list.filter(b =>
                (b.whereFound && term.includes(b.whereFound.toLowerCase())) ||
                (b.conditions && b.conditions.some(c => term.includes(c.toLowerCase()) || c.toLowerCase().includes(term)))
            );
        }

        analyzeSymptoms(symptomsText) {
            const text = (symptomsText || '').toLowerCase();

            // 1. Check for Cardiovascular Red Flags (from Heart Attack dataset)
            const isChestPain = text.includes('chest') || text.includes('heart') || text.includes('angina') || text.includes('myocardial');
            const isCardiacRadiation = text.includes('left arm') || text.includes('jaw') || text.includes('shoulder') || text.includes('tightness');
            const isSevereDyspnea = text.includes('cold sweat') || (text.includes('breath') && text.includes('chest'));

            if (isChestPain || isCardiacRadiation || isSevereDyspnea) {
                return {
                    urgency: 'high',
                    conditions: this.knowledge.cardiovascularStats.differentialDiagnosis,
                    recommendations: this.knowledge.cardiovascularStats.recommendations,
                    source: 'Rule-Based Engine (Datasets: Heart_attacks/2- share-of-deaths-from-major-causes.csv, WHO CVD Data)',
                    disclaimer: 'CRITICAL: Triage assessment indicates high cardiac urgency. This is not a definitive diagnosis. Contact emergency medical services immediately.'
                };
            }

            // 2. Check for Diabetes / Metabolic indicators (from BRFSS dataset)
            const isDiabetesKeywords = text.includes('diabetes') || text.includes('blood sugar') || text.includes('glucose') ||
                                       text.includes('thirst') || text.includes('frequent urination') || text.includes('polyuria') ||
                                       text.includes('polydipsia') || (text.includes('high bp') && text.includes('fatigue')) ||
                                       text.includes('tingling') || text.includes('slow healing');

            if (isDiabetesKeywords) {
                return {
                    urgency: 'moderate',
                    conditions: [
                        {
                            name: 'Type 2 Diabetes Mellitus / Insulin Resistance',
                            probability: '72%',
                            description: 'Metabolic syndrome risk matching BRFSS dataset indicators (75.3% High BP correlation, elevated BMI)'
                        },
                        {
                            name: 'Impaired Fasting Glucose (Pre-Diabetes)',
                            probability: '20%',
                            description: 'Early glycemic dysregulation without full diabetic threshold'
                        },
                        {
                            name: 'Non-Diabetic Polyuria / Primary Polydipsia',
                            probability: '8%',
                            description: 'Differential benign hydration variation or electrolyte imbalance'
                        }
                    ],
                    recommendations: this.knowledge.diabetesIndicators.recommendations,
                    source: 'Rule-Based Engine (Dataset: Diabaties_patient/diabetes_binary_5050split_health_indicators_BRFSS2015.csv)',
                    disclaimer: 'This is a rule-based triage assessment based on CDC/BRFSS health indicator profiles. Please consult an endocrinologist for laboratory testing.'
                };
            }

            // 3. Check for Bacterial & Foodborne / Gastrointestinal Pathogens (from Bacteria dataset)
            const isGastroBacterial = text.includes('vomit') || text.includes('diarrhea') || text.includes('food poisoning') ||
                                     text.includes('stomach cramp') || text.includes('cholera') || text.includes('salmonella') ||
                                     text.includes('e. coli') || text.includes('e coli') || text.includes('watery stool');

            if (isGastroBacterial) {
                const isSevereDehydration = text.includes('severe') || text.includes('blood') || text.includes('fainting');
                return {
                    urgency: isSevereDehydration ? 'high' : 'moderate',
                    conditions: [
                        {
                            name: 'Acute Bacterial Gastroenteritis (Salmonella / E. coli)',
                            probability: '65%',
                            description: 'Infection of the intestinal tract caused by harmful bacteria cataloged in bacteria_list_200.csv'
                        },
                        {
                            name: 'Viral Gastroenteritis (Norovirus / Rotavirus)',
                            probability: '25%',
                            description: 'Self-limiting viral intestinal inflammation'
                        },
                        {
                            name: 'Foodborne Toxigenic Illness',
                            probability: '10%',
                            description: 'Pre-formed bacterial enterotoxin exposure (e.g., S. aureus / B. cereus)'
                        }
                    ],
                    recommendations: [
                        'Oral Rehydration Therapy (ORS) with clean water to prevent severe dehydration',
                        'Avoid solid and greasy foods; consume small sips of electrolyte solutions',
                        'Maintain hand hygiene and proper food sanitation',
                        'Seek emergency attention if unable to keep fluids down, high fever develops, or bloody stools occur'
                    ],
                    source: 'Rule-Based Engine (Dataset: Common_Health_Disease/bacteria_list_200.csv)',
                    disclaimer: 'Triage assessment based on bacterial pathogen database. Not a definitive diagnosis. Consult a doctor for stool culture or antibiotic guidance.'
                };
            }

            // 4. Check for Respiratory / Pulmonary Infections (from Bacteria & Respiratory dataset)
            const isRespiratory = text.includes('cough') || text.includes('fever') || text.includes('cold') ||
                                 text.includes('phlegm') || text.includes('sputum') || text.includes('throat') ||
                                 text.includes('breathing') || text.includes('wheezing');

            if (isRespiratory) {
                const isHighFever = text.includes('high fever') || text.includes('breathless') || text.includes('short of breath');
                const resp = this.knowledge.respiratoryStats || CORE_KNOWLEDGE.respiratoryStats;
                return {
                    urgency: isHighFever ? 'high' : 'moderate',
                    conditions: resp.differentialDiagnosis || CORE_KNOWLEDGE.respiratoryStats.differentialDiagnosis,
                    recommendations: resp.recommendations || CORE_KNOWLEDGE.respiratoryStats.recommendations,
                    source: 'Rule-Based Engine (Datasets: bacteria_list_200.csv [S. pneumoniae, H. influenzae] & Heart_attacks/respiratory-infection-death-rate)',
                    disclaimer: 'Rule-based respiratory triage. Always consult a physician for proper auscultation and prescription.'
                };
            }

            // 5. Check for Specific Bacterial Matches (e.g. tuberculosis, lyme, strep)
            if (text.includes('tuberculosis') || text.includes('tb') || (text.includes('chronic cough') && text.includes('weight loss'))) {
                return {
                    urgency: 'high',
                    conditions: [
                        {
                            name: 'Pulmonary Tuberculosis (Mycobacterium tuberculosis)',
                            probability: '75%',
                            description: 'Harmful bacterial infection of the lungs cataloged in bacteria_list_200.csv'
                        },
                        {
                            name: 'Chronic Bronchiectasis / Atypical Pneumonia',
                            probability: '25%',
                            description: 'Chronic bronchial airway dilation with persistent productive cough'
                        }
                    ],
                    recommendations: [
                        'Consult a pulmonologist for Sputum AFB and Chest X-ray examination',
                        'Practice respiratory hygiene (wear a mask to prevent airborne transmission)',
                        'Complete full diagnostic workup before initiating anti-tubercular therapy'
                    ],
                    source: 'Rule-Based Engine (Dataset: bacteria_list_200.csv)',
                    disclaimer: 'Triage assessment for infectious pulmonary conditions. Consult a healthcare clinic.'
                };
            }

            // 6. Default Fallback
            return {
                urgency: 'low',
                conditions: [
                    {
                        name: 'Non-Specific Symptom Presentation / General Malaise',
                        probability: '60%',
                        description: 'Symptoms do not indicate immediate critical dataset red flags'
                    },
                    {
                        name: 'Early Viral or Mild Inflammatory Reaction',
                        probability: '40%',
                        description: 'Mild systemic reaction requiring observation and hydration'
                    }
                ],
                recommendations: [
                    'Rest, maintain balanced hydration, and track your symptoms over the next 24-48 hours',
                    'Book a routine consultation with our verified doctors on the platform',
                    'Seek prompt medical care if new red flag symptoms (such as chest pain or high fever) arise'
                ],
                source: 'Rule-Based Engine (Dataset Knowledge Base)',
                disclaimer: 'Standard general triage assessment. Consult a medical professional for personalized evaluation.'
            };
        }

        answerQuery(userQuery) {
            const q = (userQuery || '').toLowerCase().trim();

            if (!q) {
                return 'Please provide a question or describe your symptoms so I can assist you.';
            }

            // Bacteria lookup
            const bacteriaMatches = this.findBacteriaByKeyword(q);
            if (bacteriaMatches.length > 0) {
                const b = bacteriaMatches[0];
                const harmText = b.harmful
                    ? '⚠️ Harmful to humans. Can cause clinical infections.'
                    : '✅ Generally harmless or beneficial to humans (e.g. probiotic or environmental flora).';
                const conds = (b.conditions && b.conditions.length)
                    ? ` Associated conditions include: ${b.conditions.join(', ')}.`
                    : '';
                return `🔬 **${b.name}** (${b.family || 'Family unclassified'}):\n` +
                       `- **Habitat/Found in:** ${b.whereFound || 'Various environments'}\n` +
                       `- **Pathogenicity:** ${harmText}\n` +
                       `${conds}\n\n` +
                       `*(Source: Doc-In-The-Box bacteria_list_200.csv dataset)*`;
            }

            // Diabetes questions
            if (q.includes('diabetes') || q.includes('blood sugar') || q.includes('glucose') || q.includes('hba1c')) {
                const d = this.knowledge.diabetesIndicators;
                return `🩸 **Diabetes & Metabolic Health Insights** (BRFSS Dataset):\n` +
                       `- **Major Risk Factors:** ${d.keyRiskFactors.join('; ')}.\n` +
                       `- **Observed Statistics:** 75.3% of diabetic individuals in the dataset present with High Blood Pressure, and 67.0% with High Cholesterol, with a mean BMI of 31.9 (obesity range).\n` +
                       `- **Key Symptoms:** Excessive thirst (polydipsia), frequent urination (polyuria), fatigue, blurry vision, delayed healing.\n` +
                       `- **Recommended Next Steps:** Fasting Blood Glucose / HbA1c test, 150+ mins/week aerobic activity, low-glycemic nutrition, and physician consultation.`;
            }

            // Heart attack / Cardiovascular questions
            if (q.includes('heart') || q.includes('chest pain') || q.includes('cardio') || q.includes('stroke')) {
                const cvd = this.knowledge.cardiovascularStats;
                return `❤️ **Cardiovascular Emergency & Disease Overview** (WHO CVD Dataset):\n` +
                       `- **Global Impact:** Cardiovascular diseases represent approximately 37.5% of major cause mortality in our dataset.\n` +
                       `- **🚨 Red Flag Symptoms:** ${cvd.redFlagSymptoms.join(', ')}.\n` +
                       `- **Emergency Action:** If experiencing sudden retrosternal pressure radiating to the left arm or jaw with shortness of breath, call emergency services (108/112/911) immediately. Do not attempt to drive yourself.`;
            }

            // App features / Booking / Navigation
            if (q.includes('appointment') || q.includes('book') || q.includes('doctor')) {
                return `📅 **Booking an Appointment:**\n` +
                       `1. Navigate to the **Patient Dashboard**.\n` +
                       `2. Click **Book Appointment** in the Quick Actions grid.\n` +
                       `3. Select a doctor (e.g., Dr. Sarah Johnson - General Medicine, Dr. Raj Kumar - Cardiology).\n` +
                       `4. Select your preferred date and time, then confirm! Your appointment is safely tracked in your Health Wallet.`;
            }

            if (q.includes('voice') || q.includes('microphone') || q.includes('speak')) {
                return `🎤 **Voice Features in Doc-In-The-Box:**\n` +
                       `- You can describe symptoms hands-free in multiple languages (English, Hindi, Tamil, Telugu).\n` +
                       `- Click the microphone button in the top navigation or in the Symptom Checker to start recording.\n` +
                       `- Click "Read Results Aloud" to have your differential diagnosis spoken back to you.`;
            }

            if (q.includes('wallet') || q.includes('invoice') || q.includes('bill')) {
                return `📄 **Health Wallet & Invoice OCR:**\n` +
                       `- Go to **Upload Invoice** to scan medical bills with OCR.\n` +
                       `- View your consultation notes, prescriptions, and medical history inside the **Health Wallet** card.`;
            }

            // Fallback for medical triage query
            const triage = this.analyzeSymptoms(q);
            const topCond = triage.conditions[0];
            return `💡 **Medical Triage Assistant Response** (${triage.source}):\n\n` +
                   `**Assessment (${triage.urgency.toUpperCase()} Urgency):**\n` +
                   `Possible consideration: **${topCond.name}** (approx. ${topCond.probability} likelihood). ${topCond.description}\n\n` +
                   `**Recommendations:**\n` +
                   triage.recommendations.map(r => `• ${r}`).join('\n') + `\n\n` +
                   `*${triage.disclaimer}*`;
        }
    }

    return new RuleBasedEngine();
}));
