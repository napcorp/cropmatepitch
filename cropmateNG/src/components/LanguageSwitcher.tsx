import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pinnedLanguages = LANGUAGES.filter(l => l.category === 'pinned');
  const indianLanguages = LANGUAGES.filter(l => l.category === 'indian');
  const foreignLanguages = LANGUAGES.filter(l => l.category === 'foreign');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-colors cursor-pointer text-white text-xs font-semibold"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-white" />
        <span className="hidden sm:inline">{currentLanguage.name.split(' ')[0]}</span>
        <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] p-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
          
          <div className="mb-2">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">Pinned</h3>
            <div className="space-y-0.5">
              {pinnedLanguages.map(lang => (
                <LanguageOption key={lang.code} lang={lang} current={currentLanguage} onSelect={handleSelect} />
              ))}
            </div>
          </div>

          <div className="mb-2 border-t border-slate-100 pt-2">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">Indian Languages</h3>
            <div className="space-y-0.5">
              {indianLanguages.map(lang => (
                <LanguageOption key={lang.code} lang={lang} current={currentLanguage} onSelect={handleSelect} />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">Foreign Languages</h3>
            <div className="space-y-0.5">
              {foreignLanguages.map(lang => (
                <LanguageOption key={lang.code} lang={lang} current={currentLanguage} onSelect={handleSelect} />
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

function LanguageOption({ 
  lang, 
  current, 
  onSelect 
}: { 
  lang: Language; 
  current: Language; 
  onSelect: (lang: Language) => void 
}) {
  const isSelected = current.code === lang.code;
  
  return (
    <button
      onClick={() => onSelect(lang)}
      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors cursor-pointer ${
        isSelected 
          ? 'bg-emerald-50 text-emerald-800 font-semibold' 
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span>{lang.name}</span>
      {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
    </button>
  );
}
