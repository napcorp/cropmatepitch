import { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import type { ScanResult } from '../services/storageService';
import { Activity, Droplets, Sun, Thermometer, AlertTriangle, CheckCircle2, X, Sparkles, FlaskConical, DollarSign, Camera, Play, Wind, Eye, Loader2, ShoppingBag } from 'lucide-react';
import DiseaseSimulator from './DiseaseSimulator';
import ProductSuggestions from './ProductSuggestions';
import { shoppingService } from '../services/shoppingService';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardTabProps {
  searchQuery?: string;
  onFollowUp?: (scan: ScanResult) => void;
}

export default function DashboardTab({ searchQuery = '', onFollowUp }: DashboardTabProps) {
  const { t } = useLanguage();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const handleSearchProducts = async () => {
    if (!selectedScan) return;
    setIsSearchingProducts(true);
    try {
      const searchQuery = (selectedScan.shoppingKeywords && selectedScan.shoppingKeywords.length > 0)
        ? selectedScan.shoppingKeywords.join(' ')
        : `${selectedScan.name} remedy`;
      const products = await shoppingService.searchProducts(searchQuery);
      const updatedScan = await storageService.updateScan(selectedScan.id, { suggestedProducts: products });
      setSelectedScan(updatedScan);
      setScans(scans.map(s => s.id === selectedScan.id ? updatedScan : s));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    const data = await storageService.getScans();
    
    setScans(data.sort((a, b) => b.timestamp - a.timestamp));
    setLoading(false);
  };

  const deleteScan = async (id: string) => {
    await storageService.deleteScan(id);
    loadScans();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  if (scans.length === 0) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
          <Activity className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">{t("No Plants Analyzed Yet")}</h2>
        <p className="text-gray-400 max-w-md">{t("Head over to the Scanner tab to upload or capture an image of your plant and start building your garden profile.")}</p>
      </div>
    );
  }

  const diseasedCount = scans.filter(s => s.isDiseased).length;
  const healthyCount = scans.length - diseasedCount;
  const overallHealth = scans.length > 0 ? Math.round((healthyCount / scans.length) * 100) : 0;

  const filteredScans = scans.filter(scan => 
    scan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden bg-white border border-emerald-100/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t("Total Scans")}</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100/60">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{scans.length}</h3>
            <p className="text-[11px] text-slate-400">{t("Total plant assessments recorded")}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden bg-white border border-emerald-100/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t("Garden Health")}</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-emerald-700 text-glow mb-1">{overallHealth}%</h3>
            <p className="text-[11px] text-slate-400">{t("Of crops are healthy and thriving")}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden bg-white border border-emerald-100/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t("Needs Attention")}</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className={`text-3xl font-extrabold mb-1 ${diseasedCount > 0 ? 'text-red-600 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'text-slate-800'}`}>{diseasedCount}</h3>
            <p className="text-[11px] text-slate-400">{diseasedCount > 0 ? t("Urgent remediation recommended") : t("All plants currently safe")}</p>
          </div>
        </div>
      </div>

      {}
      <h2 className="text-xl font-semibold mt-8 mb-4 px-2">{t("Garden History")}</h2>
      
      {filteredScans.length === 0 && scans.length > 0 ? (
        <div className="glass-panel p-8 text-center text-slate-500 border border-slate-200 bg-white rounded-xl">
          {t("No plants found matching")} "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScans.map((scan) => (
            <div 
              key={scan.id} 
              onClick={() => setSelectedScan(scan)}
              className="glass-panel p-4 flex flex-col sm:flex-row gap-4 relative group cursor-pointer hover:border-[var(--color-primary)]/50 transition-all duration-300 bg-white"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); deleteScan(scan.id); }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Delete scan"
              >
                &times;
              </button>
              <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                <img src={scan.imageUrl} alt={scan.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-slate-800">{scan.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${scan.isDiseased ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    {scan.isDiseased ? t("Issue Detected") : t("Healthy")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{new Date(scan.timestamp).toLocaleDateString()} • {Math.round(scan.confidence * 100)}% Match</p>
                
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">{scan.stats?.sunlight || t("Never")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate">{scan.stats?.water || t("Never")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <Thermometer className="w-3.5 h-3.5 text-red-500" />
                    <span className="truncate">{scan.stats?.temperature || t("Never")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative space-y-6 animate-in zoom-in-95 duration-200 bg-white border border-slate-200 shadow-xl">
            <button 
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 border-b border-slate-100 pb-6">
              <div className="w-full sm:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                <img src={selectedScan.imageUrl} alt={selectedScan.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{selectedScan.name}</h3>
                  <p className="text-[var(--color-primary)] font-semibold">{t("Confidence")}: {Math.round(selectedScan.confidence * 100)}%</p>
                </div>
                <div className="flex flex-col gap-2 mt-4 sm:mt-0">
                  <span className={`px-4 py-2 rounded-xl font-bold text-center border w-fit ${selectedScan.isDiseased ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {selectedScan.isDiseased ? t("Issue Detected") : t("Healthy")}
                  </span>
                  <p className="text-xs text-slate-500">{new Date(selectedScan.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {selectedScan.isDiseased && selectedScan.remediation && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {t("Recommended Remediation")}
                  </h4>
                  <p className="text-sm text-red-800">{selectedScan.remediation}</p>
                </div>
                
                {selectedScan.organicRecipe && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" /> {t("Organic DIY Recipe")}
                    </h4>
                    <p className="text-sm text-emerald-800 opacity-90">{selectedScan.organicRecipe}</p>
                  </div>
                )}

                {selectedScan.suggestedProducts && selectedScan.suggestedProducts.length > 0 ? (
                  <ProductSuggestions products={selectedScan.suggestedProducts} />
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

                {selectedScan.carePlan && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-amber-700 mb-1 flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" /> {t("Step-by-Step Care Plan")}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Droplets className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 uppercase">{t("Watering")}</p>
                          <p className="text-sm text-amber-900">{selectedScan.carePlan.watering}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Wind className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 uppercase">{t("Spraying")}</p>
                          <p className="text-sm text-amber-900">{selectedScan.carePlan.spraying}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-800 uppercase">{t("Monitoring")}</p>
                          <p className="text-sm text-amber-900">{selectedScan.carePlan.monitoring}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedScan.financials && (
                  <div className="glass-panel bg-amber-50/20 border border-amber-100 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="font-semibold text-amber-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <DollarSign className="w-4 h-4" /> {t("Labor-to-Yield Financial Engine")}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                        <p className="text-[10px] text-red-600 font-bold uppercase">{t("Estimated Yield Loss")}</p>
                        <p className="text-xl font-black text-red-700">${selectedScan.financials.lostYieldValue}</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                        <p className="text-[10px] text-emerald-700 font-bold uppercase">{t("Treatment Cost")}</p>
                        <p className="text-xl font-black text-emerald-700">${selectedScan.financials.treatmentCost} <span className="text-xs text-slate-500 font-normal">({selectedScan.financials.laborHours}hrs)</span></p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={() => setShowSimulator(true)}
                    className="flex-1 glass-button-primary bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg"
                  >
                    <Play className="w-4 h-4" /> {t("Simulate 14-Day Spread")}
                  </button>
                  <button 
                    onClick={() => onFollowUp && onFollowUp(selectedScan)}
                    className="flex-1 glass-button bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    <Camera className="w-4 h-4" /> {t("Track Efficacy (Follow-up)")}
                  </button>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">{t("Growth Guide")}</h4>
              <p className="text-slate-700 text-sm leading-relaxed">{selectedScan.growthGuide}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">{t("Requirements")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">{t("Sunlight")}</span>
                  <span className="text-sm font-medium text-slate-800">{selectedScan.stats?.sunlight || t("Never")}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">{t("Water")}</span>
                  <span className="text-sm font-medium text-slate-800">{selectedScan.stats?.water || t("Never")}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">{t("Temp")}</span>
                  <span className="text-sm font-medium text-slate-800">{selectedScan.stats?.temperature || t("Never")}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl p-4">
              <h4 className="font-semibold text-[var(--color-primary)] mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {t("Fun Fact")}
              </h4>
              <p className="text-sm text-emerald-900">{selectedScan.funFact}</p>
            </div>
          </div>
        </div>
      )}
      
      {showSimulator && selectedScan && (
        <DiseaseSimulator 
          imageUrl={selectedScan.imageUrl} 
          diseaseName={selectedScan.name}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}
