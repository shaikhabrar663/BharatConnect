export type ExpertDomainId = 
  | 'general'
  | 'medical'
  | 'coding'
  | 'legal'
  | 'agriculture'
  | 'business'
  | 'education';

export type LanguageCode = 
  | 'en' 
  | 'hi' 
  | 'mr' 
  | 'bn' 
  | 'ta' 
  | 'te' 
  | 'gu' 
  | 'kn' 
  | 'pa';

export interface DocumentAttachment {
  name: string;
  type: string;
  size: number;
  extractedText: string;
  parsedSummary?: string;
  dataPointsCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  domain: ExpertDomainId;
  language: LanguageCode;
  proactiveSuggestions?: string[];
  actionItems?: string[];
  documentAttachment?: DocumentAttachment;
  isEncrypted: boolean;
  isOffline?: boolean;
}

export interface ExpertProfile {
  id: ExpertDomainId;
  name: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  samplePrompts: {
    en: string[];
    hi: string[];
  };
}

export interface AnalyticsData {
  totalQueries: number;
  hoursSaved: number;
  accuracyScore: number;
  offlineQueriesCount: number;
  encryptedRecordsCount: number;
  domainCounts: Record<ExpertDomainId, number>;
  languageCounts: Record<LanguageCode, number>;
}

export interface InquiryRecord {
  id: string;
  timestamp: string;
  expertDomain: ExpertDomainId;
  language: LanguageCode;
  prompt: string;
  responseSummary: string;
  modelUsed: string;
  isOffline: boolean;
}

export interface UserRecord {
  id: string;
  registrationDate: string;
  fullName: string;
  email: string;
  organization: string;
  profession: string;
  primaryDomain: ExpertDomainId;
  language: LanguageCode;
  phone?: string;
  purpose?: string;
  status: 'Active' | 'Verified' | 'Enterprise Trial';
  queriesRun?: number;
  lastActive?: string;
}

export interface UserSignupData {
  fullName: string;
  email: string;
  organization?: string;
  profession: string;
  primaryDomain: ExpertDomainId;
  language: LanguageCode;
  phone?: string;
  purpose?: string;
}
