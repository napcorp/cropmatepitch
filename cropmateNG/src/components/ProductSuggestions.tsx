import { ShoppingCart, ExternalLink } from 'lucide-react';
import type { Product } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductSuggestionsProps {
  products: Product[];
}

const parsePrice = (priceStr: string): number => {
  const cleanStr = priceStr.replace(/[^\d.]/g, '');
  const val = parseFloat(cleanStr);
  return isNaN(val) ? Infinity : val;
};

const formatPriceByLanguage = (usdPriceStr: string, langCode: string): string => {
  const cleanStr = usdPriceStr.replace(/[^\d.]/g, '');
  const usdPrice = parseFloat(cleanStr);
  if (isNaN(usdPrice)) return usdPriceStr; 

  let converted = usdPrice;
  let symbol = '$';
  let isPrefix = true;

  const isIndian = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'mai', 'ne', 'sd', 'doi', 'sa', 'mni-Mtei', 'bho', 'kok', 'lus'].includes(langCode);

  if (isIndian) {
    converted = usdPrice * 83.5;
    symbol = '₹';
  } else if (langCode === 'es' || langCode === 'fr') {
    converted = usdPrice * 0.92;
    symbol = '€';
  } else if (langCode === 'zh-CN') {
    converted = usdPrice * 7.25;
    symbol = '¥';
  } else if (langCode === 'ru') {
    converted = usdPrice * 90.0;
    symbol = '₽';
  } else if (langCode === 'ar') {
    converted = usdPrice * 3.67;
    symbol = 'د.إ';
    isPrefix = false;
  }

  const formattedValue = converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isPrefix ? `${symbol}${formattedValue}` : `${formattedValue} ${symbol}`;
};

export default function ProductSuggestions({ products }: ProductSuggestionsProps) {
  const { currentLanguage, t } = useLanguage();

  if (products.length === 0) return null;

  // cheapest and most relevant: take top 8 relevant results, sort by price ascending
  const sortedProducts = [...products]
    .slice(0, 8)
    .sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 px-1">
        <ShoppingCart className="w-4 h-4 text-emerald-700" />
        <h4 className="font-semibold text-slate-900 text-sm">{t("Recommended Supplies")}</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedProducts.map((product) => (
          <a
            key={product.id}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel p-3 bg-white border border-slate-200 flex flex-col gap-3 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-50 relative flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to empty icon on load error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-slate-300">
                  <ShoppingCart className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                {product.name}
              </h5>
              <p className="text-emerald-700 font-bold text-sm">
                {formatPriceByLanguage(product.price, currentLanguage.code)}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t("View on Store")}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
