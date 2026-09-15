import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Flame, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { copyToClipboard } from '../utils/exportUtils';

export const BackendGuideModal: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'firebase' | 'supabase' | 'nontech'>('overview');

  const handleCopyCode = async (key: string, code: string) => {
    await copyToClipboard(code);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const firebaseSnippet = `// Free Firebase Firestore Schema for BharatConnect
// Setup at console.firebase.google.com (100% Free Spark Plan)
// 50,000 free reads/day, 20,000 free writes/day, 1GB storage

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User Consultation Vault
    match /users/{userId}/consultations/{consultationId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Cross-Industry Feedback Logs
    match /feedback/{feedbackId} {
      allow create: if true; // Public demo testers can submit feedback
      allow read: if request.auth.token.admin == true;
    }
  }
}`;

  const supabaseSnippet = `-- Free Supabase PostgreSQL Schema for BharatConnect
-- Setup at database.new (500MB Database, 50,000 MAU free forever)

CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  domain TEXT NOT NULL,          -- 'medical', 'coding', 'legal', etc.
  language TEXT DEFAULT 'en',    -- 'hi', 'mr', 'bn', etc.
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  proactive_items JSONB,
  is_offline_cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) ensuring strict user privacy
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own consultations"
  ON public.consultations FOR ALL
  USING (auth.uid() = user_id);`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Server className="w-5 h-5 text-purple-600" />
          <h1 className="text-lg font-bold text-slate-900">
            Free-Tier Backend & Admin Architecture Guide
          </h1>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          How Orion Technologies can launch and scale BharatConnect at <strong>$0 cost</strong> using generous free tiers from Firebase or Supabase without external funding.
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Executive Overview
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'firebase' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Firebase (Google)</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase (PostgreSQL)</span>
          </button>
          <button
            onClick={() => setActiveTab('nontech')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'nontech' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Simple Non-Technical Explanation
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Firebase Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Google Firebase</h3>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        100% Free Spark Plan
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">₹0 / month</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 my-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>50,000 free reads</strong> & 20,000 free writes daily</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Built-in Offline SDK:</strong> Automatically caches data on mobile/desktop</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Free Auth:</strong> Google sign-in & Email authentication included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Visual Admin Console:</strong> Non-technical dashboard to view records</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  <strong>Best for:</strong> Real-time mobile sync & automatic offline caching without setup.
                </span>
              </div>
            </div>

            {/* Supabase Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Supabase (PostgreSQL)</h3>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        100% Free Forever Tier
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">₹0 / month</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 my-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>500MB relational database:</strong> Store over 250,000 query records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>50,000 monthly active users:</strong> Zero cost for authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Spreadsheet-like Table Editor:</strong> Super simple for non-tech admins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Auto-generated REST APIs:</strong> Instant connection with React</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  <strong>Best for:</strong> SQL relational analytics, complex queries, and Excel-like table views.
                </span>
              </div>
            </div>
          </div>

          {/* Orion Roadmap Recommendation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              💡 Orion Technologies Recommended Launch Strategy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Phase 1 (Now - Zero Funding Demo):</strong> Run BharatConnect with its current <strong>client-side AES-256 local encrypted storage</strong> and serverless Express router. Users can use all features offline, and nothing costs a rupee.<br />
              <strong>Phase 2 (1,000 - 50,000 Users):</strong> Connect to the <strong>Firebase Spark Plan</strong> or <strong>Supabase Free Plan</strong>. Both provide completely free authentication, encrypted cloud backup, and visual admin panels. You will not incur any hosting bills until you reach massive commercial scale!
            </p>
          </div>
        </div>
      )}

      {/* Tab: Firebase */}
      {activeTab === 'firebase' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Firebase Security Rules & Collection Schema
            </h3>
            <button
              onClick={() => handleCopyCode('firebase', firebaseSnippet)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              {copiedSection === 'firebase' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'firebase' ? 'Copied' : 'Copy Schema'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            {firebaseSnippet}
          </pre>
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>3-Minute Setup:</strong>
            <ol className="list-decimal list-inside mt-1.5 space-y-1">
              <li>Visit <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">console.firebase.google.com</a> and create a project named "BharatConnect".</li>
              <li>Under Build, click <strong>Firestore Database</strong> and choose "Start in test mode" or paste the rules above.</li>
              <li>Under Authentication, enable <strong>Email/Password</strong> and <strong>Google Sign-In</strong>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab: Supabase */}
      {activeTab === 'supabase' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Supabase SQL Table Schema & Row-Level Security
            </h3>
            <button
              onClick={() => handleCopyCode('supabase', supabaseSnippet)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              {copiedSection === 'supabase' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'supabase' ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            {supabaseSnippet}
          </pre>
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>3-Minute Setup:</strong>
            <ol className="list-decimal list-inside mt-1.5 space-y-1">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline">supabase.com</a> and sign up for free.</li>
              <li>Click <strong>New Project</strong> and select the Mumbai/India region (ap-south-1) for lowest latency.</li>
              <li>Open the <strong>SQL Editor</strong> in the left sidebar, paste the code above, and click "Run".</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab: Non-Technical */}
      {activeTab === 'nontech' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900">
            For Non-Technical Users & Early Testers: What Does This Mean?
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">1. You don't need expensive servers or upfront funding</strong>
              <p>
                Both Google (Firebase) and Supabase provide free tiers that let you run this app for thousands of users without paying a single rupee. It is like having a digital filing cabinet hosted in the cloud for free.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">2. Admin Dashboard looks just like an Excel sheet</strong>
              <p>
                As an administrator or agency lead, you don't need to write code to check feedback or user analytics. Supabase and Firebase have graphical screens where you can view inquiries and export them to Excel with one click.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">3. Guaranteed Privacy & Security for Users</strong>
              <p>
                Because of the AES-256 encryption we programmed, only the individual user can see their confidential files and questions. Even if a doctor or lawyer consults the app about sensitive matters, their data stays locked and secure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
