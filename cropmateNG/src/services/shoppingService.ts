import type { Product } from './storageService';

export class ShoppingService {
  private readonly apiKey = import.meta.env.VITE_SERPER_API_KEY;
  private readonly baseUrl = 'https://google.serper.dev/shopping';

  async searchProducts(query: string): Promise<Product[]> {
    if (!this.apiKey) {
      console.error('ShoppingService error: VITE_SERPER_API_KEY is not defined');
      return [];
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Serper Shopping API returns results in a 'shopping' array
      if (!data.shopping || !Array.isArray(data.shopping)) {
        return [];
      }

      return data.shopping.map((item: any) => ({
        id: item.productId || item.id || Math.random().toString(36).substr(2, 9),
        name: item.title,
        price: item.price,
        imageUrl: item.imageUrl || item.thumbnail || item.image || '',
        link: item.link,
      }));
    } catch (error) {
      console.error('ShoppingService error:', error);
      return [];
    }
  }
}

export const shoppingService = new ShoppingService();
