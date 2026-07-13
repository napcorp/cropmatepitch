import type { Language } from '../contexts/LanguageContext';

interface VoiceService {
  startListening: (onResult: (text: string) => void, onError: (error: string) => void) => void;
  stopListening: () => void;
  speak: (text: string, language: Language) => void;
  stopSpeaking: () => void;
  isListening: () => boolean;
  isSpeaking: () => boolean;
}

class VoiceServiceImplementation implements VoiceService {
  private recognition: any = null;
  private isListeningState = false;

  constructor() {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  startListening(onResult: (text: string) => void, onError: (error: string) => void) {
    if (!this.recognition) {
      onError("Speech recognition not supported in this browser.");
      return;
    }

    this.isListeningState = true;
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      this.isListeningState = false;
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
      this.isListeningState = false;
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition && this.isListeningState) {
      this.recognition.stop();
      this.isListeningState = false;
    }
  }

  async speak(text: string, language: Language) {
    this.stopSpeaking();

    // 1. Clean text of markdown
    const cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/^[ \t]*[*•-]\s+/gm, '')
      .replace(/\n/g, ' ')
      .trim();

    // Detect language from text script structure
    let detectedLang = language.code;
    if (/[\u0900-\u097F]/.test(cleanedText)) {
      const devanagariLangs = ['hi', 'mr', 'ne', 'sa', 'kok', 'bho', 'doi'];
      detectedLang = devanagariLangs.includes(language.code) ? language.code : 'hi';
    } else if (/[\u0980-\u09FF]/.test(cleanedText)) {
      detectedLang = language.code === 'as' ? 'as' : 'bn';
    } else if (/[\u0A00-\u0A7F]/.test(cleanedText)) {
      detectedLang = 'pa';
    } else if (/[\u0A80-\u0AFF]/.test(cleanedText)) {
      detectedLang = 'gu';
    } else if (/[\u0B00-\u0B7F]/.test(cleanedText)) {
      detectedLang = 'or';
    } else if (/[\u0B80-\u0BFF]/.test(cleanedText)) {
      detectedLang = 'ta';
    } else if (/[\u0C00-\u0C7F]/.test(cleanedText)) {
      detectedLang = 'te';
    } else if (/[\u0C80-\u0CFF]/.test(cleanedText)) {
      detectedLang = 'kn';
    } else if (/[\u0D00-\u0D7F]/.test(cleanedText)) {
      detectedLang = 'ml';
    } else if (/[\u0400-\u04FF]/.test(cleanedText)) {
      detectedLang = 'ru';
    } else if (/[\u4e00-\u9fff]/.test(cleanedText)) {
      detectedLang = 'zh-CN';
    } else if (/[\u0600-\u06FF]/.test(cleanedText)) {
      detectedLang = language.code === 'ur' ? 'ur' : 'ar';
    }

    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Attempt to map our detected lang to standard browser lang codes
    const langCodeMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'ur': 'ur-PK',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'or': 'or-IN',
      'pa': 'pa-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'zh-CN': 'zh-CN',
      'ar': 'ar-EG',
      'ru': 'ru-RU'
    };
    
    const targetLangCode = langCodeMap[detectedLang] || 'en-US';
    utterance.lang = targetLangCode;

    // Try to find a high-quality voice for the language (like Google or Microsoft native voices)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prioritize natural/premium voices if available
      const preferredVoice = voices.find(v => 
        v.lang.startsWith(targetLangCode.split('-')[0]) && 
        (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google'))
      ) || voices.find(v => v.lang.startsWith(targetLangCode.split('-')[0]));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Keep track of speaking state to match the HTMLAudioElement behavior
    this.isListeningState = false; // We can repurpose this or use speechSynthesis.speaking
    
    utterance.onstart = () => {
      // Used by ChatbotTab to toggle speaking state if needed
    };
    
    utterance.onend = () => {
      // Done speaking
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  isListening() {
    return this.isListeningState;
  }

  isSpeaking() {
    return window.speechSynthesis ? window.speechSynthesis.speaking : false;
  }
}

export const voiceService = new VoiceServiceImplementation();
