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

interface StatePath {
  id: string;
  name: string;
  path: string;
  centerX: number;
  centerY: number;
}

const INDIA_OUTLINE_PATH = "M 190 30 L 205 28 L 212 35 L 210 50 L 200 58 L 204 75 L 214 82 L 230 85 L 235 95 L 255 100 L 260 110 L 290 112 L 305 135 L 300 145 L 315 150 L 325 140 L 350 142 L 375 148 L 380 158 L 368 166 L 368 175 L 350 172 L 340 180 L 345 195 L 330 200 L 328 188 L 318 186 L 312 198 L 298 200 L 295 220 L 285 230 L 282 245 L 268 260 L 260 280 L 252 300 L 238 325 L 226 355 L 222 375 L 208 388 L 198 389 L 194 372 L 188 350 L 184 330 L 180 310 L 175 290 L 165 270 L 158 245 L 164 230 L 154 218 L 148 215 L 145 200 L 130 205 L 122 195 L 105 190 L 100 175 L 115 160 L 128 158 L 132 145 L 124 135 L 120 120 L 128 105 L 148 95 L 168 93 L 175 80 Z";

// Detailed India Map Paths
const INDIA_STATES: StatePath[] = [
  { id: 'punjab', name: 'Punjab', path: 'M 175 85 C 180 80, 185 80, 190 83 C 193 88, 195 93, 195 97 C 190 100, 185 102, 178 100 C 172 98, 172 90, 175 85 Z', centerX: 185, centerY: 93 },
  { id: 'haryana', name: 'Haryana', path: 'M 183 101 C 188 99, 193 98, 197 96 C 202 100, 201 108, 203 113 C 196 117, 193 113, 188 112 C 183 110, 180 105, 183 101 Z', centerX: 191, centerY: 106 },
  { id: 'gujarat', name: 'Gujarat', path: 'M 105 170 C 115 165, 125 160, 135 158 C 145 165, 148 178, 150 188 C 143 192, 146 205, 138 210 C 130 215, 120 208, 125 200 C 123 198, 115 200, 113 193 C 110 190, 103 192, 105 170 Z', centerX: 125, centerY: 185 },
  { id: 'rajasthan', name: 'Rajasthan', path: 'M 125 120 C 135 110, 150 105, 174 101 C 180 107, 183 118, 186 126 C 180 138, 183 148, 175 155 C 158 158, 142 155, 132 145 C 122 135, 120 125, 125 120 Z', centerX: 153, centerY: 132 },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', path: 'M 176 158 C 190 152, 215 150, 235 158 C 248 162, 252 175, 255 188 C 245 195, 235 202, 218 200 C 205 205, 190 200, 180 188 C 172 180, 172 165, 176 158 Z', centerX: 205, centerY: 179 },
  { id: 'maharashtra', name: 'Maharashtra', path: 'M 152 191 C 165 190, 180 191, 192 201 C 215 203, 235 205, 245 215 C 248 230, 242 255, 230 265 C 210 262, 195 258, 178 255 C 165 250, 160 230, 155 220 C 150 210, 148 200, 152 191 Z', centerX: 195, centerY: 225 },
  { id: 'west-bengal', name: 'West Bengal', path: 'M 285 170 C 290 162, 298 155, 302 145 C 306 158, 308 175, 305 190 C 298 195, 302 205, 295 215 C 288 218, 285 205, 288 195 C 282 188, 280 180, 285 170 Z', centerX: 295, centerY: 182 },
  { id: 'assam', name: 'Assam', path: 'M 320 155 C 335 150, 355 148, 370 152 C 375 158, 370 168, 360 172 C 350 170, 345 175, 335 170 C 325 168, 320 162, 320 155 Z', centerX: 345, centerY: 161 },
  { id: 'tamil-nadu', name: 'Tamil Nadu', path: 'M 193 329 C 205 330, 215 338, 222 350 C 220 365, 215 382, 206 394 C 202 394, 198 385, 197 375 C 192 355, 190 340, 193 329 Z', centerX: 207, centerY: 361 },
  { id: 'kerala', name: 'Kerala', path: 'M 183 328 C 188 332, 190 345, 194 360 C 197 370, 199 385, 197 395 C 193 395, 192 385, 188 370 C 184 355, 180 340, 183 328 Z', centerX: 188, centerY: 361 },
];

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
              <svg viewBox="0 0 400 400" className="w-full max-w-[360px] h-auto drop-shadow-xl">
                <defs>
                  <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                  </radialGradient>
                </defs>
                
                {/* Background Grid */}
                <rect width="100%" height="100%" fill="#f8fafc" />

                {/* Base Outline of India Map */}
                <path 
                  d={INDIA_OUTLINE_PATH} 
                  className="fill-slate-200/50 stroke-slate-300 stroke-[1.5] transition-all" 
                />

                {/* Districts */}
                {INDIA_STATES.map((state) => {
                  const isSelected = selectedStateId === state.id;
                  const weather = weatherStates.find(s => s.stateId === state.id)?.weather;
                  
                  // Determine color based on weather
                  let baseColor = 'fill-slate-300/80 stroke-slate-400/40';
                  if (weather) {
                    if (weather.condition === 'rainy' || weather.condition === 'stormy') baseColor = 'fill-blue-400/30 stroke-blue-500/50';
                    else if (weather.condition === 'sunny' && weather.temperature > 35) baseColor = 'fill-orange-400/30 stroke-orange-500/50';
                    else if (weather.condition === 'humid') baseColor = 'fill-emerald-400/25 stroke-emerald-500/50';
                  }

                  return (
                    <g key={state.id} className="cursor-pointer group" onClick={() => handleStateClick(state.id)}>
                      <path 
                        d={state.path} 
                        className={`transition-all duration-300 stroke-[1.5] ${baseColor} ${isSelected ? 'stroke-emerald-600 stroke-[2] fill-emerald-500/40' : 'group-hover:fill-slate-400/60'}`} 
                      />
                      <text 
                        x={state.centerX} 
                        y={state.centerY}
                        textAnchor="middle"
                        className={`text-[8px] font-extrabold pointer-events-none select-none transition-colors ${isSelected ? 'fill-emerald-950 font-black' : 'fill-slate-600 group-hover:fill-slate-800'}`}
                      >
                        {state.name}
                      </text>
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
