import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, AlertCircle, Sliders, Droplets, Wind, Eye, ShoppingBag } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { shoppingService } from '../services/shoppingService';
import ProductSuggestions from './ProductSuggestions';
import type { ScanResult } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';

import { useEffect } from 'react';

export default function ScannerTab({ onScanComplete, referenceScan }: { onScanComplete: () => void, referenceScan?: ScanResult }) {
  const { currentLanguage, t } = useLanguage();
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Omit<ScanResult, 'id' | 'timestamp' | 'imageUrl'> | null>(null);
  const [visualFilter, setVisualFilter] = useState<'raw' | 'stress' | 'mask'>('raw');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [quality, setQuality] = useState<'1080p' | '720p'>('1080p');
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  useEffect(() => {
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const video = devices.filter(d => d.kind === 'videoinput');
          setVideoDevices(video);
          if (video.length > 0) {
            setSelectedDeviceId(video[0].deviceId);
          }
        });
        
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((err) => {
        console.warn("Camera permissions not granted yet, enumerating defaults: ", err);
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const video = devices.filter(d => d.kind === 'videoinput');
          setVideoDevices(video);
        });
      });
  }, []);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setMode('camera');
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: quality === '1080p' ? { ideal: 1920 } : { ideal: 1280 },
          height: quality === '1080p' ? { ideal: 1080 } : { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to access camera. Please ensure permissions are granted.");
      setMode('idle');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
        setMode('preview');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMode('preview');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelPreview = () => {
    setImage(null);
    setResult(null);
    setVisualFilter('raw');
    setMode('idle');
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const aiResult = await aiService.analyzeImage(image, 'image/jpeg', currentLanguage.name);
      setResult(aiResult);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearchProducts = async () => {
    if (!result) return;
    setIsSearchingProducts(true);
    try {
      const searchQuery = (result.shoppingKeywords && result.shoppingKeywords.length > 0)
        ? result.shoppingKeywords.join(' ')
        : `${result.name} remedy`;
      const products = await shoppingService.searchProducts(searchQuery);
      setResult({ ...result, suggestedProducts: products });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  const saveResult = async () => {
    if (result && image) {
      await storageService.saveScan({
        imageUrl: image,
        parentScanId: referenceScan?.id,
        ...result
      });
      onScanComplete();
    }
  };

  
  const getFilterClass = () => {
    if (visualFilter === 'stress') return 'hue-rotate-[90deg] saturate-[2.5] contrast-[1.2] brightness-[0.95]';
    if (visualFilter === 'mask') return 'brightness-[1.2] saturate-[0.25] sepia-[0.35] hue-rotate-[130deg]';
    return '';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

       {mode === 'idle' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {}
           <div className="glass-panel p-6 flex flex-col justify-between bg-white border border-emerald-100/50">
             <div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100/60">
                   <Camera className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800">{t("Live Camera Stream")}</h3>
                   <p className="text-xs text-slate-500">{t("Capture plant snapshots via local video device")}</p>
                 </div>
               </div>
 
               {}
               <div className="space-y-3 my-6">
                 <div>
                   <label className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block mb-1">{t("Source Device")}</label>
                   <select 
                     value={selectedDeviceId}
                     onChange={(e) => setSelectedDeviceId(e.target.value)}
                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
                   >
                     {videoDevices.length === 0 ? (
                       <option value="">{t("Default Camera")}</option>
                     ) : (
                       videoDevices.map(device => (
                         <option key={device.deviceId} value={device.deviceId}>
                           {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                         </option>
                       ))
                     )}
                   </select>
                 </div>
                 <div>
                   <label className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block mb-1">{t("Stream Quality")}</label>
                   <select 
                     value={quality}
                     onChange={(e) => setQuality(e.target.value as '1080p' | '720p')}
                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
                   >
                     <option value="1080p">1080p - High Fidelity (1920x1080)</option>
                     <option value="720p">720p - High Speed (1280x720)</option>
                   </select>
                 </div>
               </div>
             </div>
 
             <button onClick={startCamera} className="glass-button-primary w-full mt-4">
               <Camera className="w-4 h-4" />
               {t("Take Photo")}
             </button>
           </div>
 
           {}
           <div className="glass-panel p-6 flex flex-col justify-between bg-white border border-emerald-100/50 min-h-[300px] relative">
             <input type="file" accept="image/*" id="file-upload" className="hidden" onChange={handleFileUpload} />
             <label htmlFor="file-upload" className="glass-button-primary w-full cursor-pointer justify-center">
               <Upload className="w-4 h-4" />
               {t("Upload Photo")}
             </label>
             {referenceScan && (
               <img 
                 src={referenceScan.imageUrl} 
                 alt="Reference Alignment" 
                 className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen pointer-events-none"
               />
             )}
             
             {referenceScan && (
               <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#10b981]/30 text-[10px] font-bold text-[#10b981] uppercase tracking-widest flex items-center gap-2 animate-pulse">
                 <Camera className="w-3 h-3" /> {t("Alignment Mode Active")}
               </div>
             )}
           </div>
         </div>
       )}
 
       {mode === 'camera' && (
         <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             className="w-full h-full object-cover" 
           />
           <div className="absolute bottom-10 left-0 right-0 p-6 flex justify-between items-center px-10">
             <button 
               onClick={() => { stopCamera(); setMode('idle'); }} 
               className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors text-white border border-white/20 cursor-pointer"
             >
               <X className="w-6 h-6" />
             </button>
             <button 
               onClick={capturePhoto} 
               className="w-20 h-20 border-8 border-white/30 rounded-full bg-white/10 flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform"
             >
               <div className="w-16 h-16 bg-white rounded-full group-hover:bg-emerald-50 transition-colors" />
             </button>
             <div className="w-12" />
           </div>
           <canvas ref={canvasRef} className="hidden" />
         </div>
       )}
 
       {mode === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-2 relative rounded-xl bg-white border border-slate-200">
              <div className="rounded-lg overflow-hidden bg-slate-100 aspect-square">
                <img 
                  src={image!} 
                  alt="Preview" 
                  className={`w-full h-full object-cover transition-all duration-300 ${getFilterClass()}`} 
                />
              </div>
              <button onClick={cancelPreview} className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/85 rounded-full text-white border border-white/5 transition-colors cursor-pointer" disabled={isAnalyzing}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {}
            <div className="glass-panel p-3 bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 mb-2 px-1 text-slate-500">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[10px] uppercase font-bold tracking-wider">{t("Analysis Render Layer")}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button 
                  onClick={() => setVisualFilter('raw')}
                  className={`text-[10px] py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer ${visualFilter === 'raw' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  {t("Normal View")}
                </button>
                <button 
                  onClick={() => setVisualFilter('stress')}
                  className={`text-[10px] py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer ${visualFilter === 'stress' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  {t("Chlorophyll (NDVI)")}
                </button>
                <button 
                  onClick={() => setVisualFilter('mask')}
                  className={`text-[10px] py-1.5 px-2 rounded-lg font-semibold border transition-all cursor-pointer ${visualFilter === 'mask' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  {t("Edge Detection")}
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-7">
            {!result ? (
              <div className="glass-panel p-8 bg-white border border-emerald-100/50 text-center flex flex-col items-center justify-center min-h-[300px]">
                {isAnalyzing ? (
                  <div className="space-y-6 w-full max-w-sm">
                    <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{t("Analyzing plant structure and stress factors...")}</h4>
                      <p className="text-xs text-slate-500">{t("Processing image bands & crop metrics")}</p>
                    </div>
                    {}
                    <div className="h-1 w-full bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-3 bg-emerald-50 rounded-full text-emerald-700 border border-emerald-100/60 inline-block">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{t("Ready for analysis")}</h3>
                      <p className="text-xs text-slate-500">{t("Trigger the Gemma AI engine to analyze details regarding crop name, disease vectors, stats, and remediation.")}</p>
                    </div>
                    <button 
                      onClick={analyzeImage} 
                      className="glass-button-primary w-full max-w-xs py-3 text-sm font-semibold"
                    >
                      {t("Analyze Plant")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel p-6 space-y-6 bg-white border border-emerald-100/50 animate-in fade-in slide-in-from-right-4 duration-300 notranslate">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{result.name}</h3>
                    <p className="text-emerald-700 font-semibold text-xs">{t("Confidence")}: {Math.round(result.confidence * 100)}% Match</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${result.isDiseased ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    {result.isDiseased ? t("Issue Detected") : t("Healthy")}
                  </span>
                </div>

                {result.isDiseased && result.remediation && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4" /> {t("Recommended Remediation")}
                    </h4>
                    <p className="text-xs text-red-800 leading-relaxed">{result.remediation}</p>
                  </div>
                )}

                {result.carePlan && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-amber-700 mb-1 flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" /> {t("Step-by-Step Care Plan")}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Droplets className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 uppercase">{t("Watering")}</p>
                          <p className="text-xs text-amber-900">{result.carePlan.watering}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wind className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 uppercase">{t("Spraying")}</p>
                          <p className="text-xs text-amber-900">{result.carePlan.spraying}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 uppercase">{t("Monitoring")}</p>
                          <p className="text-xs text-amber-900">{result.carePlan.monitoring}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">{t("Growth Guide")}</h4>
                  <p className="text-slate-700 text-xs leading-relaxed">{result.growthGuide}</p>
                </div>

                {result.suggestedProducts && result.suggestedProducts.length > 0 ? (
                  <ProductSuggestions products={result.suggestedProducts} />
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center gap-3">
                    <p className="text-xs text-slate-500 text-center">
                      {t("Find remedy treatments, fertilizers, and tools online.")}
                    </p>
                    <button
                      onClick={handleSearchProducts}
                      disabled={isSearchingProducts}
                      className="glass-button text-xs font-semibold py-2 px-4 flex items-center gap-2"
                    >
                      {isSearchingProducts ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                          <span>{t("Searching products...")}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{t("Search for Products")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm">{t("Requirements")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center text-slate-750">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t("Sunlight")}</span>
                      <span className="text-xs font-semibold text-slate-800">{result.stats?.sunlight || t("Never")}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center text-slate-750">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t("Watering")}</span>
                      <span className="text-xs font-semibold text-slate-800">{result.stats?.water || t("Never")}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center text-slate-750">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t("Temperature")}</span>
                      <span className="text-xs font-semibold text-slate-800">{result.stats?.temperature || t("Never")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-700 mb-1.5 flex items-center gap-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> {t("Fun Fact")}
                  </h4>
                  <p className="text-xs text-emerald-900 leading-relaxed">{result.funFact}</p>
                </div>

                <button onClick={saveResult} className="glass-button-primary w-full py-3.5 text-sm font-semibold mt-4">
                  {t("Save to Garden History")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
