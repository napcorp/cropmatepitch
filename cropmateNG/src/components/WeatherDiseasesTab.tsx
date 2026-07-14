import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Map as MapIcon, 
  AlertTriangle, 
  ShieldAlert, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Info, 
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { weatherService } from '../services/weatherService';
import type { StateWeather } from '../services/weatherService';
import { aiService } from '../services/aiService';

interface WeatherPrediction {
  disease: string;
  probability: number;
  reasoning: string;
}

import indiaMap from '../indiaMap';

export default function WeatherDiseasesTab() {
  const { t } = useLanguage();
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [weatherStates, setWeatherStates] = useState<StateWeather[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [insight, setInsight] = useState<{ summary: string, predictions: WeatherPrediction[] } | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [alerts, setAlerts] = useState<{ type: 'high' | 'medium' | 'low', message: string }[]>([]);

  useEffect(() => {
    weatherService.getAllStatesWeather().then(states => {
      setWeatherStates(states);
      setLoadingWeather(false);
      
      // Mock alerts based on states
      setAlerts([
        { type: 'high', message: t("High risk of Fungal Infection in Kerala due to heavy rainfall.") },
        { type: 'medium', message: t("Increased Wheat Rust risk in Punjab.") },
      ]);
    });
  }, [t]);

  const handleStateClick = async (stateId: string) => {
    setSelectedStateId(stateId);
    setInsight(null);
    setLoadingInsight(true);

    const stateWeather = weatherStates.find(s => s.stateId === stateId)?.weather;
    if (stateWeather) {
      try {
        const prediction = await aiService.predictDiseasesFromWeather(
          stateId, 
          stateWeather, 
          'English'
        );
        setInsight(prediction);
      } catch (err) {
        console.error(err);
      }
    }
    setLoadingInsight(false);
  };

  const selectedState = weatherStates.find(s => s.stateId === selectedStateId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-20 translate-x-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold tracking-wider uppercase mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              {t("Biosecurity & Weather Insights")}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t("Weather and Disease Prediction")}</h2>
            <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed max-w-xl">
              {t("Real-time monitoring of weather patterns across India to predict potential crop disease outbreaks. Select a state for detailed AI-driven risk analysis.")}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-3">
          {alerts.map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-xl border flex items-start gap-3 ${
                alert.type === 'high' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.type === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
              <p className="text-[11px] font-semibold leading-snug">{alert.message}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Section */}
        <div className="lg:col-span-7 glass-panel p-5 bg-white flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">{t("India Regional Risk Map")}</h3>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> {t("Rain")}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> {t("Heat")}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {t("Disease Risk")}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
            {loadingWeather ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">{t("Loading Map Data...")}</p>
              </div>
            ) : (
              <svg viewBox={indiaMap.viewBox} className="w-full max-w-[420px] h-auto drop-shadow-xl" strokeLinejoin="round" strokeLinecap="round">
                <defs>
                  <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                  </radialGradient>
                </defs>
                
                {/* Background Grid */}
                <rect width="100%" height="100%" fill="#f8fafc" />

                {/* States */}
                {indiaMap.locations.map((state) => {
                  const isSelected = selectedStateId === state.id;
                  const weather = weatherStates.find(s => s.stateId === state.id)?.weather;
                  
                  // Determine color based on weather
                  let baseColor = 'fill-slate-300/80 stroke-white/80';
                  if (weather) {
                    if (weather.condition === 'rainy' || weather.condition === 'stormy') baseColor = 'fill-blue-400/80 stroke-blue-200/50';
                    else if (weather.condition === 'sunny' && weather.temperature > 35) baseColor = 'fill-orange-400/80 stroke-orange-200/50';
                    else if (weather.condition === 'humid') baseColor = 'fill-emerald-400/80 stroke-emerald-200/50';
                    else baseColor = 'fill-amber-400/80 stroke-amber-200/50';
                  }

                  return (
                    <g key={state.id} className="cursor-pointer group" onClick={() => handleStateClick(state.id)}>
                      <path 
                        d={state.path} 
                        className={`transition-all duration-300 stroke-[0.8] ${baseColor} ${isSelected ? 'stroke-emerald-900 stroke-[1.5] fill-emerald-500' : 'group-hover:opacity-80'}`} 
                      >
                        <title>{state.name}</title>
                      </path>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Insight Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-6 bg-white flex-1 flex flex-col min-h-[500px]">
            {!selectedState ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-300">
                  <MapIcon className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{t("Select a Region")}</h3>
                <p className="text-xs text-slate-500 mt-2">{t("Click on a state in the map to view its current weather conditions and predicted disease risks.")}</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    {t("Selected Region")}
                  </span>
                  <h3 className="text-xl font-extrabold text-emerald-950 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    {selectedState.name}
                  </h3>
                </div>

                {/* Weather Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-800">{selectedState.weather?.temperature}°C</p>
                    <p className="text-[8px] text-slate-400 uppercase">{t("Temp")}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-800">{selectedState.weather?.humidity}%</p>
                    <p className="text-[8px] text-slate-400 uppercase">{t("Humidity")}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <CloudRain className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-800">{selectedState.weather?.rainfall}mm</p>
                    <p className="text-[8px] text-slate-400 uppercase">{t("Rainfall")}</p>
                  </div>
                </div>

                {/* Insight Content */}
                <div className="flex-1 space-y-6">
                  {loadingInsight ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                      <p className="text-xs font-medium text-slate-500">{t("AI generating risk analysis...")}</p>
                    </div>
                  ) : insight ? (
                    <>
                      <div>
                        <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-3">{t("Risk Summary")}</h4>
                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800 leading-relaxed">
                          {insight.summary}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-3">{t("Predicted Threats")}</h4>
                        <div className="space-y-3">
                          {insight.predictions.map((p, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-800">{p.disease}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.probability > 0.7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {Math.round(p.probability * 100)}%
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 leading-snug">{p.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl min-h-[160px]">
                      <Info className="w-6 h-6 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400">{t("No prediction data available for this region.")}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
