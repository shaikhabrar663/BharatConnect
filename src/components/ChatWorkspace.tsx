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
  Bot, 
  User, 
  Paperclip, 
  X, 
  AlertCircle,
  WifiOff,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  SlidersHorizontal
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const currentExpert = EXPERT_PROFILES.find(e => e.id === selectedDomain) || EXPERT_PROFILES[0];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[650px] shadow-sm">
      {/* Workspace Subheader / Actions Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Expert Info & State */}
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${currentExpert.badgeColor}`}>
            <span>{currentExpert.name}</span>
          </span>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{messages.length} exchanges</span>
          </div>

          {/* Auto New Chat on Expert Toggle setting */}
          <label 
            className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-md cursor-pointer transition-colors shadow-2xs"
            title="When switching between experts, automatically initialize a fresh new consultation"
          >
            <input
              type="checkbox"
              checked={autoStartNewChatOnSwitch}
              onChange={(e) => setAutoStartNewChatOnSwitch(e.target.checked)}
              className="w-3 h-3 text-orange-600 rounded cursor-pointer accent-orange-600"
            />
            <span className="font-semibold text-slate-700">Auto-New Chat on Switch</span>
          </label>
        </div>

        {/* Right Action Controls: New Chat, Export, Clear */}
        <div className="flex items-center gap-2">
          {/* Prominent New Chat Button */}
          <button
            id="workspace-new-chat-btn"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Start a fresh, clean chat session with this expert"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {messages.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(messages)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-md cursor-pointer transition-colors"
                title="Export session log to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              {confirmingClear ? (
                <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded-md p-0.5 animate-fadeIn">
                  <span className="text-[11px] font-bold text-rose-700 px-1">Clear chat?</span>
                  <button
                    id="confirm-clear-yes-btn"
                    type="button"
                    onClick={() => {
                      onClearChat();
                      setConfirmingClear(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    title="Confirm clear active consultation"
                  >
                    Yes
                  </button>
                  <button
                    id="confirm-clear-cancel-btn"
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold cursor-pointer"
                    title="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="chat-clear-btn"
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md cursor-pointer transition-colors"
                  title="Clear current session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </>
          )}

          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              BharatConnect AI Expert Ready
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Ask any complex question, tap the microphone to speak in your language, or attach documents (PDF, Word, Excel) for real-time analysis.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={onOpenDocModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs"
              >
                <Paperclip className="w-3.5 h-3.5 text-orange-600" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={handleVoiceToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs"
              >
                <Mic className="w-3.5 h-3.5 text-blue-600" />
                <span>Try Voice Question</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 border-slate-800 text-white'
                      : 'bg-white border-slate-200 text-orange-600 shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-orange-600" />}
                </div>

                {/* Message Body */}
                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[90%]`}>
                  <div
                    className={`rounded-xl p-4 border text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                    }`}
                  >
                    {/* Document attachment card if present */}
                    {msg.documentAttachment && (
                      <div className="mb-3 p-2.5 rounded-lg bg-slate-800 text-white border border-slate-700 flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                        <div className="truncate flex-1">
                          <span className="font-semibold block truncate">
                            {msg.documentAttachment.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {Math.round(msg.documentAttachment.size / 1024)} KB • Attached for analysis
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Content text */}
                    <div className="selection:bg-orange-200 selection:text-slate-900">
                      <FormattedResponse content={msg.content} isUser={isUser} />
                    </div>

                    {/* Proactive J.A.R.V.I.S. Suggestions */}
                    {msg.proactiveSuggestions && msg.proactiveSuggestions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t.proactiveHeader}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.proactiveSuggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => onSendMessage(suggestion)}
                              className="text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 group cursor-pointer"
                            >
                              <span>{suggestion}</span>
                              <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Meta & Action Controls */}
                  <div className={`flex items-center gap-3 text-[11px] text-slate-500 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {msg.isOffline && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <WifiOff className="w-3 h-3" />
                        Local Offline Engine
                      </span>
                    )}

                    {!isUser && (
                      <div className="flex items-center gap-1.5">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Copy response to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        {/* Read Aloud Audio TTS Button */}
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer ${
                            speakingId === msg.id ? 'text-orange-600 bg-orange-100' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title={speakingId === msg.id ? 'Stop audio' : 'Read aloud with voice'}
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3 h-3" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>

                        {/* Export to PDF */}
                        <button
                          onClick={() => exportToPDF(msg)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Export report as PDF"
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-lg">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-orange-600 flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-800">
                  Synthesizing domain analysis...
                </span>
              </div>
              <div className="h-1.5 w-36 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full animate-pulse w-2/3"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech Error Banner if any */}
      {speechError && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="text-amber-900 hover:text-black">
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

      {/* Input Form Bar */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          {/* Document Attachment Button */}
          <button
            type="button"
            id="attach-doc-btn"
            onClick={onOpenDocModal}
            className="p-2.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title={t.uploadDoc}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            id="voice-input-btn"
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
            title={isListening ? t.listening : t.voiceInput}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              id="chat-input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? t.listening : t.askPlaceholder}
              disabled={isLoading}
              className={`w-full ${inputText ? 'pr-9' : 'pr-3.5'} pl-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900`}
            />
            {inputText && !isLoading && (
              <button
                type="button"
                id="clear-input-text-btn"
                onClick={() => setInputText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-full cursor-pointer transition-colors"
                title="Clear input text"
                aria-label="Clear input text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="send-message-btn"
            disabled={(!inputText.trim() && !attachedDoc) || isLoading}
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>{t.sendBtn}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
