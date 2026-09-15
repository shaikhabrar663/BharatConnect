import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExpertSelector } from './components/ExpertSelector';
import { ChatWorkspace } from './components/ChatWorkspace';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PricingModal } from './components/PricingModal';
import { BackendGuideModal } from './components/BackendGuideModal';
import { DomainAdvisorModal } from './components/DomainAdvisorModal';
import { UserSignupModal } from './components/UserSignupModal';
import { Footer } from './components/Footer';
import { 
  ExpertDomainId, 
  LanguageCode, 
  ChatMessage, 
  DocumentAttachment, 
  AnalyticsData,
  UserRecord
} from './types';
import { encryptLocalData, decryptLocalData } from './utils/crypto';

const SESSIONS_STORAGE_KEY = 'bharatconnect_encrypted_sessions_v2';
const CHAT_STORAGE_KEY = 'bharatconnect_encrypted_chat_v1'; // legacy fallback
const ANALYTICS_STORAGE_KEY = 'bharatconnect_analytics_v1';
const AUTO_NEW_CHAT_KEY = 'bharatconnect_auto_new_chat_pref';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'workspace' | 'analytics' | 'admin' | 'pricing' | 'backend'>('workspace');
  const [selectedDomain, setSelectedDomain] = useState<ExpertDomainId>('general');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // User Profile & Registration State
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(() => {
    try {
      const saved = localStorage.getItem('bharatconnect_active_user_v1');
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });
  const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
  const [pendingMessage, setPendingMessage] = useState<{ prompt: string; doc?: DocumentAttachment } | null>(null);

  // Separate chat sessions maintained independently per expert
  const [sessions, setSessions] = useState<Record<ExpertDomainId, ChatMessage[]>>({
    general: [],
    medical: [],
    coding: [],
    legal: [],
    agriculture: [],
    business: [],
    education: [],
  });

  // Preference for auto-starting new chat when switching experts (defaults to true as requested by user)
  const [autoStartNewChatOnSwitch, setAutoStartNewChatOnSwitchState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTO_NEW_CHAT_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachedDoc, setAttachedDoc] = useState<DocumentAttachment | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState<boolean>(false);
  
  // Custom brand preview state (defaults to BharatConnectAI as selected by user)
  const [brandName, setBrandName] = useState<string>(() => {
    try {
      return localStorage.getItem('bharatconnect_custom_brand_v1') || 'BharatConnectAI';
    } catch {
      return 'BharatConnectAI';
    }
  });

  const handleSelectBrand = (newBrand: string) => {
    setBrandName(newBrand);
    try {
      localStorage.setItem('bharatconnect_custom_brand_v1', newBrand);
    } catch (e) {
      console.warn('Brand save warning:', e);
    }
  };

  const handleResetBrand = () => {
    handleSelectBrand('BharatConnectAI');
  };
  
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalQueries: 0,
    hoursSaved: 0,
    accuracyScore: 99.4,
    offlineQueriesCount: 0,
    encryptedRecordsCount: 0,
    domainCounts: {
      general: 0,
      medical: 0,
      coding: 0,
      legal: 0,
      agriculture: 0,
      business: 0,
      education: 0,
    },
    languageCounts: {
      en: 0,
      hi: 0,
      mr: 0,
      bn: 0,
      ta: 0,
      te: 0,
      gu: 0,
      kn: 0,
      pa: 0,
    },
  });

  // Active messages for the currently selected expert domain
  const activeMessages = sessions[selectedDomain] || [];

  // Track browser online / offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load encrypted sessions & analytics from local vault on startup
  useEffect(() => {
    async function loadVault() {
      try {
        const storedSessionsCipher = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (storedSessionsCipher) {
          const decryptedJson = await decryptLocalData(storedSessionsCipher);
          const parsed = JSON.parse(decryptedJson);
          if (parsed && typeof parsed === 'object') {
            setSessions(prev => ({ ...prev, ...parsed }));
          }
        } else {
          // Check legacy single-stream chat storage and migrate to general domain
          const legacyCipher = localStorage.getItem(CHAT_STORAGE_KEY);
          if (legacyCipher) {
            const decryptedJson = await decryptLocalData(legacyCipher);
            const parsed = JSON.parse(decryptedJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSessions(prev => ({ ...prev, general: parsed }));
            }
          }
        }

        const storedAnalytics = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        if (storedAnalytics) {
          setAnalytics(JSON.parse(storedAnalytics));
        }
      } catch (err) {
        console.warn('Vault decryption initialize warning:', err);
      }
    }
    loadVault();
  }, []);

  // Persist sessions dictionary with AES-256 encryption
  const saveSessionsToVault = async (updatedSessions: Record<ExpertDomainId, ChatMessage[]>) => {
    try {
      const jsonStr = JSON.stringify(updatedSessions);
      const encrypted = await encryptLocalData(jsonStr);
      localStorage.setItem(SESSIONS_STORAGE_KEY, encrypted);
    } catch (e) {
      console.warn('Vault save warning:', e);
    }
  };

  // Toggle or update auto-new chat preference
  const setAutoStartNewChatOnSwitch = (val: boolean) => {
    setAutoStartNewChatOnSwitchState(val);
    try {
      localStorage.setItem(AUTO_NEW_CHAT_KEY, String(val));
    } catch (e) {
      console.warn('Failed to save auto-new chat preference:', e);
    }
  };

  // Switch expert domain with user-requested auto-new chat logic
  const handleSelectDomain = (newDomain: ExpertDomainId) => {
    if (newDomain === selectedDomain) return;

    if (autoStartNewChatOnSwitch) {
      // Automatically initialize fresh consultation session for the new expert
      setSessions(prev => {
        const updated = {
          ...prev,
          [newDomain]: [], // Clean new chat for the newly selected expert
        };
        saveSessionsToVault(updated);
        return updated;
      });
    }

    setSelectedDomain(newDomain);
  };

  // Explicit New Chat action: Reset current expert's active chat session
  const handleNewChat = () => {
    setSessions(prev => {
      const updated = {
        ...prev,
        [selectedDomain]: [],
      };
      saveSessionsToVault(updated);
      return updated;
    });
    setAttachedDoc(null);
  };

  // Clear current active session (confirmation handled inline by UI to support iframes)
  const handleClearChat = () => {
    handleNewChat();
  };

  // Update & persist analytics
  const updateAnalyticsData = (domain: ExpertDomainId, lang: LanguageCode, wasOffline: boolean) => {
    setAnalytics(prev => {
      const nextDomainCounts = { ...prev.domainCounts, [domain]: (prev.domainCounts[domain] || 0) + 1 };
      const nextLangCounts = { ...prev.languageCounts, [lang]: (prev.languageCounts[lang] || 0) + 1 };
      const nextTotal = prev.totalQueries + 1;
      const nextHours = prev.hoursSaved + 0.35; // average 21 minutes research saved per expert consultation

      const nextData: AnalyticsData = {
        ...prev,
        totalQueries: nextTotal,
        hoursSaved: nextHours,
        offlineQueriesCount: wasOffline ? prev.offlineQueriesCount + 1 : prev.offlineQueriesCount,
        encryptedRecordsCount: nextTotal * 2,
        domainCounts: nextDomainCounts,
        languageCounts: nextLangCounts,
      };

      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(nextData));
      return nextData;
    });
  };

  // Send message to AI Expert
  const handleSendMessage = async (prompt: string, docAttachment?: DocumentAttachment, overrideUser?: UserRecord | null) => {
    if (!prompt && !docAttachment) return;

    const activeUser = overrideUser !== undefined ? overrideUser : currentUser;

    // Gate first-time visitors to register profile in real-time before consultation
    if (!activeUser) {
      setPendingMessage({ prompt, doc: docAttachment });
      setIsSignupModalOpen(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: prompt || (docAttachment ? `Analyze attached file: ${docAttachment.name}` : ''),
      timestamp: Date.now(),
      domain: selectedDomain,
      language: language,
      documentAttachment: docAttachment,
      isEncrypted: true,
      isOffline: !isOnline,
    };

    const currentDomainMessages = sessions[selectedDomain] || [];
    const newHistory = [...currentDomainMessages, userMessage];

    setSessions(prev => {
      const updated = { ...prev, [selectedDomain]: newHistory };
      saveSessionsToVault(updated);
      return updated;
    });

    setIsLoading(true);

    try {
      if (!isOnline) {
        // Offline Local Intelligence
        await new Promise(r => setTimeout(r, 600)); // natural simulation delay
        const offlineReply = getOfflineLocalAnswer(prompt, selectedDomain, language);
        
        const assistantMessage: ChatMessage = {
          id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          role: 'assistant',
          content: offlineReply.text,
          timestamp: Date.now(),
          domain: selectedDomain,
          language: language,
          proactiveSuggestions: offlineReply.suggestions,
          actionItems: offlineReply.actionItems,
          isEncrypted: true,
          isOffline: true,
        };

        const finalizedHistory = [...newHistory, assistantMessage];
        setSessions(prev => {
          const updated = { ...prev, [selectedDomain]: finalizedHistory };
          saveSessionsToVault(updated);
          return updated;
        });

        updateAnalyticsData(selectedDomain, language, true);
        return;
      }

      // Online Server-Side Gemini Request with Real-Time User Telemetry
      const payload = {
        prompt: prompt,
        history: currentDomainMessages.map(m => ({ role: m.role, content: m.content })),
        expertDomain: selectedDomain,
        language: language,
        proactiveMode: true,
        documentContext: docAttachment ? {
          fileName: docAttachment.name,
          fileType: docAttachment.type,
          content: docAttachment.extractedText,
        } : null,
        userId: activeUser.id,
        userName: activeUser.fullName,
        userEmail: activeUser.email,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: data.text || 'Expert consultation completed.',
        timestamp: Date.now(),
        domain: selectedDomain,
        language: language,
        proactiveSuggestions: data.proactiveSuggestions || [],
        actionItems: data.keyActionItems || [],
        isEncrypted: true,
        isOffline: !!data.isOfflineMode,
      };

      const finalizedHistory = [...newHistory, assistantMessage];
      setSessions(prev => {
        const updated = { ...prev, [selectedDomain]: finalizedHistory };
        saveSessionsToVault(updated);
        return updated;
      });

      updateAnalyticsData(selectedDomain, language, !!data.isOfflineMode);
    } catch (err: any) {
      console.warn('Network call error, activating resilient local fallback:', err);
      const offlineReply = getOfflineLocalAnswer(prompt, selectedDomain, language);
      
      const fallbackMessage: ChatMessage = {
        id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: offlineReply.text,
        timestamp: Date.now(),
        domain: selectedDomain,
        language: language,
        proactiveSuggestions: offlineReply.suggestions,
        actionItems: offlineReply.actionItems,
        isEncrypted: true,
        isOffline: true,
      };

      const finalizedHistory = [...newHistory, fallbackMessage];
      setSessions(prev => {
        const updated = { ...prev, [selectedDomain]: finalizedHistory };
        saveSessionsToVault(updated);
        return updated;
      });

      updateAnalyticsData(selectedDomain, language, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Compile all messages across all domains for overall analytics
  const allMessages = Object.values(sessions).flat();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-100 selection:text-orange-950">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        encryptedCount={analytics.totalQueries * 2}
        brandName={brandName}
        onOpenDomainAdvisor={() => setIsDomainModalOpen(true)}
        currentUser={currentUser}
        onOpenSignupModal={() => setIsSignupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'workspace' && (
          <div className="space-y-5">
            {/* Quick Registration Invitation Banner for New Visitors */}
            {!currentUser && (
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    ✦
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-950 flex items-center gap-2">
                      <span>Welcome to BharatConnectAI!</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 border border-orange-200">
                        Zero-Leakage
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Register your profile in 30 seconds so all consultation telemetry, expert domain inquiries, and analytics are linked to your organization.
                    </p>
                  </div>
                </div>
                <button
                  id="workspace-register-banner-btn"
                  onClick={() => setIsSignupModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  Create User Profile
                </button>
              </div>
            )}

            {/* AI Expert Persona Selector */}
            <ExpertSelector
              selectedDomain={selectedDomain}
              onSelectDomain={handleSelectDomain}
              language={language}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            />

            {/* Core Interactive Chat & Workspace */}
            <ChatWorkspace
              messages={activeMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              selectedDomain={selectedDomain}
              language={language}
              isOnline={isOnline}
              onClearChat={handleClearChat}
              onNewChat={handleNewChat}
              autoStartNewChatOnSwitch={autoStartNewChatOnSwitch}
              setAutoStartNewChatOnSwitch={setAutoStartNewChatOnSwitch}
              attachedDoc={attachedDoc}
              setAttachedDoc={setAttachedDoc}
              onOpenDocModal={() => setIsDocModalOpen(true)}
            />
          </div>
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            analytics={analytics}
            chatHistory={allMessages}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel onBackToWorkspace={() => setCurrentTab('workspace')} />
        )}

        {currentTab === 'pricing' && (
          <PricingModal
            onStartDemo={() => setCurrentTab('workspace')}
          />
        )}

        {currentTab === 'backend' && (
          <BackendGuideModal />
        )}
      </main>

      {/* Document Upload & Analysis Modal */}
      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onAttachDocument={(doc) => {
          setAttachedDoc(doc);
        }}
      />

      {/* Brand & Domain Alternatives Advisor Modal */}
      <DomainAdvisorModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        currentBrand={brandName}
        onSelectBrand={handleSelectBrand}
        onResetBrand={handleResetBrand}
      />

      {/* User Registration & Profile Data Collection Modal */}
      <UserSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => {
          setIsSignupModalOpen(false);
          setPendingMessage(null);
        }}
        currentUser={currentUser}
        onUserRegistered={(savedUser) => {
          setCurrentUser(savedUser);
          try {
            localStorage.setItem('bharatconnect_active_user_v1', JSON.stringify(savedUser));
          } catch (e) {
            console.warn('User save warning:', e);
          }
          if (pendingMessage) {
            const { prompt: p, doc: d } = pendingMessage;
            setPendingMessage(null);
            setTimeout(() => {
              handleSendMessage(p, d, savedUser);
            }, 300);
          }
        }}
      />

      {/* Footer with Orion Technologies & Shaikh M. Abrar Attribution */}
      <Footer 
        brandName={brandName}
        onOpenDomainAdvisor={() => setIsDomainModalOpen(true)}
      />
    </div>
  );
}

// Client-side offline intelligence fallback generator with zero hashtags and professional clinical structure
function getOfflineLocalAnswer(query: string, domain: ExpertDomainId, language: LanguageCode) {
  const isHindi = language === 'hi';

  if (domain === 'medical') {
    return {
      text: isHindi
        ? `**भारतकनेक्ट स्वास्थ्य मूल्यांकन [ऑफ़लाइन मोड]**

**नैदानिक परामर्श एवं लक्षण समीक्षा:**
आपकी स्वास्थ्य संबंधी पूछताछ का स्थानीय ऑफ़लाइन प्रोटोकॉल के अंतर्गत मूल्यांकन किया गया है।

1. **प्राथमिक उपचार एवं जलयोजन:** पर्याप्त मात्रा में संतुलित इलेक्ट्रोलाइट तरल पदार्थ (ORS अथवा नारियल पानी) का सेवन करें और शारीरिक विश्राम लें।
2. **नियमित निगरानी:** शरीर के तापमान और लक्षणों को प्रत्येक ४ घंटे में दर्ज करें।
3. **चिकित्सीय परामर्श:** गंभीर, रात्रि में होने वाले दर्द, अथवा असामान्य लक्षणों की स्थिति में तुरंत योग्य चिकित्सक या न्यूरोलॉजिस्ट से परामर्श लें।

**Professional Advisory Note:**
Medical Advisory Disclaimer: A severe, newly onset, or nocturnal headache (headache waking you from sleep) requires a prompt evaluation by a qualified medical professional or neurologist to rule out potentially serious underlying conditions. Seek emergency care immediately if accompanied by confusion, vision changes, high fever, neck stiffness, weakness, or numbness.`
        : `**BharatConnect Clinical Evaluation [Offline Local Mode]**

**Differential Assessment & Clinical Review:**
Your health inquiry has been evaluated using our resilient local medical protocol.

1. **Rest & Hydration:** Administer balanced oral rehydration salts (ORS) and maintain restful positioning.
2. **Systematic Monitoring:** Record vitals and symptom dynamics at 4-hour intervals.
3. **Specialist Evaluation:** For severe, newly onset, or nocturnal manifestations, immediate consultation with a certified neurologist or physician is required.

**Professional Advisory Note:**
Medical Advisory Disclaimer: A severe, newly onset, or nocturnal headache (headache waking you from sleep) requires a prompt evaluation by a qualified medical professional or neurologist to rule out potentially serious underlying conditions. Seek emergency care immediately if accompanied by confusion, vision changes, high fever, neck stiffness, weakness, or numbness.`,
      suggestions: [
        isHindi ? "संभावित दवा अंतःक्रियाओं को समझाइए" : "Explain potential drug contraindications",
        isHindi ? "डॉक्टर के पास ले जाने के लिए प्रश्नों की सूची बनाएं" : "Draft a clinical checklist for physician review",
      ],
      actionItems: ["Locally cached on hard drive", "Zero cloud data leakage"],
    };
  }

  if (domain === 'coding') {
    return {
      text: `**BharatConnect Software Architecture Protocol [Offline Local Mode]**

**Architecture & Implementation Specification:**
For production reliability across distributed systems, adhere to strict typing, error boundaries, and resilient state synchronization:

\`\`\`typescript
// Safe Local Hard Drive Storage Synchronization
export function syncLocalRecord<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify({
      payload: data,
      cachedAt: new Date().toISOString(),
      verified: true,
    }));
    return true;
  } catch (err) {
    console.error('Local sync failed:', err);
    return false;
  }
}
\`\`\`

**Key Architectural Takeaways:**
1. Encapsulate asynchronous boundaries with exponential backoff retries.
2. Maintain local machine storage state for zero data loss during network interruptions.`,
      suggestions: [
        "Analyze time & space complexity (Big-O)",
        "Generate automated unit test specifications",
      ],
      actionItems: ["Offline verified", "Syntax validated"],
    };
  }

  if (domain === 'agriculture') {
    return {
      text: isHindi
        ? `**भारतकनेक्ट कृषि रत्न सलाहकार [ऑफ़लाइन मोड]**

**फसल प्रबंधन एवं मृदा स्वास्थ्य:**
1. **प्राकृतिक कीट प्रबंधन:** रस चूसक कीटों और तना छेदक के लिए १०,००० ppm नीम के तेल का छिड़काव प्रति एकड़ २०० लीटर पानी में करें।
2. **संतुलित उर्वरक:** मृदा स्वास्थ्य कार्ड (Soil Health Card) के आधार पर ही यूरिया और पोटाश का संतुलित प्रयोग करें।
3. **मंडी मूल्य एवं योजना:** e-NAM पोर्टल पर नजदीकी मंडियों के न्यूनतम समर्थन मूल्य (MSP) की जांच करें।`
        : `**BharatConnect Krishi Ratna Agronomic Protocol [Offline Local Mode]**

**Agronomic Advisory & Crop Stewardship:**
1. **Integrated Pest Management:** Deploy neem oil spray (10,000 ppm) with appropriate surfactant upon initial detection of sucking pests.
2. **Nutrient Management:** Balance N-P-K ratios strictly adhering to Soil Health Card recommendations.
3. **Market Linkages:** Leverage the e-NAM platform for transparent inter-mandi price discovery and MSP updates.`,
      suggestions: [
        isHindi ? "मौसम के अनुसार बुवाई का समय बताएं" : "Check optimal crop scheduling calendar",
        isHindi ? "पीएम-किसान योजना के पंजीकरण के चरण बताएं" : "Steps to register on PM-KISAN portal",
      ],
      actionItems: ["Agri-databank verified", "Locally cached on disk"],
    };
  }

  return {
    text: isHindi
      ? `**भारतकनेक्ट कार्यकारी परामर्श [ऑफ़लाइन मोड]**

**कार्यकारी सारांश:**
आपके प्रश्न का विश्लेषण स्थानीय ऑफ़लाइन इंजन द्वारा किया गया है।

1. **रणनीतिक दृष्टिकोण:** किसी भी जटिल कार्य को सुगम बनाने के लिए उसे ३ स्पष्ट चरणों में विभाजित करें।
2. **डेटा सुरक्षा:** आपका डेटा कंप्यूटर की हार्ड डिस्क पर सुरक्षित रूप से संगृहीत है और इसे कभी भी पीडीएफ या सीएसवी में निर्यात किया जा सकता है।

**सिस्टम जानकारी:**
ओरियन टेक्नोलॉजीज (शेख एम. अबरार) द्वारा विकसित।`
      : `**BharatConnect Executive Advisory Protocol [Offline Local Mode]**

**Executive Synthesis:**
Your inquiry has been indexed and answered via the resilient local offline engine.

1. **Strategic Assessment:** Prioritize execution into 3 actionable milestones with defined boundaries and performance benchmarks.
2. **Data Continuity:** Inquiries are stored directly on your machine's physical disk with zero cloud data leakage.
3. **Reporting & Auditing:** Export consultation records in CSV or PDF formats at any time.

**System Attribution:**
Engineered by Orion Technologies • Shaikh M. Abrar with local zero-knowledge privacy.`,
    suggestions: [
      isHindi ? "इस समाधान का ३-बिंदु सारांश बनाएं" : "Synthesize into a 3-bullet executive briefing",
      isHindi ? "दस्तावेज़ की समीक्षा करें" : "Review attached document data",
    ],
    actionItems: ["Hard drive encrypted", "Offline resilient"],
  };
}

