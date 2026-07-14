import { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import type { ScanResult } from '../services/storageService';
import { Leaf, Shield, LineChart, Cpu, ArrowRight, ScanLine, LayoutDashboard, MessageSquare, Map } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomepageTabProps {
  onNavigate: (tab: 'home' | 'dashboard' | 'scanner' | 'chatbot' | 'resources' | 'weather_diseases') => void;
}

export default function HomepageTab({ onNavigate }: HomepageTabProps) {
  const { t } = useLanguage();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.getScans().then(data => {
      setScans(data.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  const diseasedCount = scans.filter(s => s.isDiseased).length;
  const healthyCount = scans.length - diseasedCount;
  const overallHealth = scans.length > 0 ? Math.round((healthyCount / scans.length) * 100) : 100;
  const latestScan = scans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
         {}
         <div className="lg:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-between space-y-6">
           <div className="space-y-4">
             <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950 leading-tight" dangerouslySetInnerHTML={{
               __html: t("Smarter plant insights.<br />Faster care decisions.")
             }} />
             <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
               {t("Cropmate combines image classification, plant pathogen identification, and LLM-driven remediation advice to help gardeners and indoor growers detect stresses early, organize watering cycles, and maximize crop health. Upload your capture or run a live webcam scan — your garden data stays cached locally and secure.")}
             </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
             <div className="flex gap-3">
               <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-100/60 h-fit">
                 <ScanLine className="w-4 h-4" />
               </div>
               <div>
                 <h4 className="text-xs font-bold text-slate-800 mb-0.5">{t("Upload or Scan")}</h4>
                 <p className="text-[10px] text-slate-500">{t("Dual camera support and fast local image uploads.")}</p>
               </div>
             </div>
             <div className="flex gap-3">
               <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-100/60 h-fit">
                 <Shield className="w-4 h-4" />
               </div>
               <div>
                 <h4 className="text-xs font-bold text-slate-800 mb-0.5">{t("Data Privacy")}</h4>
                 <p className="text-[10px] text-slate-500">{t("Encrypted in browser storage with local caching.")}</p>
               </div>
             </div>
             <div className="flex gap-3">
               <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-100/60 h-fit">
                 <LineChart className="w-4 h-4" />
               </div>
               <div>
                 <h4 className="text-xs font-bold text-slate-800 mb-0.5">{t("Actionable Metrics")}</h4>
                 <p className="text-[10px] text-slate-500">{t("Detailed watering, sunlight, and temp requirements.")}</p>
               </div>
             </div>
             <div className="flex gap-3">
               <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-100/60 h-fit">
                 <Cpu className="w-4 h-4" />
               </div>
               <div>
                 <h4 className="text-xs font-bold text-slate-800 mb-0.5">{t("Fast Insights")}</h4>
                 <p className="text-[10px] text-slate-500">{t("Powered by the Gemini 3.1 Flash model.")}</p>
               </div>
             </div>
           </div>

           <div className="flex flex-wrap gap-3 pt-2">
             <button onClick={() => onNavigate('scanner')} className="glass-button-primary text-xs font-semibold py-2.5 flex items-center gap-1.5">
               <span>{t("Get started — Upload a scan")}</span>
               <ArrowRight className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => onNavigate('chatbot')} className="glass-button text-xs font-medium py-2.5">
               {t("Chat with AI Advisor")}
             </button>
           </div>
         </div>


        {}
        <div className="flex flex-col gap-4">
          <QuickNavCard 
            title={t("Dashboard Overview")} 
            desc={t("Examine health metrics & past scans history")} 
            actionText={t("Open Dashboard")}
            icon={<LayoutDashboard className="w-5 h-5 text-emerald-700" />} 
            onClick={() => onNavigate('dashboard')} 
          />
          <QuickNavCard 
            title={t("Scan / Upload")} 
            desc={t("Capture plant image for AI analysis")} 
            actionText={t("Run Scanner")}
            icon={<ScanLine className="w-5 h-5 text-emerald-700" />} 
            onClick={() => onNavigate('scanner')} 
          />
          <QuickNavCard 
            title={t("AI Advisor")} 
            desc={t("Query treatments with context of past diagnostics")} 
            actionText={t("Consult Gemini")}
            icon={<MessageSquare className="w-5 h-5 text-emerald-700" />} 
            onClick={() => onNavigate('chatbot')} 
          />
           <QuickNavCard 
             title={t("Weather and Diseases")} 
             desc={t("View weather-driven disease predictions and alerts")} 
             actionText={t("View Insights")}
             icon={<Map className="w-5 h-5 text-emerald-700" />} 
             onClick={() => onNavigate('weather_diseases')} 
           />

        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
         {}
         <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-fit">
            <div className="glass-panel p-5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">{t("Total Scans")}</span>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-0.5">{scans.length}</h3>
                <p className="text-[10px] text-slate-400">{t("Since account activation")}</p>
              </div>
            </div>
            <div className="glass-panel p-5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">{t("Crop Health Index")}</span>
              <div>
                <h3 className="text-3xl font-extrabold text-emerald-700 text-glow mb-0.5">{overallHealth}% {t("Healthy")}</h3>
                <p className="text-[10px] text-slate-400">{diseasedCount} {t("plants showing stress factors")}</p>
              </div>
            </div>
            <div className="glass-panel p-5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">{t("Last Active Scan")}</span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 truncate mb-0.5">{latestScan ? latestScan.name : t("No scans")}</h3>
                <p className="text-[10px] text-slate-400">{latestScan ? new Date(latestScan.timestamp).toLocaleDateString() : t("Never")}</p>
              </div>
            </div>
             <div className="glass-panel p-5 flex flex-col justify-between border-red-100 hover:border-red-300 cursor-pointer" onClick={() => onNavigate('weather_diseases')}>
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 block">{t("Nearby Weather Alerts")}</span>
               <div>
                 <h3 className="text-3xl font-extrabold text-red-600 mb-0.5">5 {t("Alerts")}</h3>
                 <p className="text-[10px] text-red-400 font-semibold">{t("Active weather-based threats")}</p>
               </div>
             </div>

          </div>

         {}
         <div className="lg:col-span-4 glass-panel p-4 flex flex-col gap-3">
           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t("Latest capture")}</span>
           {latestScan ? (
             <div className="space-y-2">
               <div className="rounded-lg overflow-hidden border border-slate-100 aspect-video bg-slate-100">
                 <img src={latestScan.imageUrl} alt={latestScan.name} className="w-full h-full object-cover" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-800">{latestScan.name}</p>
                 <p className="text-[9px] text-slate-400">Captured: {new Date(latestScan.timestamp).toLocaleDateString()} • Confidence: {Math.round(latestScan.confidence * 100)}%</p>
               </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg min-h-[140px]">
               <Leaf className="w-6 h-6 text-slate-300 mb-2" />
               <p className="text-xs text-slate-400">No plant images captured yet.</p>
             </div>
           )}
         </div>
       </div>


       {}
       <div className="glass-panel p-5 space-y-4">
         <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500">{t("Recent Account Activity")}</h3>
         <div className="flex flex-col gap-2.5">
           {scans.length === 0 ? (
             <p className="text-xs text-slate-400">{t("No recent activity logged.")}</p>
           ) : (
             scans.slice(0, 3).map((scan) => (
               <div key={scan.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-b-0">
                 <div className="flex items-center gap-3 min-w-0">
                   <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100/60 flex items-center justify-center shrink-0">
                     <Leaf className="w-4 h-4 text-emerald-700" />
                   </div>
                   <div className="min-w-0">
                     <p className="font-bold text-slate-800 truncate">{t("Diagnosis")}: {scan.name}</p>
                     <p className="text-[10px] text-slate-500">{t("Status resolved")} • {scan.isDiseased ? t("Attention Required") : t("Healthy")}</p>
                   </div>
                 </div>
                 <div className="text-right shrink-0">
                   <span className={`text-[10px] px-2 py-0.5 rounded-full border ${scan.isDiseased ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                     {scan.isDiseased ? t("Attention Required") : t("Healthy")}
                   </span>
                   <p className="text-[9px] text-slate-500 mt-1">{new Date(scan.timestamp).toLocaleDateString()}</p>
                 </div>
               </div>
             ))
           )}
         </div>
       </div>


    </div>
  );
}

interface QuickNavCardProps {
  title: string;
  desc: string;
  actionText: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function QuickNavCard({ title, desc, actionText, icon, onClick }: QuickNavCardProps) {
  return (
    <div className="glass-panel p-4 flex items-center justify-between bg-white border border-emerald-100/50 hover:border-emerald-300 transition-all cursor-pointer group" onClick={onClick}>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100/60 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-800 truncate mb-0.5 group-hover:text-emerald-700 transition-colors">{title}</h4>
          <p className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-[320px]">{desc}</p>
        </div>
      </div>
      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 whitespace-nowrap opacity-75 group-hover:opacity-100 transition-opacity">
        {actionText}
        <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </div>
  );
}
