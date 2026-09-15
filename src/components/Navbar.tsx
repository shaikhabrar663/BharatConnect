import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Globe, 
  BarChart3, 
  Sparkles, 
  CreditCard, 
  Server, 
  ChevronDown,
  HardDrive,
  User,
  UserPlus
} from 'lucide-react';
import { LanguageCode, UserRecord } from '../types';
import { LANGUAGES, UI_TRANSLATIONS } from '../data/languages';

interface NavbarProps {
  currentTab: 'workspace' | 'analytics' | 'admin' | 'pricing' | 'backend';
  setCurrentTab: (tab: 'workspace' | 'analytics' | 'admin' | 'pricing' | 'backend') => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  encryptedCount: number;
  brandName?: string;
  onOpenDomainAdvisor?: () => void;
  currentUser?: UserRecord | null;
  onOpenSignupModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  isOnline,
  setIsOnline,
  encryptedCount,
  brandName = 'BharatConnectAI',
  onOpenDomainAdvisor,
  currentUser = null,
  onOpenSignupModal,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Helper to visually split brand name into two colors
  const getBrandDisplay = (name: string) => {
    if (name.startsWith('Bharat')) {
      return { prefix: 'Bharat', suffix: name.slice(6) };
    }
    if (name.startsWith('Orion')) {
      return { prefix: 'Orion', suffix: name.slice(5) };
    }
    if (name.startsWith('Indic')) {
      return { prefix: 'Indic', suffix: name.slice(5) };
    }
    if (name.startsWith('Prajna')) {
      return { prefix: 'Prajna', suffix: name.slice(6) };
    }
    const mid = Math.floor(name.length / 2);
    return { prefix: name.slice(0, mid), suffix: name.slice(mid) };
  };

  const { prefix: brandPrefix, suffix: brandSuffix } = getBrandDisplay(brandName);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Banner for Limited-Time 100% Free Access */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500 text-slate-950">
            LAUNCH DEMO
          </span>
          <span className="font-medium text-slate-200">
            {t.limitedFreeBanner}
          </span>
        </div>

        {/* Agency Attribution & Developer Link & Domain Advisor */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onOpenDomainAdvisor && (
            <button
              id="top-bar-domain-advisor-btn"
              onClick={onOpenDomainAdvisor}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-[11px] font-bold transition-colors cursor-pointer"
              title="Explore domain name alternatives for BharatConnect"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>Domain Alternatives</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-slate-300">
            <img 
              src="/orion-logo.svg" 
              alt="Orion Technologies Logo" 
              className="w-4 h-4 rounded-sm"
            />
            <span className="text-[11px]">
              Orion Technologies • <strong className="text-cyan-400 font-semibold">Shaikh M. Abrar</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 text-[11px] border-l border-slate-700 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256 Vault ({encryptedCount} records)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              id="brand-home-btn"
              onClick={() => setCurrentTab('workspace')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl p-1 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center border border-slate-800 shadow-xs">
                <img 
                  src="/bharat-connect-logo.svg" 
                  alt={`${brandName} Geometric Nexus Logo`} 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    {brandPrefix}<span className="text-orange-600">{brandSuffix}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                    PROACTIVE AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                  {t.tagline}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-workspace"
              onClick={() => setCurrentTab('workspace')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'workspace'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>{t.navWorkspace}</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>{t.navAnalytics}</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HardDrive className="w-4 h-4 text-amber-500" />
              <div className="flex items-center gap-1.5">
                <span>Admin & Storage</span>
                <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-1 rounded">
                  CSV
                </span>
              </div>
            </button>

            <button
              id="nav-tab-pricing"
              onClick={() => setCurrentTab('pricing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'pricing'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>{t.navPricing}</span>
            </button>

            <button
              id="nav-tab-backend"
              onClick={() => setCurrentTab('backend')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'backend'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Server className="w-4 h-4 text-purple-500" />
              <span>{t.navBackend}</span>
            </button>
          </nav>

          {/* Right Action Controls: Connectivity Toggle & Language Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Online / Offline Simulator Toggle */}
            <button
              id="toggle-connectivity-btn"
              onClick={() => setIsOnline(!isOnline)}
              title={isOnline ? 'Click to simulate offline field access' : 'Click to restore online network engine'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">{t.onlineBadge}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{t.offlineBadge}</span>
                </>
              )}
            </button>

            {/* Vernacular Language Selector */}
            <div className="relative group">
              <label htmlFor="language-select" className="sr-only">Language</label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-sm">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>

              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Select Vernacular Language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Register Button */}
            {onOpenSignupModal && (
              currentUser ? (
                <button
                  id="navbar-user-profile-btn"
                  onClick={onOpenSignupModal}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all border border-slate-700/60 cursor-pointer group"
                  title={`Logged in as ${currentUser.fullName} (${currentUser.profession})`}
                >
                  <div className="w-5 h-5 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium text-slate-200 group-hover:text-white max-w-[100px] truncate">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </button>
              ) : (
                <button
                  id="navbar-signup-btn"
                  onClick={onOpenSignupModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Sign up to access verified expert modules"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setCurrentTab('workspace')}
            className={`py-1 px-2 rounded shrink-0 ${currentTab === 'workspace' ? 'text-orange-600 font-bold bg-orange-50' : 'text-slate-600'}`}
          >
            {t.navWorkspace}
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`py-1 px-2 rounded shrink-0 ${currentTab === 'analytics' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'}`}
          >
            {t.navAnalytics}
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`py-1 px-2 rounded shrink-0 ${currentTab === 'admin' ? 'text-amber-600 font-bold bg-amber-50' : 'text-slate-600'}`}
          >
            Admin & CSV
          </button>
          <button
            onClick={() => setCurrentTab('pricing')}
            className={`py-1 px-2 rounded shrink-0 ${currentTab === 'pricing' ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-600'}`}
          >
            {t.navPricing}
          </button>
          <button
            onClick={() => setCurrentTab('backend')}
            className={`py-1 px-2 rounded shrink-0 ${currentTab === 'backend' ? 'text-purple-600 font-bold bg-purple-50' : 'text-slate-600'}`}
          >
            {t.navBackend}
          </button>
          {onOpenDomainAdvisor && (
            <button
              id="mobile-domain-advisor-btn"
              onClick={onOpenDomainAdvisor}
              className="py-1 px-2 rounded shrink-0 text-orange-800 bg-orange-100/70 font-bold flex items-center gap-1 cursor-pointer border border-orange-200"
            >
              <Globe className="w-3 h-3 text-orange-600" />
              <span>Domains</span>
            </button>
          )}
          {onOpenSignupModal && (
            <button
              id="mobile-user-profile-btn"
              onClick={onOpenSignupModal}
              className="py-1 px-2 rounded shrink-0 text-slate-800 bg-slate-100 font-bold flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <User className="w-3 h-3 text-orange-600" />
              <span>{currentUser ? currentUser.fullName.split(' ')[0] : 'Sign Up'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
