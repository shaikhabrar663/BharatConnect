import React from 'react';
import { 
  Sparkles, 
  Activity, 
  Code, 
  Scale, 
  Wheat, 
  TrendingUp, 
  GraduationCap 
} from 'lucide-react';
import { ExpertDomainId, LanguageCode } from '../types';
import { EXPERT_PROFILES } from '../data/expertDomains';

interface ExpertSelectorProps {
  selectedDomain: ExpertDomainId;
  onSelectDomain: (domain: ExpertDomainId) => void;
  language: LanguageCode;
  onSelectPrompt: (prompt: string) => void;
}

export const ExpertSelector: React.FC<ExpertSelectorProps> = ({
  selectedDomain,
  onSelectDomain,
  language,
  onSelectPrompt,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'Code':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-indigo-600" />;
      case 'Wheat':
        return <Wheat className="w-5 h-5 text-lime-600" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-teal-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-600" />;
    }
  };

  const activeExpert = EXPERT_PROFILES.find(e => e.id === selectedDomain) || EXPERT_PROFILES[0];
  const prompts = language === 'hi' ? activeExpert.samplePrompts.hi : activeExpert.samplePrompts.en;

  return (
    <div className="space-y-4">
      {/* Domain Selection Pills / Flat Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select AI Expert Intelligence
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            7 Specialized Disciplines
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {EXPERT_PROFILES.map((expert) => {
            const isSelected = expert.id === selectedDomain;
            return (
              <button
                key={expert.id}
                id={`expert-btn-${expert.id}`}
                onClick={() => onSelectDomain(expert.id)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className={`p-1.5 rounded ${isSelected ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                    {getIcon(expert.iconName)}
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <div className="font-bold text-xs line-clamp-1">
                  {expert.name}
                </div>
                <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {expert.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Domain Overview & Suggested Quick Queries */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-slate-900">{activeExpert.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${activeExpert.badgeColor}`}>
              {activeExpert.badge}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {activeExpert.description}
          </p>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 block w-full md:w-auto mb-1 md:mb-0">
            Suggested Queries:
          </span>
          {prompts.slice(0, 2).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt)}
              className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md transition-colors max-w-xs truncate cursor-pointer"
              title={prompt}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
