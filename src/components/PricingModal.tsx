import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Users, 
  Building2, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  ThumbsUp,
  Star
} from 'lucide-react';

interface PricingModalProps {
  onStartDemo: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onStartDemo }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [profession, setProfession] = useState('Developer / Engineer');
  const [rating, setRating] = useState('5');
  const [comments, setComments] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('bharatconnect_demo_feedback') || '[]');
    stored.push({
      profession,
      rating,
      comments,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('bharatconnect_demo_feedback', JSON.stringify(stored));
    setFeedbackSubmitted(true);
  };

  return (
    <div className="space-y-10 py-2">
      {/* High-Converting Launch Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Limited-Time Zero Cost Launch Window
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Experience BharatConnect 100% Free
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            We are unlocking full access across India for early testers, medical practitioners, engineers, advocates, educators, and farmers. Test core workflows with zero friction.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartDemo}
              className="px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <span>Launch Live Expert Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium">
              No credit card required • Instant offline & voice access
            </span>
          </div>
        </div>
      </div>

      {/* Tiered Subscription Roadmap Grid */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-slate-900">
            Transparent Subscription Roadmap
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Capture early momentum today as free, with scalable pricing designed for individuals and enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Starter Launch Tier */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-6 flex flex-col justify-between shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
              Current Active Tier
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Early Adopter</h3>
              <p className="text-xs text-slate-500 mt-1">For professionals testing all domains.</p>
              
              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">₹0</span>
                <span className="text-xs text-slate-500 font-medium"> / free launch</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 7 Specialized AI Expert Personas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time voice speech input & audio TTS</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time document analysis (PDF, Excel, Word)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Client-side AES-256 Encrypted Local Vault</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full Offline Access & Local Intelligence</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onStartDemo}
              className="mt-6 w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Active Now — Use Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-2">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Coming Soon
              </div>
              <h3 className="text-base font-bold text-slate-900">BharatConnect Pro</h3>
              <p className="text-xs text-slate-500 mt-1">For power users requiring high volume.</p>
              
              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">₹799</span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Everything in Early Adopter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Priority GPU inference with zero queuing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Batch multi-file document indexing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Extended 10-language voice dialect tuning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cloud synchronization across unlimited devices</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="mt-6 w-full py-2.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              Planned Post-Launch
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mb-2">
                <Building2 className="w-3 h-3 text-purple-600" />
                Custom Deployments
              </div>
              <h3 className="text-base font-bold text-slate-900">Enterprise & Govt</h3>
              <p className="text-xs text-slate-500 mt-1">For hospitals, law firms, and institutions.</p>
              
              <div className="mt-4 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">Custom</span>
                <span className="text-xs text-slate-500 font-medium"> / tailored</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>On-premise air-gapped private model deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Custom fine-tuned legal/medical knowledge bases</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Dedicated SLA, compliance audits & role RBAC</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Direct developer integration support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => alert('Contact Orion Technologies (Shaikh M. Abrar) for custom enterprise trials.')}
              className="mt-6 w-full py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Inquire Enterprise Demo
            </button>
          </div>
        </div>
      </div>

      {/* Cross-Industry Professional Feedback & Friction Point Testing */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Cross-Industry Demo Testing Feedback
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Help Orion Technologies identify friction points and optimize workflows for your discipline.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <ThumbsUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">
                Thank you for your feedback!
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                Your notes have been recorded in the local developer telemetry store. Shaikh M. Abrar and the Orion Technologies team appreciate your collaboration.
              </p>
              <button
                onClick={() => setFeedbackSubmitted(false)}
                className="mt-4 px-3 py-1.5 text-xs font-semibold text-emerald-800 underline cursor-pointer"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Professional Field
                  </label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Doctor / Healthcare Specialist">Doctor / Healthcare Specialist</option>
                    <option value="Developer / Engineer">Software Engineer / Tech Lead</option>
                    <option value="Advocate / Legal Professional">Advocate / Legal Counsel</option>
                    <option value="Farmer / Agronomist">Farmer / Agri-Entrepreneur</option>
                    <option value="Business Owner / Founder">Business Owner / Founder</option>
                    <option value="Teacher / Academic Mentor">Teacher / Professor / Student</option>
                    <option value="Other">Other Industry Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Demo Experience Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5/5 - Instant & Highly Accurate</option>
                    <option value="4">⭐⭐⭐⭐ 4/5 - Very Good, minor suggestions</option>
                    <option value="3">⭐⭐⭐ 3/5 - Satisfactory</option>
                    <option value="2">⭐⭐ 2/5 - Needs Workflow Tuning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Friction Points or Feature Requests
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us where you experienced friction or what domain-specific features you'd like Orion Technologies to add..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Submit Demo Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
