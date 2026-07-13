import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  category: 'pinned' | 'indian' | 'foreign';
}

export const LANGUAGES: Language[] = [
  
  { code: 'en', name: 'English', category: 'pinned' },
  { code: 'hi', name: 'Hindi (हिंदी)', category: 'pinned' },
  
  
  { code: 'bn', name: 'Bengali (বাংলা)', category: 'indian' },
  { code: 'te', name: 'Telugu (తెలుగు)', category: 'indian' },
  { code: 'mr', name: 'Marathi (मराठी)', category: 'indian' },
  { code: 'ta', name: 'Tamil (தமிழ்)', category: 'indian' },
  { code: 'ur', name: 'Urdu (اردو)', category: 'indian' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', category: 'indian' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', category: 'indian' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', category: 'indian' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', category: 'indian' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬী)', category: 'indian' },
  { code: 'as', name: 'Assamese (অসমীয়া)', category: 'indian' },
  { code: 'mai', name: 'Maithili (मैथिली)', category: 'indian' },
  { code: 'ne', name: 'Nepali (नेपाली)', category: 'indian' },
  { code: 'sd', name: 'Sindhi (سنڌي)', category: 'indian' },
  { code: 'doi', name: 'Dogri (डोगरी)', category: 'indian' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)', category: 'indian' },
  { code: 'mni-Mtei', name: 'Meiteilon (ꯃꯤꯇꯩꯂꯣꯟ)', category: 'indian' },
  { code: 'bho', name: 'Bhojpuri (भोजपुरी)', category: 'indian' },
  { code: 'kok', name: 'Konkani (कोंकणी)', category: 'indian' },
  { code: 'lus', name: 'Mizo', category: 'indian' },

  
  { code: 'es', name: 'Spanish (Español)', category: 'foreign' },
  { code: 'fr', name: 'French (Français)', category: 'foreign' },
  { code: 'zh-CN', name: 'Mandarin (中文)', category: 'foreign' },
  { code: 'ar', name: 'Arabic (العربية)', category: 'foreign' },
  { code: 'ru', name: 'Russian (Русский)', category: 'foreign' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(LANGUAGES[0]); 

  useEffect(() => {
    
    const savedLangCode = localStorage.getItem('app_language');
    if (savedLangCode) {
      const lang = LANGUAGES.find(l => l.code === savedLangCode);
      if (lang) {
        setCurrentLanguage(lang);
        
        
        const targetCookie = `/auto/${lang.code}`;
        const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
        if (lang.code !== 'en' && (!currentCookie || !currentCookie.includes(targetCookie))) {
          const domain = window.location.hostname;
          document.cookie = `googtrans=${targetCookie}; path=/;`;
          document.cookie = `googtrans=${targetCookie}; domain=${domain}; path=/;`;
          window.location.reload();
        } else if (lang.code === 'en' && currentCookie) {
          
          const domain = window.location.hostname;
          document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + domain + "; path=/;";
          window.location.reload();
        }
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('app_language', lang.code);

    const domain = window.location.hostname;
    if (lang.code === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + domain + "; path=/;";
    } else {
      const targetCookie = `/en/${lang.code}`;
      document.cookie = `googtrans=${targetCookie}; path=/;`;
      document.cookie = `googtrans=${targetCookie}; domain=${domain}; path=/;`;
    }

    const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (gtCombo) {
      gtCombo.value = lang.code;
      gtCombo.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  
  const t = (key: string): string => {
    return key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
