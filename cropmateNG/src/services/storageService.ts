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
    const data = sessionStorage.getItem(this.SCANS_KEY);
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
    sessionStorage.setItem(this.SCANS_KEY, JSON.stringify(scans));
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
    sessionStorage.setItem(this.SCANS_KEY, JSON.stringify(scans));
    return updatedScan;
  }

  async deleteScan(id: string): Promise<void> {
    const scans = await this.getScans();
    const filtered = scans.filter(s => s.id !== id);
    sessionStorage.setItem(this.SCANS_KEY, JSON.stringify(filtered));
  }

  

  async getChatHistory(): Promise<ChatMessage[]> {
    const data = sessionStorage.getItem(this.CHAT_KEY);
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
    sessionStorage.setItem(this.CHAT_KEY, JSON.stringify(history));
    return newMessage;
  }

  async clearChatHistory(): Promise<void> {
    sessionStorage.removeItem(this.CHAT_KEY);
  }

  async clearAllHistory(): Promise<void> {
    sessionStorage.removeItem(this.SCANS_KEY);
    sessionStorage.removeItem(this.CHAT_KEY);
  }
}

export const storageService = new StorageService();
