import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Paperclip, 
  X, 
  AlertCircle,
  WifiOff,
  Clock,
  ArrowRight,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Wheat,
  Stethoscope,
  Code2,
  Scale
} from 'lucide-react';
import { 
  ChatMessage, 
  ExpertDomainId, 
  LanguageCode, 
  DocumentAttachment 
} from '../types';
import { UI_TRANSLATIONS } from '../data/languages';
import { EXPERT_PROFILES } from '../data/expertDomains';
import { copyToClipboard, exportToPDF, exportToCSV } from '../utils/exportUtils';
import { createSpeechRecognizer, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../utils/speech';
import { FormattedResponse } from './FormattedResponse';

// Iconic 4-pointed Gemini Star Sparkle SVG
const GeminiSparkleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
      fill="url(#gemini_grad)"
    />
    <defs>
      <linearGradient id="gemini_grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="0.45" stopColor="#7C3AED" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
    </defs>
  </svg>
);

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, docAttachment?: DocumentAttachment) => Promise<void>;
  isLoading: boolean;
  selectedDomain: ExpertDomainId;
  language: LanguageCode;
  isOnline: boolean;
  onClearChat: () => void;
  onNewChat: () => void;
  autoStartNewChatOnSwitch: boolean;
  setAutoStartNewChatOnSwitch: (val: boolean) => void;
  attachedDoc: DocumentAttachment | null;
  setAttachedDoc: (doc: DocumentAttachment | null) => void;
  onOpenDocModal: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedDomain,
  language,
  isOnline,
  onClearChat,
  onNewChat,
  autoStartNewChatOnSwitch,
  setAutoStartNewChatOnSwitch,
  attachedDoc,
  setAttachedDoc,
  onOpenDocModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});
  const [userFirstName, setUserFirstName] = useState<string>('');
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(messages.length);
  const prevLoadingRef = useRef<boolean>(isLoading);
  const prevDomainRef = useRef<ExpertDomainId>(selectedDomain);
  const recognitionRef = useRef<any>(null);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const currentExpert = EXPERT_PROFILES.find(e => e.id === selectedDomain) || EXPERT_PROFILES[0];

  // Retrieve user's first name for Gemini-style personalized greeting
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bharatconnect_active_user_v1');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.fullName) {
          setUserFirstName(u.fullName.split(' ')[0]);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Intelligent internal auto-scroll that never disturbs window / outer page scroll
  // When a response is generated, it aligns the viewport to the start of the exchange
  // (user question + top of AI answer) so the user reads naturally without the page
  // jumping, flipping upside down, or slamming to the bottom of the long message.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;
    const wasLoading = prevLoadingRef.current;
    const prevDomain = prevDomainRef.current;

    prevMessagesLengthRef.current = currentLength;
    prevLoadingRef.current = isLoading;
    prevDomainRef.current = selectedDomain;

    // 1. Domain switched: instant reposition without jarring smooth animation
    if (selectedDomain !== prevDomain) {
      container.scrollTop = currentLength > 0 ? container.scrollHeight : 0;
      return;
    }

    // 2. Chat cleared or empty: reset to top
    if (currentLength === 0) {
      container.scrollTop = 0;
      return;
    }

    // 3. Initial load of existing conversation
    if (prevLength === 0 && currentLength > 0) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    // 4. New message added
    if (currentLength > prevLength) {
      const lastMsg = messages[currentLength - 1];

      if (lastMsg.role === 'user') {
        // User sent a message: smoothly scroll container to reveal prompt and thinking animation
        requestAnimationFrame(() => {
          if (!messagesContainerRef.current) return;
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        });
        return;
      }

      if (lastMsg.role === 'assistant') {
        // Assistant response arrived!
        // Position at the start of this exchange so the user can immediately read
        // from the top without the viewport slamming to the bottom or moving the page.
        requestAnimationFrame(() => {
          if (!messagesContainerRef.current) return;
          const userMsg = currentLength >= 2 ? messages[currentLength - 2] : null;
          const targetEl =
            (userMsg ? document.getElementById(`chat-msg-${userMsg.id}`) : null) ||
            document.getElementById(`chat-msg-${lastMsg.id}`);

          if (targetEl) {
            const containerRect = messagesContainerRef.current.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const targetScrollTop =
              messagesContainerRef.current.scrollTop + (targetRect.top - containerRect.top) - 16;

            messagesContainerRef.current.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth',
            });
          } else {
            messagesContainerRef.current.scrollTo({
              top: messagesContainerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        });
        return;
      }
    }

    // 5. Loading turned on (thinking animation appeared)
    if (isLoading && !wasLoading) {
      requestAnimationFrame(() => {
        if (!messagesContainerRef.current) return;
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages, isLoading, selectedDomain]);

  // Auto-reset clear confirmation after 4 seconds
  useEffect(() => {
    if (!confirmingClear) return;
    const timer = setTimeout(() => setConfirmingClear(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmingClear]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedDoc) || isLoading) return;

    const query = inputText.trim();
    const doc = attachedDoc || undefined;
    setInputText('');
    setAttachedDoc(null);
    await onSendMessage(query, doc);
  };

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackMap(prev => ({
      ...prev,
      [id]: prev[id] === type ? (null as any) : type,
    }));
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      stopSpeaking();
      const success = speakText(
        text,
        language,
        () => setSpeakingId(id),
        () => setSpeakingId(null)
      );
      if (!success) {
        alert('Text-to-speech is not supported on this device.');
      }
    }
  };

  const handleVoiceToggle = () => {
    setSpeechError(null);
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Voice speech-to-text requires Google Chrome or Microsoft Edge.');
      return;
    }

    const recognizer = createSpeechRecognizer(
      language,
      (transcript) => {
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
      },
      (error) => {
        setSpeechError(error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err: any) {
        console.warn('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  // Curated prompts for Gemini empty state
  const quickPrompts = [
    {
      icon: Wheat,
      iconColor: 'text-emerald-600',
      title: 'Agronomic Profitability',
      desc: 'Crop selection & water management for Ajanta, Maharashtra',
      prompt: 'Agronomic suitability and profitability optimization for the Ajanta region, Maharashtra.',
    },
    {
      icon: Stethoscope,
      iconColor: 'text-blue-600',
      title: 'Clinical Advisory',
      desc: 'Interpret symptoms & lab metrics with clinical precision',
      prompt: 'What are the clinical red-flag symptoms and evidence-based protocols for sudden nocturnal headaches?',
    },
    {
      icon: Code2,
      iconColor: 'text-indigo-600',
      title: 'Code Architecture',
      desc: 'Resilient TypeScript, React state & offline disk persistence',
      prompt: 'Show me an idiomatic TypeScript architecture for resilient offline failover with local storage caching.',
    },
    {
      icon: Scale,
      iconColor: 'text-amber-600',
      title: 'Legal Counsel (BNS)',
      desc: 'Indian contract drafting & statutory dispute resolution',
      prompt: 'What are the essential elements of a commercial contract and dispute arbitration clause under Indian law?',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col h-[700px] shadow-sm">
      {/* Workspace Subheader / Actions Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Expert Info & State */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
            <GeminiSparkleIcon className="w-3.5 h-3.5" />
            <span>{currentExpert.name}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{messages.length} exchanges</span>
          </div>

          {/* Auto New Chat on Expert Toggle setting */}
          <label 
            className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
            title="When switching between experts, automatically initialize a fresh new consultation"
          >
            <input
              type="checkbox"
              checked={autoStartNewChatOnSwitch}
              onChange={(e) => setAutoStartNewChatOnSwitch(e.target.checked)}
              className="w-3 h-3 text-orange-600 rounded cursor-pointer accent-orange-600"
            />
            <span className="font-medium text-slate-700">Auto-New on Switch</span>
          </label>
        </div>

        {/* Right Action Controls: New Chat, Export, Clear */}
        <div className="flex items-center gap-2">
          {/* Prominent New Chat Button */}
          <button
            id="workspace-new-chat-btn"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Start a fresh conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {messages.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(messages)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Export session log to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              {confirmingClear ? (
                <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded-lg p-0.5 animate-fadeIn">
                  <span className="text-[11px] font-medium text-rose-700 px-1">Clear chat?</span>
                  <button
                    id="confirm-clear-yes-btn"
                    type="button"
                    onClick={() => {
                      onClearChat();
                      setConfirmingClear(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    Yes
                  </button>
                  <button
                    id="confirm-clear-cancel-btn"
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="chat-clear-btn"
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg cursor-pointer transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </>
          )}

          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Encrypted</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area — Gemini Flow Canvas */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-7 bg-white"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center max-w-2xl mx-auto py-6">
            {/* Gemini Greeting Header */}
            <div className="mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-orange-400 p-0.5 flex items-center justify-center mb-4 shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <GeminiSparkleIcon className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-2">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  Hello, {userFirstName || 'there'}
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-500 font-normal">
                How can I help you today?
              </p>
            </div>

            {/* Gemini Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {quickPrompts.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                        <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <p className="text-[12.5px] text-slate-500 leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
                      <span>Explore topic</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const feedback = feedbackMap[msg.id];

            if (isUser) {
              // User Message: Sleek right-aligned pill bubble (Gemini Style)
              return (
                <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex flex-col items-end max-w-3xl ml-auto">
                  <div className="rounded-3xl bg-slate-100 text-slate-900 border border-slate-200/90 px-5 py-3 text-[14.5px] max-w-[85%] sm:max-w-[78%] shadow-2xs">
                    {msg.documentAttachment && (
                      <div className="mb-2 p-2 rounded-lg bg-slate-200/80 text-slate-800 flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                        <span className="font-medium truncate">{msg.documentAttachment.name}</span>
                      </div>
                    )}
                    <FormattedResponse content={msg.content} isUser={true} />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 px-3">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            }

            // Assistant Message: Open canvas flow with Gemini Sparkle (Gemini Style)
            return (
              <div key={msg.id} id={`chat-msg-${msg.id}`} className="flex items-start gap-3.5 sm:gap-4 max-w-3xl mr-auto">
                {/* Gemini Icon */}
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <GeminiSparkleIcon className="w-4 h-4" />
                </div>

                {/* Assistant Response Body */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Clean Markdown Response */}
                  <div className="text-slate-900">
                    <FormattedResponse content={msg.content} isUser={false} />
                  </div>

                  {/* Proactive Follow-up Chips (Gemini Style) */}
                  {msg.proactiveSuggestions && msg.proactiveSuggestions.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2">
                        {msg.proactiveSuggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => onSendMessage(suggestion)}
                            className="text-left text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemini Action Toolbar at bottom of response */}
                  <div className="flex items-center gap-2 pt-1 text-slate-400">
                    {/* Thumbs Up */}
                    <button
                      onClick={() => handleFeedback(msg.id, 'up')}
                      className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
                        feedback === 'up' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Good response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Thumbs Down */}
                    <button
                      onClick={() => handleFeedback(msg.id, 'down')}
                      className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
                        feedback === 'down' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Bad response"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Read Aloud (TTS) */}
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
                        speakingId === msg.id ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title={speakingId === msg.id ? 'Stop audio' : 'Listen with speech'}
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-orange-600" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Export to PDF */}
                    <button
                      onClick={() => exportToPDF(msg)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Export as PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    {msg.isOffline && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium ml-2">
                        <WifiOff className="w-3 h-3" />
                        <span>Offline Kernel</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator (Gemini Sparkle Wave) */}
        {isLoading && (
          <div className="flex items-start gap-3.5 sm:gap-4 max-w-3xl mr-auto">
            <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              <GeminiSparkleIcon className="w-4 h-4 animate-spin" />
            </div>
            <div className="space-y-2 py-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Thinking...</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div id="chat-messages-anchor" className="h-px" />
      </div>

      {/* Speech Error Banner if any */}
      {speechError && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="text-amber-900 hover:text-black cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Document Attached Preview Bar */}
      {attachedDoc && (
        <div className="px-4 py-2 bg-orange-50 border-t border-orange-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-orange-900">
            <FileText className="w-4 h-4 text-orange-600" />
            <span className="font-semibold">{attachedDoc.name}</span>
            <span className="text-orange-700">({Math.round(attachedDoc.size / 1024)} KB)</span>
          </div>
          <button
            onClick={() => setAttachedDoc(null)}
            className="text-orange-700 hover:text-orange-900 p-1 hover:bg-orange-100 rounded cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gemini-Style Floating Pill Input Form */}
      <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-slate-50 border border-slate-300/90 rounded-full px-3 py-1.5 shadow-2xs focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            {/* Attachment Button */}
            <button
              type="button"
              id="attach-doc-btn"
              onClick={onOpenDocModal}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title={t.uploadDoc}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Text Box */}
            <div className="flex-1 relative">
              <input
                type="text"
                id="chat-input-field"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? t.listening : (t.askPlaceholder || "Ask BharatConnect anything...")}
                disabled={isLoading}
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none py-1.5"
              />
              {inputText && !isLoading && (
                <button
                  type="button"
                  id="clear-input-text-btn"
                  onClick={() => setInputText('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
                  title="Clear input text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Voice Input Microphone */}
            <button
              type="button"
              id="voice-input-btn"
              onClick={handleVoiceToggle}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
              }`}
              title={isListening ? t.listening : t.voiceInput}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button (Pill Circle) */}
            <button
              type="submit"
              id="send-message-btn"
              disabled={(!inputText.trim() && !attachedDoc) || isLoading}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white transition-colors cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Gemini Bottom Disclaimer */}
          <div className="mt-2 text-center text-[11px] text-slate-400 font-normal">
            BharatConnect AI may display inaccurate info, so double-check critical clinical, legal, or financial details.
          </div>
        </div>
      </div>
    </div>
  );
};
