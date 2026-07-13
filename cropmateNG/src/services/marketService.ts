export interface CropListing {
  id: string;
  farmerName: string;
  cropType: string;
  quantity: number;
  unit: string;
  price: number;
  priceUnit: string;
  location: string;
  imageUrl?: string;
  timestamp: number;
}

export interface MarketTrend {
  crop: string;
  currentPrice: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}

const STORAGE_KEY = 'cropmate_market_listings';

export const marketService = {
  getListings: async (): Promise<CropListing[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addListing: async (listing: Omit<CropListing, 'id' | 'timestamp'>): Promise<CropListing> => {
    const listings = await marketService.getListings();
    const newListing: CropListing = {
      ...listing,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...listings, newListing]));
    return newListing;
  },

  removeListing: async (id: string): Promise<void> => {
    const listings = await marketService.getListings();
    const filtered = listings.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getMarketTrends: (): MarketTrend[] => {
    // Simulated trends based on OLDMATE data
    return [
      { crop: 'Rice', currentPrice: 2800, unit: 'quintal', trend: 'increasing', changePercent: 5.2 },
      { crop: 'Wheat', currentPrice: 2200, unit: 'quintal', trend: 'stable', changePercent: 1.8 },
      { crop: 'Maize', currentPrice: 1800, unit: 'quintal', trend: 'increasing', changePercent: 6.2 },
      { crop: 'Cotton', currentPrice: 6500, unit: 'quintal', trend: 'decreasing', changePercent: -3.5 },
      { crop: 'Sugarcane', currentPrice: 315, unit: 'quintal', trend: 'increasing', changePercent: 4.8 },
    ];
  }
};
