import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Check, 
  RotateCcw,
  ShieldCheck,
  Star,
  Layers,
  Building,
  Languages,
  Zap,
  Bookmark
} from 'lucide-react';

export interface DomainAlternative {
  name: string;
  splitPrefix: string;
  splitSuffix: string;
  tagline: string;
  recommendedExtensions: string[];
  category: 'top-pick' | 'orion-synergy' | 'cultural' | 'tech-forward';
  whyItWorks: string;
  availabilityLikelihood: 'Very High (Unique)' | 'High' | 'Check Variations';
  vibe: string;
}

export const DOMAIN_ALTERNATIVES: DomainAlternative[] = [
  {
    name: 'BharatPulse',
    splitPrefix: 'Bharat',
    splitSuffix: 'Pulse',
    tagline: 'Real-time Vital Intelligence for India',
    recommendedExtensions: ['.ai', '.in', '.tech', '.co.in'],
    category: 'top-pick',
    whyItWorks: 'Dynamic, modern, and conveys an alive, real-time national intelligence network.',
    availabilityLikelihood: 'High',
    vibe: 'Modern, Energetic & National',
  },
  {
    name: 'OrionBharat',
    splitPrefix: 'Orion',
    splitSuffix: 'Bharat',
    tagline: 'Orion Technologies National AI Engine',
    recommendedExtensions: ['.ai', '.in', '.com', '.tech'],
    category: 'orion-synergy',
    whyItWorks: 'Directly ties your parent brand (Orion Technologies) with Bharat. Proprietary branding means almost 100% domain availability across .com, .in, and .ai.',
    availabilityLikelihood: 'Very High (Unique)',
    vibe: 'Elite, Enterprise & Direct Company Brand',
  },
  {
    name: 'BharatIntel',
    splitPrefix: 'Bharat',
    splitSuffix: 'Intel',
    tagline: 'Autonomous Multi-Discipline Intelligence',
    recommendedExtensions: ['.ai', '.in', '.io', '.co.in'],
    category: 'tech-forward',
    whyItWorks: 'Crisp, professional, enterprise-grade. Positioned as high-accuracy intelligence.',
    availabilityLikelihood: 'High',
    vibe: 'Authoritative, Corporate & Analytical',
  },
  {
    name: 'BharatSetu',
    splitPrefix: 'Bharat',
    splitSuffix: 'Setu',
    tagline: 'The AI Bridge for Indian Citizens & Enterprise',
    recommendedExtensions: ['.ai', '.in', '.tech', '.co.in'],
    category: 'cultural',
    whyItWorks: '"Setu" signifies bridge. Connects 10+ regional languages, rural agriculture, healthcare, and technology under one intuitive bridge.',
    availabilityLikelihood: 'High',
    vibe: 'Culturally Resonant, Inclusive & Trusted',
  },
  {
    name: 'BharatNexus',
    splitPrefix: 'Bharat',
    splitSuffix: 'Nexus',
    tagline: 'Convergent Multi-Domain Intelligence Node',
    recommendedExtensions: ['.ai', '.in', '.io'],
    category: 'tech-forward',
    whyItWorks: '"Nexus" represents a central hub where medicine, law, agriculture, code, and finance intersect.',
    availabilityLikelihood: 'High',
    vibe: 'Futuristic, High-Tech & Frontier',
  },
  {
    name: 'BharatBrain',
    splitPrefix: 'Bharat',
    splitSuffix: 'Brain',
    tagline: 'Cognitive Indian AI Companion',
    recommendedExtensions: ['.in', '.tech', '.ai', '.org'],
    category: 'top-pick',
    whyItWorks: 'Extremely catchy, single-syllable punch, instantaneous brand recall among students and professionals.',
    availabilityLikelihood: 'High',
    vibe: 'Catchy, Cognitive & Mass-Market',
  },
  {
    name: 'IndicMind',
    splitPrefix: 'Indic',
    splitSuffix: 'Mind',
    tagline: 'Multilingual Vernacular Cognitive Network',
    recommendedExtensions: ['.ai', '.in', '.co'],
    category: 'cultural',
    whyItWorks: 'Puts multilingual fluency front and center. Perfect for expanding across all 22 official Indian languages.',
    availabilityLikelihood: 'High',
    vibe: 'Linguistic, Deep & Inclusive',
  },
  {
    name: 'OrionSetu',
    splitPrefix: 'Orion',
    splitSuffix: 'Setu',
    tagline: 'Bridging Frontier AI to Every Indian Citizen',
    recommendedExtensions: ['.ai', '.in', '.com'],
    category: 'orion-synergy',
    whyItWorks: 'Distinctive fusion of Orion Technologies with Indian bridging heritage. Guaranteed domain availability.',
    availabilityLikelihood: 'Very High (Unique)',
    vibe: 'Distinctive, Sophisticated & Meaningful',
  },
  {
    name: 'PrajnaBharat',
    splitPrefix: 'Prajna',
    splitSuffix: 'Bharat',
    tagline: 'Deep Wisdom & Cognitive AI for Bharat',
    recommendedExtensions: ['.ai', '.in', '.tech'],
    category: 'cultural',
    whyItWorks: '"Prajna" represents the highest transcendent knowledge and intellect in ancient Indian philosophy.',
    availabilityLikelihood: 'Very High (Unique)',
    vibe: 'Profound, Respected & Intellectual',
  },
];

interface DomainAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBrand: string;
  onSelectBrand: (brandName: string) => void;
  onResetBrand: () => void;
}

export const DomainAdvisorModal: React.FC<DomainAdvisorModalProps> = ({
  isOpen,
  onClose,
  currentBrand,
  onSelectBrand,
  onResetBrand,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'top-pick' | 'orion-synergy' | 'cultural' | 'tech-forward'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAlternatives = DOMAIN_ALTERNATIVES.filter(alt => {
    const matchesFilter = selectedFilter === 'all' || alt.category === selectedFilter;
    const matchesSearch = alt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alt.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alt.whyItWorks.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const getRegistrarUrl = (domainName: string, registrar: 'godaddy' | 'namecheap' | 'dynadot') => {
    const query = encodeURIComponent(domainName);
    switch (registrar) {
      case 'godaddy':
        return `https://in.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${query}`;
      case 'namecheap':
        return `https://www.namecheap.com/domains/registration/results/?domain=${query}`;
      case 'dynadot':
        return `https://www.dynadot.com/domain/search.html?domain=${query}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Brand & Domain Alternatives Advisor
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-500 text-slate-950">
                  Orion Technologies
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Since <strong>bharatconnect</strong> is unavailable, explore these top curated brand identities.
                You can live-preview any name across the app with 1 click, copy recommended domain handles, and check registrar availability.
              </p>
            </div>
          </div>

          <button
            id="close-domain-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Live Status Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Suggestions ({DOMAIN_ALTERNATIVES.length})
            </button>
            <button
              onClick={() => setSelectedFilter('top-pick')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedFilter === 'top-pick'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>Top Picks</span>
            </button>
            <button
              onClick={() => setSelectedFilter('orion-synergy')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedFilter === 'orion-synergy'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building className="w-3 h-3" />
              <span>Orion Synergy (Unique)</span>
            </button>
            <button
              onClick={() => setSelectedFilter('cultural')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedFilter === 'cultural'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Languages className="w-3 h-3" />
              <span>Cultural & Vernacular</span>
            </button>
            <button
              onClick={() => setSelectedFilter('tech-forward')}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedFilter === 'tech-forward'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Tech-Forward</span>
            </button>
          </div>

          {/* Current Active Brand Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Active Brand:</span>
            <span className="font-bold text-slate-900 bg-white border border-slate-300 px-2.5 py-0.5 rounded-md shadow-2xs">
              {currentBrand}
            </span>
            {currentBrand !== 'BharatConnect' && (
              <button
                onClick={onResetBrand}
                className="text-orange-600 hover:text-orange-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Reset back to default BharatConnect"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Suggestions List Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/50">
          
          {/* Strategic Domain Extension Guidance Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Strategic TLD Extension Advice for Orion Technologies
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>.ai</strong> is the global benchmark for AI platforms (like OpenAI, Mistral). For India-first trust, pair it with <strong>.in</strong> or <strong>.co.in</strong> (approx ₹499/year on GoDaddy/INRegistry). For enterprise B2B, a proprietary name like <strong>OrionBharat.com</strong> guarantees instant registration.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlternatives.map((alt) => {
              const isCurrent = currentBrand === alt.name;

              return (
                <div
                  key={alt.name}
                  className={`bg-white rounded-xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Brand & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                            {alt.splitPrefix}
                            <span className="text-orange-600">{alt.splitSuffix}</span>
                          </h3>
                          {alt.category === 'orion-synergy' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              GUARANTEED AVAILABLE
                            </span>
                          )}
                          {alt.category === 'top-pick' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {alt.tagline}
                        </p>
                      </div>

                      {/* Live Preview Button */}
                      <button
                        onClick={() => onSelectBrand(alt.name)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                        title="Live preview this brand in the application"
                      >
                        {isCurrent ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span>Preview</span>
                        )}
                      </button>
                    </div>

                    {/* Why It Works Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {alt.whyItWorks}
                    </p>

                    {/* Vibe & Availability */}
                    <div className="flex items-center gap-2 text-[11px] mb-3">
                      <span className="text-slate-400">Tone:</span>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {alt.vibe}
                      </span>
                    </div>

                    {/* Recommended Domain Extensions */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Domain Candidates:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {alt.recommendedExtensions.map(ext => {
                          const domainString = `${alt.name.toLowerCase()}${ext}`;
                          const isCopied = copiedDomain === domainString;

                          return (
                            <div
                              key={ext}
                              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800 transition-colors"
                            >
                              <span>{domainString}</span>
                              <button
                                onClick={() => handleCopyDomain(domainString)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copy domain to clipboard"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Bookmark className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Registrar Check Links */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Verify Live:</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={getRegistrarUrl(alt.name.toLowerCase(), 'godaddy')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span>GoDaddy (.in)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-slate-300">•</span>
                      <a
                        href={getRegistrarUrl(alt.name.toLowerCase(), 'namecheap')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-800 hover:underline"
                      >
                        <span>Namecheap (.ai)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Domain Search Field */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              Check Any Custom Name on Registrars
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Type your own idea below to quickly check availability on GoDaddy India or Namecheap:
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. OrionSetu or BharatPulse"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {searchQuery && (
                <a
                  href={getRegistrarUrl(searchQuery.toLowerCase().trim(), 'godaddy')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Search GoDaddy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All branding options remain 100% compliant with Orion Technologies by Shaikh M. Abrar.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Close & Continue
          </button>
        </div>

      </div>
    </div>
  );
};
