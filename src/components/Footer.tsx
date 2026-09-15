import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock, Award, Heart, Globe } from 'lucide-react';

interface FooterProps {
  brandName?: string;
  onOpenDomainAdvisor?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  brandName = 'BharatConnect',
  onOpenDomainAdvisor,
}) => {
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
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-20 text-xs">
      {/* Top Highlight Stripe */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10">
          {/* Brand & Agency Attribution */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 p-1.5 flex items-center justify-center border border-slate-700/80 shadow-xs">
                <img 
                  src="/bharat-connect-logo.svg" 
                  alt={`${brandName} Geometric Nexus Mark`} 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight">
                  {brandPrefix}<span className="text-orange-500">{brandSuffix}</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                  Enterprise AI Assistance & Local Knowledge System
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-md">
              A professional multi-domain AI intelligence engineered for instantaneous, rigorous advisory across medicine, law, engineering, agriculture, and business. Powered by proactive insights with zero cloud lock-in.
            </p>

            {onOpenDomainAdvisor && (
              <button
                id="footer-domain-advisor-btn"
                onClick={onOpenDomainAdvisor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-orange-400 hover:text-orange-300 border border-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-orange-500" />
                <span>Domain & Branding Advisor ({brandName})</span>
              </button>
            )}

            {/* Orion Technologies Badge */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between max-w-md">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/orion-logo.svg" 
                  alt="Orion Technologies Logo" 
                  className="w-6 h-6 rounded-md object-contain shrink-0"
                />
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <span>Orion Technologies</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                      Innovator
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Lead Developer & Architect: <span className="text-slate-200 font-medium">Shaikh M. Abrar</span>
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Capabilities Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              <span>Core Platform</span>
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs font-normal">
              <li className="hover:text-white transition-colors">7 Multi-Domain AI Experts</li>
              <li className="hover:text-white transition-colors">Real-Time Voice & Neural Speech</li>
              <li className="hover:text-white transition-colors">Instant Multi-Chat Session Switcher</li>
              <li className="hover:text-white transition-colors">Real-Time Document Analysis</li>
              <li className="hover:text-white transition-colors">1-Click PDF & Excel/CSV Export</li>
              <li className="hover:text-white transition-colors">Proactive Insights Engine</li>
            </ul>
          </div>

          {/* Storage & Privacy Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local Storage & Privacy</span>
            </h4>
            
            <div className="space-y-2 text-slate-300 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Lock className="w-3 h-3" />
                  <span>Physical Machine Hard Drive Storage</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  All inquiries and logs persist directly to <code className="text-slate-200">./data/inquiries.csv</code> on your machine's physical disk. Zero cloud quota ceilings, zero subscription fees.
                </p>
              </div>

              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>End-to-End Client-Side AES-256 Vault</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Zero-Cloud Leakage Offline Knowledge Kernel</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Interactive Admin Analytics Console</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} BharatConnect.</span>
            <span className="hidden sm:inline">•</span>
            <span>Crafted by Orion Technologies (Shaikh M. Abrar).</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Local Machine Vault Active
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Zero Cloud Invoicing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
