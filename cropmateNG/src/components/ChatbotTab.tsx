import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Trash2, HelpCircle, Activity, ChevronRight, ChevronDown, ChevronUp, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { voiceService } from '../services/voiceService';
import type { ChatMessage, ScanResult } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';

function ThinkingBlock({ thinking }: { thinking: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-l-2 border-slate-200 pl-3 py-1 mb-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors uppercase font-bold tracking-wider"
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {isExpanded ? "Hide Thinking" : "Show Thinking"}
      </button>
      {isExpanded && (
        <div className="mt-2 text-[10px] text-slate-500 italic leading-relaxed whitespace-pre-wrap">
          {thinking}
        </div>
      )}
    </div>
  );
}

export default function ChatbotTab() {
  const { currentLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ScanResult[]>([]);
  const [selectedContextScan, setSelectedContextScan] = useState<ScanResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadData = async () => {
    const chatHistory = await storageService.getChatHistory();
    const scans = await storageService.getScans();
    setMessages(chatHistory);
    setContext(scans);
    if (scans.length > 0) {
      setSelectedContextScan(scans[0]); 
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearChat = async () => {
    await storageService.clearChatHistory();
    setMessages([]);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    voiceService.startListening(
      (text) => {
        setIsListening(false);
        handleSend(undefined, text);
      },
      (error) => {
        setIsListening(false);
        console.error("Voice recognition error:", error);
      }
    );
  };

  const toggleMute = () => {
    if (isMuted) {
      voiceService.stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  const playMessageVoice = (text: string) => {
    if (!isMuted) {
      voiceService.speak(text, currentLanguage);
    }
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    
    const userMsg = await storageService.saveChatMessage({ role: 'user', text: textToSend });
    setMessages(prev => [...prev, userMsg]);

    try {
      const { text, thinking } = await aiService.chatWithContext(textToSend, context, messages, currentLanguage.name);
      const aiMsg = await storageService.saveChatMessage({ role: 'model', text, thinking });
      setMessages(prev => [...prev, aiMsg]);

      if (!isMuted) {
        voiceService.speak(text, currentLanguage);
      }
    } catch (error: any) {
      const errorMsg = await storageService.saveChatMessage({ 
        role: 'model', 
        text: `Error: ${error.message || "Failed to get response."}` 
      });
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerQuickPrompt = (promptText: string) => {
    handleSend(undefined, promptText);
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      let isBullet = false;
      let content = line;
      
      if (line.trim().startsWith('* ')) {
        isBullet = true;
        content = line.trim().substring(2);
      } else if (line.trim().startsWith('- ')) {
        isBullet = true;
        content = line.trim().substring(2);
      }
      
      const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      const parsedContent = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index} className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-800">{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIndex} className="flex gap-2 pl-4 py-0.5">
            <span className="text-[var(--color-primary)]">•</span>
            <span>{parsedContent}</span>
          </div>
        );
      }
      
      return (
        <div key={lineIndex} className={line.trim() === '' ? 'h-3' : 'min-h-[1.2rem]'}>
          {parsedContent}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto h-full min-h-[500px]">
      
      {}
      <aside className="hidden lg:flex lg:col-span-3 flex-col bg-white border border-emerald-100/50 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500">{t("Garden Scans Directory")}</h3>
          <p className="text-[10px] text-slate-400">{t("Injects care logs as assistant context")}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
          {context.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">{t("No scans recorded yet.")}</p>
          ) : (
            context.map((scan) => (
              <button 
                key={scan.id}
                onClick={() => setSelectedContextScan(scan)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all border ${selectedContextScan?.id === scan.id ? 'bg-emerald-50 border-emerald-100 text-slate-800 font-semibold shadow-sm' : 'border-transparent hover:bg-slate-50 text-slate-500'}`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                  <img src={scan.imageUrl} alt={scan.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-slate-800">{scan.name}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium inline-block border ${scan.isDiseased ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    {scan.isDiseased ? t("Attention Required") : t("Healthy")}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {}
      <div className="lg:col-span-6 flex flex-col bg-white border border-emerald-100/50 rounded-xl overflow-hidden h-full shadow-sm">
        {}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/60">
              <Bot className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">{t("Smart Advisor")}</h2>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemma 4 31B IT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
              title={isMuted ? t("Unmute AI Voice") : t("Mute AI Voice")}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title={t("Clear Chat History")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-white">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 max-w-sm mx-auto space-y-4">
              <Bot className="w-10 h-10 text-emerald-750 opacity-60" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{t("Cropmate Advisor Chat")}</h4>
                <p className="text-xs text-slate-500">{t("I am fully aware of your garden logs. Ask me any follow-up questions, request plant care details, or get troubleshooting steps!")}</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                msg.role === 'user' 
                  ? 'bg-slate-50 border-slate-200 text-slate-600' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-sm font-semibold text-xs leading-relaxed shadow-sm' 
                  : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm text-xs leading-relaxed whitespace-pre-wrap notranslate'
              }`}>
                {msg.role === 'user' ? msg.text : (
                  <div className="space-y-2">
                    {msg.thinking && <ThinkingBlock thinking={msg.thinking} />}
                    <div className="flex items-start gap-2">
                      <div className="flex-1">{renderFormattedText(msg.text)}</div>
                      {msg.role === 'model' && (
                        <button 
                          onClick={() => playMessageVoice(msg.text)}
                          className="shrink-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                          title={t("Replay voice")}
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
               <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border bg-emerald-50 border-emerald-100 text-emerald-700">
                 <Bot className="w-4 h-4" />
               </div>
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {}
        <div className="p-4 border-t border-slate-150 bg-slate-50 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("Query crop conditions, disease prevention...")}
                className="w-full glass-input py-2 pl-9 text-xs bg-white border border-slate-200"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="glass-button-primary !px-4 !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {}
      <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto">
        {}
        <div className="glass-panel p-4 bg-white border border-emerald-100/50 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{t("Quick Actions")}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => triggerQuickPrompt(t("Explain my last plant scan analysis"))}
              className="w-full text-left text-xs bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 px-3 py-2.5 rounded-lg transition-all text-slate-600 flex items-center justify-between cursor-pointer"
            >
              <span>{t("Explain last scan")}</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
            <button 
              onClick={() => triggerQuickPrompt(t("What are the recommended treatments for my affected crops?"))}
              className="w-full text-left text-xs bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 px-3 py-2.5 rounded-lg transition-all text-slate-600 flex items-center justify-between cursor-pointer"
            >
              <span>{t("Recommend treatments")}</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
            <button 
              onClick={() => triggerQuickPrompt(t("Compare the health state of my recorded plants"))}
              className="w-full text-left text-xs bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 px-3 py-2.5 rounded-lg transition-all text-slate-600 flex items-center justify-between cursor-pointer"
            >
              <span>{t("Compare health states")}</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>

        {}
        {selectedContextScan && (
          <div className="glass-panel p-4 bg-white border border-emerald-100/50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] uppercase font-bold tracking-wider">{t("Active Focus Data")}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                  <img src={selectedContextScan.imageUrl} alt={selectedContextScan.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{selectedContextScan.name}</h4>
                  <p className="text-[10px] text-slate-400">Scan: {new Date(selectedContextScan.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{t("Condition")}:</span>
                  <span className={selectedContextScan.isDiseased ? 'text-red-650 font-semibold' : 'text-emerald-700 font-semibold'}>
                    {selectedContextScan.isDiseased ? t("Issue Detected") : t("Healthy")}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{t("Confidence")}:</span>
                  <span className="text-slate-850 font-medium">{Math.round(selectedContextScan.confidence * 100)}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{t("Sunlight")}:</span>
                  <span className="text-slate-850 truncate max-w-[120px] font-medium">{selectedContextScan.stats?.sunlight || t("Never")}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{t("Watering")}:</span>
                  <span className="text-slate-850 truncate max-w-[120px] font-medium">{selectedContextScan.stats?.water || t("Never")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

    </div>
  );
}
