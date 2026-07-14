import { useState } from 'react';
import { Play, Pause, Thermometer, Droplets, Wind, AlertTriangle, X } from 'lucide-react';

interface DiseaseSimulatorProps {
  imageUrl: string;
  diseaseName: string;
  onClose: () => void;
}

export default function DiseaseSimulator({ imageUrl, diseaseName, onClose }: DiseaseSimulatorProps) {
  const [day, setDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  
  const weatherData = Array.from({ length: 15 }).map((_, i) => ({
    temp: 22 + Math.sin(i) * 5,
    humidity: 60 + (i / 14) * 35,
    wind: 5 + Math.random() * 10,
    status: i < 3 ? "Incubation Phase" : i < 7 ? "Rapid Spore Growth" : i < 11 ? "Severe Necrosis" : "Terminal Wilting"
  }));

  const currentW = weatherData[day];

  
  const getNecrosisStyle = (d: number) => {
    const progress = d / 14;
    return {
      filter: `sepia(${progress * 80}%) saturate(${100 - progress * 80}%) brightness(${100 - progress * 40}%) hue-rotate(${progress * 25}deg)`,
      transition: 'filter 0.5s ease',
    };
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (day === 14) setDay(0);
      setIsPlaying(true);
      
      const interval = setInterval(() => {
        setDay(prev => {
          if (prev >= 14) {
            clearInterval(interval);
            setIsPlaying(false);
            return 14;
          }
          return prev + 1;
        });
      }, 800); 
      
      
      (window as any)._simulatorInterval = interval;
    }
  };

  const handleClose = () => {
    if ((window as any)._simulatorInterval) {
      clearInterval((window as any)._simulatorInterval);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
        
        {}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Predictive Spread Simulation
            </h2>
            <p className="text-xs text-slate-500">Forecasting {diseaseName} trajectory based on local 14-day weather projections.</p>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-250 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-6 bg-slate-50/50">
          
          {}
          <div className="md:col-span-2 relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner">
            <img 
              src={imageUrl} 
              alt="Plant Simulation" 
              className="w-full h-full object-contain"
              style={getNecrosisStyle(day)}
            />
            
            {}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-500"
              style={{
                background: `radial-gradient(circle, transparent ${100 - (day/14)*60}%, rgba(80, 40, 10, ${ (day/14) * 0.8 }) 100%)`
              }}
            />
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white">
              DAY {day}
            </div>
            
            {day > 7 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in">
                <div className="text-red-500/80 font-black text-4xl rotate-12 uppercase tracking-widest mix-blend-overlay">
                  CRITICAL SPREAD
                </div>
              </div>
            )}
          </div>

          {}
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-4 bg-white border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Environmental Forecast</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-650">
                    <Thermometer className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{currentW.temp.toFixed(1)}°C</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-655">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Humidity</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{currentW.humidity.toFixed(0)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-650">
                    <Wind className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">Wind Spd</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{currentW.wind.toFixed(1)} km/h</span>
                </div>
              </div>
            </div>

            <div className={`glass-panel p-4 border transition-colors flex-1 ${day > 7 ? 'bg-red-50 border-red-150' : 'bg-emerald-50 border-emerald-100'}`}>
              <h3 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Disease Status</h3>
              <p className={`text-lg font-bold ${day > 7 ? 'text-red-650 animate-pulse' : 'text-emerald-700'}`}>{currentW.status}</p>
              
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {day < 4 ? "Fungal spores are establishing colonies but macroscopic symptoms are minimal." 
                : day < 10 ? "High humidity is accelerating mycelial growth, causing visible necrotic lesions and chlorosis." 
                : "The infection has breached vascular tissue, restricting water flow and causing terminal wilt."}
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 border-t border-slate-150 bg-slate-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-md shrink-0 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-1" />}
            </button>
            
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-500 font-bold mb-2">
                <span>Today</span>
                <span>Day 7</span>
                <span>Day 14</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="14" 
                value={day} 
                onChange={(e) => {
                  setDay(parseInt(e.target.value));
                  if (isPlaying) {
                    setIsPlaying(false);
                    clearInterval((window as any)._simulatorInterval);
                  }
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
