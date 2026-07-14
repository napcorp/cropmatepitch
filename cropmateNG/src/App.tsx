import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, LayoutDashboard, ScanLine, MessageSquare, Search, Home, Menu, X, Library, Map, ShoppingBag } from 'lucide-react';
import HomepageTab from './components/HomepageTab';
import ScannerTab from './components/ScannerTab';
import DashboardTab from './components/DashboardTab';
import ChatbotTab from './components/ChatbotTab';
import ResourcesTab from './components/ResourcesTab';
import WeatherDiseasesTab from './components/WeatherDiseasesTab';
import MarketTab from './components/MarketTab';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

type Tab = 'home' | 'dashboard' | 'scanner' | 'chatbot' | 'resources' | 'weather_diseases' | 'market';

function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [prevTab, setPrevTab] = useState<Tab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [referenceScanForFollowUp, setReferenceScanForFollowUp] = useState<any>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const tabOrder: Tab[] = ['home', 'dashboard', 'scanner', 'chatbot', 'resources', 'weather_diseases', 'market'];
  const direction = tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTab) ? 1 : -1;

  useEffect(() => {
    setPrevTab(activeTab);
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const transitionVariants = {
    initial: (custom: number) => ({ opacity: 0, x: custom * 10 }),
    animate: { opacity: 1, x: 0 },
    exit: (custom: number) => ({ opacity: 0, x: custom * -10 })
  };

  return (
    <div className="h-screen text-slate-800 bg-[var(--color-bg-base)] relative overflow-hidden flex flex-col">
      {}
      <header className="hidden md:flex items-center justify-between h-16 bg-[#1b7c43] px-8 shrink-0 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] border-b border-white/10 relative z-50">
        {}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="p-1.5 bg-white/10 rounded-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:border-white/40 transition-colors">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Cropmate</h1>
            <p className="text-[9px] text-white font-bold tracking-wider uppercase mt-0.5">{t("Your Smart Agricultural Advisor")}</p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1.5">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
              label={t("Home")} 
            />
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              label={t("Dashboard")} 
            />
            <NavButton 
              active={activeTab === 'scanner'} 
              onClick={() => setActiveTab('scanner')} 
              label={t("Scan / Upload")} 
            />
            <NavButton 
              active={activeTab === 'chatbot'} 
              onClick={() => setActiveTab('chatbot')} 
              label={t("AI Advisor")} 
            />
             <NavButton 
               active={activeTab === 'resources'} 
               onClick={() => setActiveTab('resources')} 
               label={t("Resources")} 
             />
             <NavButton 
                active={activeTab === 'weather_diseases'} 
                onClick={() => setActiveTab('weather_diseases')} 
                label={t("Weather and Diseases")} 
              />
              <NavButton 
                active={activeTab === 'market'} 
                onClick={() => setActiveTab('market')} 
                label={t("Marketplace")} 
              />
            </nav>



          <div className="h-6 w-px bg-white/40" />

          <div className="flex items-center gap-4">
            {}
            <div className="flex items-center gap-3 w-64 relative">
              <Search className="w-4 h-4 text-white absolute left-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'dashboard') {
                    setActiveTab('dashboard');
                  }
                }}
                placeholder={t("Search plants...")} 
                className="w-full bg-white/20 border border-white/30 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-white focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all"
              />
            </div>
            
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#1b7c43] relative z-50 shrink-0 shadow-md">
        <div 
          onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <Leaf className="w-6 h-6 text-white" />
          <span className="font-bold text-white tracking-tight">Cropmate</span>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-1 text-white hover:text-emerald-100 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[57px] left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm z-40">
          <div className="bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            <MobileDropdownButton 
              active={activeTab === 'home'} 
              onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} 
              icon={<Home className="w-5 h-5" />} 
              label={t("Home Overview")}
            />
            <MobileDropdownButton 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label={t("Dashboard History")}
            />
            <MobileDropdownButton 
              active={activeTab === 'scanner'} 
              onClick={() => { setActiveTab('scanner'); setIsMobileMenuOpen(false); }} 
              icon={<ScanLine className="w-5 h-5" />} 
              label={t("Scan / Upload")}
            />
            <MobileDropdownButton 
              active={activeTab === 'chatbot'} 
              onClick={() => { setActiveTab('chatbot'); setIsMobileMenuOpen(false); }} 
              icon={<MessageSquare className="w-5 h-5" />} 
              label={t("AI Advisor")}
            />
             <MobileDropdownButton 
               active={activeTab === 'resources'} 
               onClick={() => { setActiveTab('resources'); setIsMobileMenuOpen(false); }} 
               icon={<Library className="w-5 h-5" />} 
               label={t("Resources")}
             />
             <MobileDropdownButton 
               active={activeTab === 'weather_diseases'} 
               onClick={() => { setActiveTab('weather_diseases'); setIsMobileMenuOpen(false); }} 
               icon={<Map className="w-5 h-5" />} 
               label={t("Weather and Diseases")} 
             />
             <MobileDropdownButton 
               active={activeTab === 'market'} 
               onClick={() => { setActiveTab('market'); setIsMobileMenuOpen(false); }} 
               icon={<ShoppingBag className="w-5 h-5" />} 
               label={t("Marketplace")}
             />

             
             <div className="mt-4 pt-4 border-t border-slate-200">

               {}
              <div className="flex items-center gap-3 w-full relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'dashboard') {
                      setActiveTab('dashboard');
                    }
                  }}
                  placeholder={t("Search plants by name in dashboard...")} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1b7c43]/40"
                />
              </div>
              
              {}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-[#1b7c43]/25 flex items-center justify-center text-xs font-bold text-[#1b7c43] border border-[#1b7c43]/30">
                  U
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-800 truncate">{t("User Account")}</p>
                  <p className="text-[11px] text-slate-500 truncate">{t("Local Session")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {}
        <main className="flex-1 pt-4 md:pt-8 overflow-hidden max-w-7xl w-full mx-auto relative z-10 flex flex-col">
          <div ref={mainRef} className="flex-1 p-4 md:p-8 overflow-y-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="w-full h-full"
              >
                {activeTab === 'home' && <HomepageTab onNavigate={(tab) => setActiveTab(tab)} />}
                {activeTab === 'dashboard' && <DashboardTab searchQuery={searchQuery} onFollowUp={(scan) => { setReferenceScanForFollowUp(scan); setActiveTab('scanner'); }} />}
                {activeTab === 'scanner' && <ScannerTab referenceScan={referenceScanForFollowUp} onScanComplete={() => { setActiveTab('dashboard'); setReferenceScanForFollowUp(null); }} />}
                 {activeTab === 'chatbot' && <ChatbotTab />}
                  {activeTab === 'resources' && <ResourcesTab />}
                  {activeTab === 'weather_diseases' && <WeatherDiseasesTab />}
                  {activeTab === 'market' && <MarketTab />}
                </motion.div>

             </AnimatePresence>

          </div>
        </main>
    </div>
  );
}

function NavButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative px-4 py-2 rounded-xl transition-colors duration-200 cursor-pointer text-sm font-semibold select-none z-10 ${
        active ? 'text-white' : 'text-white hover:text-white'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.12)] rounded-xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {label}
    </button>
  );
}

function MobileDropdownButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all w-full text-left cursor-pointer ${
        active 
          ? 'text-white bg-[#1b7c43]/15 border border-[#1b7c43]/20 font-bold' 
          : 'text-slate-400 font-medium hover:bg-white/5'
      }`}
    >
      <div className={active ? 'text-[#1b7c43]' : ''}>
        {icon}
      </div>
      <span className="text-base">{label}</span>
    </button>
  );
}

export default App;
