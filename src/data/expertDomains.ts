import { ExpertProfile } from '../types';

export const EXPERT_PROFILES: ExpertProfile[] = [
  {
    id: 'general',
    name: 'J.A.R.V.I.S. Core',
    title: 'Proactive Executive Intelligence',
    description: 'Anticipates your workflow, generates proactive insights, and coordinates solutions across all domains.',
    iconName: 'Sparkles',
    badge: 'Proactive Engine',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    accentColor: '#D97706',
    samplePrompts: {
      en: [
        'Analyze my daily tasks and generate a prioritized 3-step action roadmap.',
        'Anticipate key risks before launching our new commercial service in India.',
        'Review our team project memo and suggest 3 high-impact follow-ups.',
      ],
      hi: [
        'मेरी दैनिक कार्ययोजना का विश्लेषण करें और ३ चरणों का रोडमैप बनाएं।',
        'भारत में हमारी नई सेवा शुरू करने से पहले संभावित जोखिमों का पूर्वानुमान लगाएं।',
        'हमारे प्रोजेक्ट मेमो की समीक्षा करें और महत्वपूर्ण कदम सुझाएं।',
      ],
    },
  },
  {
    id: 'medical',
    name: 'Health & Medical',
    title: 'Clinical Guidance & Wellness Advisor',
    description: 'Symptom triage, lab report clarifications, preventive wellness, dietetics, and clinical explanations.',
    iconName: 'Activity',
    badge: 'Clinical Advisory',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    accentColor: '#059669',
    samplePrompts: {
      en: [
        'Clarify high HbA1c blood test results in simple terminology with dietary advice.',
        'Explain red flag symptoms for pediatric seasonal fever vs dengue.',
        'Suggest an evidence-based cardio exercise regimen for hypertension control.',
      ],
      hi: [
        'HbA1c ब्लड टेस्ट रिपोर्ट का सरल भाषा में विश्लेषण और खानपान सलाह दें।',
        'बच्चों में मौसमी बुखार और डेंगू के लक्षणों में क्या अंतर है?',
        'उच्च रक्तचाप (High BP) को नियंत्रित करने के लिए जीवनशैली में क्या बदलाव करें?',
      ],
    },
  },
  {
    id: 'coding',
    name: 'Software Engineering',
    title: 'Principal Systems & Code Architect',
    description: 'Full-stack architecture, bug debugging, performance optimization, and secure coding practices.',
    iconName: 'Code',
    badge: 'Principal Architect',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    accentColor: '#2563EB',
    samplePrompts: {
      en: [
        'Debug an asynchronous race condition in React useEffect with strict cleanup.',
        'Design a high-throughput queue architecture using Redis and BullMQ.',
        'Write an optimized SQL query with window functions to compute monthly active users.',
      ],
      hi: [
        'React में मेमोरी लीक और useEffect के रेस कंडीशन को कैसे ठीक करें?',
        'Node.js और Redis के साथ उच्च-गति बैकएंड आर्किटेक्चर कैसे बनाएं?',
        'सॉफ्टवेयर परफॉर्मेंस बढ़ाने के लिए सबसे अच्छे सुरक्षा उपाय क्या हैं?',
      ],
    },
  },
  {
    id: 'legal',
    name: 'Legal & Regulatory',
    title: 'Indian Jurisprudence & Compliance',
    description: 'BNS/BNSS statutory interpretation, contract drafting, corporate compliance, labor laws, and IPR.',
    iconName: 'Scale',
    badge: 'Statutory Counsel',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    accentColor: '#4F46E5',
    samplePrompts: {
      en: [
        'What are the key changes under Bharatiya Nyaya Sanhita (BNS) for commercial fraud?',
        'Draft a standard Non-Disclosure Agreement (NDA) clause for Indian software vendors.',
        'Explain GST compliance rules for small export businesses under composite scheme.',
      ],
      hi: [
        'भारतीय न्याय संहिता (BNS) के तहत अनुबंध उल्लंघन के क्या नियम हैं?',
        'भारतीय स्टार्टअप्स के लिए गैर-प्रकटीकरण समझौता (NDA) कैसे तैयार करें?',
        'छोटे व्यवसाय के लिए जीएसटी इनपुट टैक्स क्रेडिट के जरूरी नियम क्या हैं?',
      ],
    },
  },
  {
    id: 'agriculture',
    name: 'Krishi & Agriculture',
    title: 'Agri-Advisory & Rural Innovation',
    description: 'Crop disease diagnosis, monsoon sowing, organic pest control, soil health, and e-NAM market rates.',
    iconName: 'Wheat',
    badge: 'Krishi Ratna',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300',
    accentColor: '#65A30D',
    samplePrompts: {
      en: [
        'Organic treatment methods for yellow stem borer pest in paddy crops.',
        'How to maintain optimal soil nitrogen balance after harvesting wheat?',
        'Steps to register and auction produce directly on the e-NAM portal.',
      ],
      hi: [
        'धान की फसल में कीट नियंत्रण के लिए प्राकृतिक और जैविक उपाय क्या हैं?',
        'गेहूं की कटाई के बाद मिट्टी की उर्वरता (NPK संतुलन) कैसे बनाए रखें?',
        'ई-नाम (e-NAM) पोर्टल पर किसान अपनी फसल का सर्वोत्तम मूल्य कैसे पा सकते हैं?',
      ],
    },
  },
  {
    id: 'business',
    name: 'Business & Finance',
    title: 'Corporate Strategy & Unit Economics',
    description: 'Startup pitch development, cash flow forecasts, GST filing strategy, and market expansion models.',
    iconName: 'TrendingUp',
    badge: 'Corporate Strategy',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    accentColor: '#0D9488',
    samplePrompts: {
      en: [
        'Calculate customer acquisition cost (CAC) vs Lifetime Value (LTV) for a SaaS model.',
        'Structure a seed funding pitch deck for an Indian B2B marketplace.',
        'What are effective working capital management tactics during inflationary cycles?',
      ],
      hi: [
        'भारतीय बाजार में नए स्टार्टअप के लिए यूनिट इकोनॉमिक्स और लाभ मार्जिन कैसे निकालें?',
        'एंजेल इन्वेस्टर्स को पिच करने के लिए प्रभावी प्रेजेंटेशन कैसे तैयार करें?',
        'कार्यशील पूंजी (Working Capital) को कुशलतापूर्वक प्रबंधित करने के टिप्स दें।',
      ],
    },
  },
  {
    id: 'education',
    name: 'Education & Exams',
    title: 'UPSC, JEE & Competitive Mentor',
    description: 'Structured conceptual mastery, high-yield revision summaries, and first-principles explanations.',
    iconName: 'GraduationCap',
    badge: 'Academic Mentor',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    accentColor: '#7C3AED',
    samplePrompts: {
      en: [
        'Explain Quantum Entanglement and Bell’s Inequality for an engineering student.',
        'Provide a 30-day revision timetable for UPSC GS-2 Governance and Constitution.',
        'Summarize the key events and landmark constitutional amendments in modern India.',
      ],
      hi: [
        'यूपीएससी परीक्षा के लिए भारतीय संविधान की मूल संरचना (Basic Structure) को समझाइए।',
        'प्रतियोगी परीक्षाओं के लिए कठिन वैज्ञानिक अवधारणाओं को याद रखने की तकनीकें क्या हैं?',
        'आधुनिक भारत के प्रमुख आर्थिक सुधारों (1991 के बाद) का संक्षिप्त विश्लेषण दें।',
      ],
    },
  },
];
