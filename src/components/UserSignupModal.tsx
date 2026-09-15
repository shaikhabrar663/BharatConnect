import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Building, 
  Briefcase, 
  Globe2, 
  Phone, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react';
import { UserRecord, UserSignupData, ExpertDomainId, LanguageCode } from '../types';
import { EXPERT_PROFILES } from '../data/expertDomains';
import { LANGUAGES } from '../data/languages';

interface UserSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered: (user: UserRecord) => void;
  currentUser: UserRecord | null;
}

const PROFESSIONS = [
  'Senior Medical Consultant / Physician',
  'Advocate & Legal Counsel',
  'Chief Technology Officer / Architect',
  'Software Engineer & Developer',
  'Agronomist / Agriculture Specialist',
  'Startup Founder & Executive',
  'Financial Analyst / CA',
  'Research Scholar / Academician',
  'Civil Services Aspirant / Officer',
  'Independent Professional'
];

export const UserSignupModal: React.FC<UserSignupModalProps> = ({
  isOpen,
  onClose,
  onUserRegistered,
  currentUser
}) => {
  const [formData, setFormData] = useState<UserSignupData>({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    organization: currentUser?.organization || '',
    profession: currentUser?.profession || PROFESSIONS[0],
    primaryDomain: currentUser?.primaryDomain || 'general',
    language: currentUser?.language || 'en',
    phone: currentUser?.phone || '',
    purpose: currentUser?.purpose || 'Enterprise Strategic Synthesis & Decision Intelligence'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage('Please provide your full legal or professional name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid business or personal email address.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage('Please confirm local disk telemetry and zero-leakage storage terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        throw new Error(data.error || 'Failed to complete registration.');
      }

      // Persist active user locally in browser
      localStorage.setItem('bharatconnect_active_user_v1', JSON.stringify(data.user));
      setSuccessMessage(`Welcome, ${data.user.fullName}! Your profile has been logged on the local machine disk vault.`);
      onUserRegistered(data.user);

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 text-slate-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{currentUser ? 'Update BharatConnectAI Profile' : 'Register for BharatConnectAI'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Local Vault
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Secure local machine telemetry and user registry by Orion Technologies
                </p>
              </div>
            </div>
            <button
              id="close-signup-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="signup-fullname-input"
                  type="text"
                  required
                  placeholder="e.g. Shaikh M. Abrar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work / Professional Email <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  placeholder="e.g. shaikh@oriontech.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organization / Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organization / Institution
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="signup-organization-input"
                  type="text"
                  placeholder="e.g. Orion Technologies / AIIMS"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Profession / Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designation / Role
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  id="signup-profession-select"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {PROFESSIONS.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Domain Interest */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Domain Focus
              </label>
              <div className="relative">
                <Target className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  id="signup-domain-select"
                  value={formData.primaryDomain}
                  onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value as ExpertDomainId })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {EXPERT_PROFILES.map((dp) => (
                    <option key={dp.id} value={dp.id}>
                      {dp.name} ({dp.badge})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Vernacular Language
              </label>
              <div className="relative">
                <Globe2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  id="signup-language-select"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as LanguageCode })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile / Contact Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="signup-phone-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Strategic Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Use-Case / Objective
              </label>
              <input
                id="signup-purpose-input"
                type="text"
                placeholder="e.g. Commercial risk assessment"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Privacy & Zero-Knowledge terms */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id="signup-terms-checkbox"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the <strong className="text-slate-800">BharatConnect Strategic Synthesis Protocol</strong>. 
                Data is stored directly on disk with local zero-knowledge privacy and will appear in the internal admin registry for audit review.
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Local Disk Vault (Zero-Leakage)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-signup-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-900 active:scale-98 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>{currentUser ? 'Save Changes' : 'Complete Signup'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
