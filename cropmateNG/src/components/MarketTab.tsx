import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Tag, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trash2, 
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import { marketService } from '../services/marketService';
import type { CropListing, MarketTrend } from '../services/marketService';
import { useLanguage } from '../contexts/LanguageContext';

const MarketTab: React.FC = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newListing, setNewListing] = useState({
    farmerName: '',
    cropType: '',
    quantity: '',
    unit: 'kg',
    price: '',
    priceUnit: 'kg',
    location: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await marketService.getListings();
    setListings(data);
    setTrends(marketService.getMarketTrends());
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketService.addListing({
        farmerName: newListing.farmerName,
        cropType: newListing.cropType,
        quantity: parseFloat(newListing.quantity),
        unit: newListing.unit,
        price: parseFloat(newListing.price),
        priceUnit: newListing.priceUnit,
        location: newListing.location,
      });
      setNewListing({ farmerName: '', cropType: '', quantity: '', unit: 'kg', price: '', priceUnit: 'kg', location: '' });
      setIsAdding(false);
      await loadData();
    } catch (error) {
      console.error("Failed to add listing", error);
    }
  };

  const handleRemoveListing = async (id: string) => {
    await marketService.removeListing(id);
    await loadData();
  };

  const filteredListings = listings.filter(l => 
    l.cropType.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#1b7c43]" />
          {t("Crop Marketplace")}
        </h2>
        <p className="text-slate-500">{t("Buy and sell healthy crops directly from farmers")}</p>
      </div>

      {/* Market Trends Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          {t("Market Trends (Guidance)")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {trends.map((trend, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-600">{trend.crop}</span>
              <span className="text-lg font-bold text-slate-800">₹{trend.currentPrice}/{trend.unit}</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                trend.trend === 'increasing' ? 'text-emerald-600' : 
                trend.trend === 'decreasing' ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {trend.trend === 'increasing' && <TrendingUp className="w-3 h-3" />}
                {trend.trend === 'decreasing' && <TrendingDown className="w-3 h-3" />}
                {trend.trend === 'stable' && <Minus className="w-3 h-3" />}
                {trend.changePercent}%
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Listings Feed */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t("Search crops or farmers...")}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={listing.id}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-[#1b7c43]/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                          {listing.cropType[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{listing.cropType}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {listing.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#1b7c43]">₹{listing.price}/{listing.priceUnit}</div>
                        <div className="text-xs text-slate-400">{listing.quantity} {listing.unit} available</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          {listing.farmerName[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-slate-600">{listing.farmerName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRemoveListing(listing.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          title={t("Remove Listing")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1b7c43] text-white text-xs font-bold hover:bg-emerald-700 transition-all">
                          {t("Contact")} <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t("No crop listings found")}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Listing Sidebar/Panel */}
        <div className="w-full md:w-80 shrink-0">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-full py-4 rounded-2xl bg-[#1b7c43] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all mb-6"
          >
            {isAdding ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? t("Cancel Posting") : t("Post Healthy Crop")}
          </button>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
              >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#1b7c43]" />
                  {t("Create Listing")}
                </h3>
                <form onSubmit={handleAddListing} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">{t("Farmer Name")}</label>
                    <input 
                      required
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                      value={newListing.farmerName}
                      onChange={e => setNewListing({...newListing, farmerName: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">{t("Crop Type")}</label>
                    <input 
                      required
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                      value={newListing.cropType}
                      onChange={e => setNewListing({...newListing, cropType: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">{t("Quantity")}</label>
                      <input 
                        required
                        type="number"
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                        value={newListing.quantity}
                        onChange={e => setNewListing({...newListing, quantity: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">{t("Unit")}</label>
                      <select 
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                        value={newListing.unit}
                        onChange={e => setNewListing({...newListing, unit: e.target.value})}
                      >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                        <option value="ton">ton</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">{t("Price")}</label>
                      <input 
                        required
                        type="number"
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                        value={newListing.price}
                        onChange={e => setNewListing({...newListing, price: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">{t("Price Unit")}</label>
                      <select 
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                        value={newListing.priceUnit}
                        onChange={e => setNewListing({...newListing, priceUnit: e.target.value})}
                      >
                        <option value="kg">per kg</option>
                        <option value="quintal">per quintal</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">{t("Location")}</label>
                    <input 
                      required
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b7c43]/20 transition-all text-sm"
                      value={newListing.location}
                      onChange={e => setNewListing({...newListing, location: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="mt-2 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm hover:bg-emerald-200 transition-all"
                  >
                    {t("Post Listing")}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MarketTab;
