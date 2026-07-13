export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  link: string;
}

export interface CarePlan {
  spraying: string;
  watering: string;
  monitoring: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  name: string;
  confidence: number;
  isDiseased: boolean;
  remediation: string | null;
  organicRecipe?: string; 
  shoppingKeywords?: string[];
  suggestedProducts?: Product[];
  carePlan?: CarePlan;
  financials?: {
    treatmentCost: number;
    laborHours: number;
    lostYieldValue: number;
  };
  severityScore?: number; 
  parentScanId?: string; 
  growthGuide: string;
  stats: {
    sunlight: string;
    water: string;
    temperature: string;
  };
  funFact: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  thinking?: string;
  timestamp: number;
}

class StorageService {
  private readonly SCANS_KEY = 'cropmate_scans';
  private readonly CHAT_KEY = 'cropmate_chat';

  

  async getScans(): Promise<ScanResult[]> {
    const data = localStorage.getItem(this.SCANS_KEY);
    const seeded = localStorage.getItem('cropmate_seeded');
    if (!data && !seeded) {
      const initialScans: ScanResult[] = [
        {
          id: 'mock-scan-rose',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
          imageUrl: 'https://images.unsplash.com/photo-1559564485-96756769197d',
          name: 'Rose (Rosa)',
          confidence: 0.94,
          isDiseased: true,
          remediation: 'Apply neem oil spray weekly and remove infected leaves from the soil base to prevent spore splash-back.',
          funFact: 'Roses are closely related to apples, pears, cherries, and plums!',
          stats: {
            sunlight: '6-8 hours daily',
            water: 'Thoroughly once soil is dry',
            temperature: '15-25°C'
          },
          growthGuide: 'Keep soil moist but not waterlogged. Prune regularly to improve air circulation.',
        },
        {
          id: 'mock-scan-tomato',
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
          imageUrl: 'https://images.unsplash.com/photo-1592841200226-79537757a63f',
          name: 'Tomato (Solanum lycopersicum)',
          confidence: 0.88,
          isDiseased: false,
          remediation: null,
          funFact: 'Tomato is technically a fruit, but classified as a vegetable for culinary and custom tariff purposes.',
          stats: {
            sunlight: 'Full Sun',
            water: 'Keep consistently damp',
            temperature: '21-29°C'
          },
          growthGuide: 'Provide strong support stakes. Water the roots directly rather than wet the leaves.',
        }
      ];
      localStorage.setItem(this.SCANS_KEY, JSON.stringify(initialScans));
      localStorage.setItem('cropmate_seeded', 'true');
      return initialScans;
    }
    return data ? JSON.parse(data) : [];
  }

  async saveScan(scan: Omit<ScanResult, 'id' | 'timestamp'>): Promise<ScanResult> {
    const scans = await this.getScans();
    const newScan: ScanResult = {
      ...scan,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    scans.push(newScan);
    localStorage.setItem(this.SCANS_KEY, JSON.stringify(scans));
    return newScan;
  }

  async updateScan(id: string, updatedFields: Partial<ScanResult>): Promise<ScanResult> {
    const scans = await this.getScans();
    const idx = scans.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new Error("Scan not found");
    }
    const updatedScan = { ...scans[idx], ...updatedFields };
    scans[idx] = updatedScan;
    localStorage.setItem(this.SCANS_KEY, JSON.stringify(scans));
    return updatedScan;
  }

  async deleteScan(id: string): Promise<void> {
    const scans = await this.getScans();
    const filtered = scans.filter(s => s.id !== id);
    localStorage.setItem(this.SCANS_KEY, JSON.stringify(filtered));
  }

  

  async getChatHistory(): Promise<ChatMessage[]> {
    const data = localStorage.getItem(this.CHAT_KEY);
    return data ? JSON.parse(data) : [];
  }

  async saveChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const history = await this.getChatHistory();
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    history.push(newMessage);
    localStorage.setItem(this.CHAT_KEY, JSON.stringify(history));
    return newMessage;
  }

  async clearChatHistory(): Promise<void> {
    localStorage.removeItem(this.CHAT_KEY);
  }

  async clearAllHistory(): Promise<void> {
    localStorage.removeItem(this.SCANS_KEY);
    localStorage.removeItem(this.CHAT_KEY);
    localStorage.setItem('cropmate_seeded', 'true');
  }
}

export const storageService = new StorageService();
