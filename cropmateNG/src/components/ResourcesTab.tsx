import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, BookOpen, Newspaper, ShoppingBag, BookMarked, Globe } from 'lucide-react';

type FlairType = 'All' | 'Blogs' | 'News' | 'Stores' | 'Guides';

interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  flair: Exclude<FlairType, 'All'>;
  authorOrSource: string;
}

const RESOURCES_DATA: Resource[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Indoor Plant Lighting',
    description: 'Learn everything about PPFD, lux, and how to choose the right grow lights for your indoor tropicals.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'GreenThumb Journal'
  },
  {
    id: '2',
    title: 'Top 10 Resilient Houseplants for Beginners',
    description: 'Starting your indoor jungle? Here are the most forgiving plants that can survive missed waterings.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Urban Botanist'
  },
  {
    id: '3',
    title: 'New AI Tool Detects Crop Diseases With 98% Accuracy',
    description: 'Recent advancements in convolutional neural networks are helping farmers identify pathogens weeks earlier.',
    link: '#',
    flair: 'News',
    authorOrSource: 'AgriTech Daily'
  },
  {
    id: '4',
    title: 'Budget Grow Supplies & Pots',
    description: 'Find affordable nursery pots, perlite bulk bags, and organic fertilizers without breaking the bank.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Planter Depot'
  },
  {
    id: '5',
    title: 'How to Treat Spider Mites Before They Spread',
    description: 'A comprehensive step-by-step guide to identifying and eradicating spider mites using neem oil and insecticidal soap.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'PestFree Flora'
  },
  {
    id: '6',
    title: 'Global Fertilizer Shortage Impacting Urban Gardens',
    description: 'Supply chain disruptions are causing synthetic fertilizer prices to spike. Here are organic alternatives.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Global Ag News'
  },
  {
    id: '7',
    title: 'DIY Soil Mixes: Stop Buying Expensive Bags',
    description: 'Mix your own aroid or succulent soil using coco coir, orchid bark, and worm castings.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Soil Nerds'
  },
  {
    id: '8',
    title: 'Premium Rare Plant Cuttings Shop',
    description: 'Looking for a Monstera Albo or a rare Philodendron? Check out these verified sustainable sellers.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Rare Flora Marketplace'
  },
  {
    id: '9',
    title: 'Hydroponics 101: Setting Up Your First Deep Water Culture',
    description: 'A complete beginner breakdown of water pH, nutrient schedules, and aeration for DWC systems.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'HydroHomies'
  },
  
  {
    id: '10',
    title: 'Managing Nitrogen Deficiency in Leafy Greens',
    description: 'A guide on identifying yellowing leaves, measuring soil nitrogen levels, and applying quick-acting organic amendments.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'AgroScience Extension'
  },
  {
    id: '11',
    title: 'Companion Planting Chart for Vegetable Gardens',
    description: 'Which crops thrive together? Learn how basil protects tomatoes and why beans enrich soil for hungry corn.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Organic Growers Club'
  },
  {
    id: '12',
    title: 'How to Calibrate Your pH Meter Correctly',
    description: 'Step-by-step instructions on using buffer solutions to ensure your water and soil testing instruments remain highly accurate.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Lab Equipment Co.'
  },
  {
    id: '13',
    title: 'Drip Irrigation Design for Small Farms',
    description: 'Calculate flow rates, select emitter spacing, and build a gravity-fed or pressurized drip irrigation system on a budget.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Irrigation Intel'
  },
  {
    id: '14',
    title: 'Integrated Pest Management for Greenhouse Whiteflies',
    description: 'Deploy predatory wasps, yellow sticky cards, and mild horticultural oils to keep whitefly populations in check.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Greenhouse Academy'
  },
  {
    id: '15',
    title: 'Understanding N-P-K Ratios on Fertilizer Labels',
    description: 'Deconstruct chemical and organic fertilizer packaging to feed your crops the exact macronutrients they require.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Crop Science Basics'
  },
  {
    id: '16',
    title: 'How to Build a DIY Compost Bin in a Weekend',
    description: 'Turn kitchen scraps and yard waste into black gold with this easy-to-build, aerated three-bin composting system.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Backyard Homestead'
  },
  {
    id: '17',
    title: 'Winterizing Your Fruit Trees: A Complete Checklist',
    description: 'Protect root zones from freezing, prevent frost cracks on trunks, and apply dormant oil spray to control overwintering pests.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Orchardist Monthly'
  },
  {
    id: '18',
    title: 'Microgreen Cultivation: From Seed to Harvest in 10 Days',
    description: 'Optimal tray sizes, seed density, sanitation protocols, and harvest techniques for high-yield microgreens.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Urban Micro-Farms'
  },
  {
    id: '19',
    title: 'Recognizing and Preventing Tomato Blossom End Rot',
    description: 'Is it calcium deficiency or irregular watering? Learn the root causes and preventative steps for a healthy tomato harvest.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Tomato Growers Forum'
  },
  {
    id: '20',
    title: 'Introduction to Permaculture Zone Design',
    description: 'Organize your homestead layout based on energy efficiency, frequency of use, and natural water flow patterns.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Permaculture Institute'
  },
  {
    id: '21',
    title: 'Aroid Soil Mix Recipes for Rare Tropicals',
    description: 'Formulate a chunky, highly aerated soil mix using pumice, orchid bark, perlite, charcoal, and worm castings.',
    link: '#',
    flair: 'Guides',
    authorOrSource: 'Aroid Collectors Guild'
  },
  
  {
    id: '22',
    title: 'My Journey from Finance to Full-Time Flower Farming',
    description: 'How I started a micro-flower farm on half an acre, scaled my CSA program, and found local florists to buy my blooms.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Rooted & Blooming'
  },
  {
    id: '23',
    title: 'Why I Switched My Garden Entirely to No-Dig Beds',
    description: 'A personal account of how avoiding tilling improved soil structure, suppressed weeds, and saved my back over 3 seasons.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'No-Till Diaries'
  },
  {
    id: '24',
    title: 'The Joy of Growing Rare Heirloom Tomatoes',
    description: 'Exploring the incredible flavors, deep histories, and seed-saving techniques for Cherokee Purple and Brandywine tomatoes.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Heritage Harvest Blog'
  },
  {
    id: '25',
    title: 'Micro-Apartment Gardening: Maximize Your Window Sills',
    description: 'How I grow green onions, herbs, and dwarf cherry tomatoes in a 400-square-foot downtown apartment.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'The Compact Garden'
  },
  {
    id: '26',
    title: 'Demystifying Mycorrhizal Fungi in Soil Health',
    description: 'An easy-to-understand breakdown of how soil fungi form symbiotic bonds with roots to unlock phosphorus.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Down to Earth Blog'
  },
  {
    id: '27',
    title: 'Farming in the Age of Climate Uncertainty',
    description: 'Adapting our planting calendar, investing in shade cloths, and selecting heat-tolerant cultivars for drier summers.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Resilient Soil Blog'
  },
  {
    id: '28',
    title: 'The Best Herbs to Grow for Kitchen Wreaths',
    description: 'A fun craft project combining rosemary, thyme, and bay leaves into beautiful, edible kitchen decor.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Herbal Homesteading'
  },
  {
    id: '29',
    title: 'We Tried 5 Different Seed Starting Trays: Here is the Winner',
    description: 'A detailed review comparing cheap plastic plug trays, silicone cells, soil block makers, and peat pots.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'The Cultivated Life'
  },
  {
    id: '30',
    title: 'How to Build a Community Garden from Scratch',
    description: 'A community organizer shares tips on securing public land, drafting bylaws, and organizing weekend workdays.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Green Cities Collective'
  },
  {
    id: '31',
    title: 'A Rookie Mistake: Overwatering My First Monstera',
    description: 'Learning to read the signs of root rot and the steps I took to save my favorite plant from waterlogged soil.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Leafy Confessions'
  },
  {
    id: '32',
    title: 'The Magic of Vermicomposting: Meet My Worms',
    description: 'An entertaining look into setting up an indoor red wiggler bin and harvesting nutrient-rich castings for houseplants.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Worm Whisperer'
  },
  {
    id: '33',
    title: 'Edible Landscaping: Replacing My Lawn with Food',
    description: 'How we replaced half of our suburban front lawn with berry bushes, fruit trees, and perennial vegetable borders.',
    link: '#',
    flair: 'Blogs',
    authorOrSource: 'Suburban Oasis'
  },
  
  {
    id: '34',
    title: 'Vertical Farming Startups Secure Record Funding',
    description: 'Investors double down on indoor agriculture facilities using LED lights and hydro/aeroponics near major metropolitan hubs.',
    link: '#',
    flair: 'News',
    authorOrSource: 'AgTech Insider'
  },
  {
    id: '35',
    title: 'New Wheat Variety Shows High Drought Resistance in Trials',
    description: 'Genetically selected crop strains display robust yields under severe water stress, offering hope for arid farming regions.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Cereal Science Journal'
  },
  {
    id: '36',
    title: 'Satellite Imaging Empowers Smallholder Farmers in Kenya',
    description: 'Low-cost satellite telemetry provides real-time soil moisture and weather alerts directly to farmers via SMS.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Development Ag News'
  },
  {
    id: '37',
    title: 'Invasive Spotted Lanternfly Spotted in New State Territories',
    description: 'Agricultural departments issue quarantine orders and ask residents to destroy egg masses to protect vineyards.',
    link: '#',
    flair: 'News',
    authorOrSource: 'State Entomology Bulletin'
  },
  {
    id: '38',
    title: 'USDA Expands Organic Certification Grants for Rural Farms',
    description: 'New federal funding covers up to 75% of costs associated with transitioning traditional farms to certified organic.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Federal Register Update'
  },
  {
    id: '39',
    title: 'University Research Reveals How Plants Talk via Root Networks',
    description: 'New studies confirm plants release biochemical signals through mycorrhizal networks to warn neighbors of pest attacks.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Science Today Ag'
  },
  {
    id: '40',
    title: 'EU Proposes New Regulations on Agricultural Pesticides',
    description: 'The European Parliament debates stricter caps on synthetic chemical inputs to protect dwindling bee populations.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Brussels Ag Report'
  },
  {
    id: '41',
    title: 'Robotic Weeding Machines Hit the Commercial Market',
    description: 'Solar-powered autonomous weeders use laser targeting to eliminate weeds without chemical herbicides.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Machinery Modern'
  },
  {
    id: '42',
    title: 'Rising Sea Levels Force Farmers to Adapt to Saline Soils',
    description: 'Coastal rice growers experiment with salt-tolerant varieties and aquaculture integration as seawater encroaches.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Climate Adaptation News'
  },
  {
    id: '43',
    title: 'The Revival of Ancient Grains in Modern Bakeries',
    description: 'Einkorn, spelt, and emmer acreage spikes as consumers seek heirloom options with lower gluten profiles.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Bakers and Growers Quarterly'
  },
  {
    id: '44',
    title: 'National Honeybee Census Reports Slight Population Recovery',
    description: 'Wildflower seeding programs along highway medians are credited for local boosts in native pollinator counts.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Ecology Watch'
  },
  {
    id: '45',
    title: 'Global Coffee Production Threatened by Rust Fungus Mutation',
    description: 'A new strain of coffee leaf rust impacts Arabica plantations in Central America, prompting urgent research.',
    link: '#',
    flair: 'News',
    authorOrSource: 'Tropical Crops Review'
  },
  
  {
    id: '46',
    title: 'Sustainable Bamboo Plant Pots & Saucers',
    description: 'Eco-friendly, biodegradable plant containers made from renewable bamboo fibers and natural starches.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'EcoPlanters Co.'
  },
  {
    id: '47',
    title: 'Bulk Horticultural Perlite, Vermiculite & Bark',
    description: 'Buy professional-grade soil amendments by the cubic yard. Perfect for nurseries, farms, and serious hobbyists.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Growers Supply Center'
  },
  {
    id: '48',
    title: 'Premium Cold-Pressed Organic Neem Oil',
    description: 'Pure, high-azadirachtin neem oil for organic pest management. Mixes perfectly with horticultural soap.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Neem & Nature Store'
  },
  {
    id: '49',
    title: 'Full-Spectrum LED Grow Lights for Seedlings',
    description: 'High-efficiency, low-heat LED bars designed for multi-tier seed starting racks and kitchen herb gardens.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Lumens AgTech Store'
  },
  {
    id: '50',
    title: 'Organic Heirloom Seed Collection (Non-GMO)',
    description: 'Over 500 varieties of vegetable, herb, and flower seeds open-pollinated and curated for local adaptability.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Legacy Seeds Inc.'
  },
  {
    id: '51',
    title: 'Heavy-Duty Fabric Grow Bags & Containers',
    description: 'Breathable fabric pots that air-prune roots to prevent circling, improve drainage, and maximize yields.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'RootBreather Pots'
  },
  {
    id: '52',
    title: 'Digital Soil Moisture & pH Tester Probe',
    description: 'A durable, two-in-one analog soil tester requiring no batteries. Ideal for checking moisture at root level.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Precision Ag Store'
  },
  {
    id: '53',
    title: 'Mycorrhizal Fungi Inoculant Powders',
    description: 'Highly concentrated beneficial fungi spores to dust on root zones during transplanting for stronger root growth.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'BioRoots Supply'
  },
  {
    id: '54',
    title: 'Glass Propagation Tubes & Wooden Stands',
    description: 'Aesthetic countertop propagation stations with test tubes, ideal for rooting pothos and monstera cuttings.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'Propagation Chic'
  },
  {
    id: '55',
    title: 'Beneficial Nematodes & Lacewing Eggs',
    description: 'Live biological pest controls shipped directly to your door to naturally eradicate fungus gnats, thrips, and aphids.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'The Bug Depot'
  },
  {
    id: '56',
    title: 'Drip Irrigation DIY Starter Kit',
    description: 'Includes tubing, micro-emitters, pressure regulators, and tap adapters for up to 50 patio plants or garden beds.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'WaterWise Supply'
  },
  {
    id: '57',
    title: 'Cold Frame Greenhouse Kits for Raised Beds',
    description: 'Extend your growing season in spring and fall with easy-to-assemble polycarbonate covers for standard raised beds.',
    link: '#',
    flair: 'Stores',
    authorOrSource: 'SeasonExtender Co.'
  }
];

export default function ResourcesTab() {
  const [activeFlair, setActiveFlair] = useState<FlairType>('All');

  const flairs: FlairType[] = ['All', 'Blogs', 'News', 'Stores', 'Guides'];

  const filteredResources = activeFlair === 'All'
    ? (['Blogs', 'News', 'Stores', 'Guides'] as const).flatMap((flair) =>
        RESOURCES_DATA.filter((resource) => resource.flair === flair).slice(0, 2)
      )
    : RESOURCES_DATA.filter((resource) => resource.flair === activeFlair);

  const getFlairIcon = (flair: string) => {
    switch (flair) {
      case 'Blogs': return <BookOpen className="w-3.5 h-3.5" />;
      case 'News': return <Newspaper className="w-3.5 h-3.5" />;
      case 'Stores': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Guides': return <BookMarked className="w-3.5 h-3.5" />;
      default: return <Globe className="w-3.5 h-3.5" />;
    }
  };

  const getFlairColor = (flair: string) => {
    switch (flair) {
      case 'Blogs': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'News': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Stores': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Guides': return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {}
      <div className="glass-panel p-6 md:p-8 bg-white border border-emerald-100/50">
        <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-950 mb-2">Community Resources</h2>
        <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
          Expand your agricultural knowledge. Discover trending news, read expert blogs, explore comprehensive guides for specific plant care, or find cheap supply stores for your farming needs.
        </p>

        {}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-200 relative">
          {flairs.map((flair) => (
            <button
              key={flair}
              onClick={() => setActiveFlair(flair)}
              className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-200 border cursor-pointer z-10 ${
                activeFlair === flair 
                  ? 'text-white border-transparent' 
                  : 'text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <div className={`absolute inset-0 rounded-full -z-20 transition-colors duration-200 ${
                activeFlair === flair ? 'bg-transparent' : 'bg-slate-50 group-hover:bg-slate-100'
              }`} />
              {activeFlair === flair && (
                <motion.div 
                  layoutId="filterPill"
                  className="absolute inset-0 bg-emerald-600 shadow-[0_2px_8px_rgba(21,128,61,0.2)] rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {flair !== 'All' && getFlairIcon(flair)}
                {flair}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeFlair === 'All' && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>Currently showing the top 2 featured resources for each category. Select a tag above to explore all entries.</span>
        </div>
      )}

       {}
       <motion.div 
         layout 
         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
       >
         <AnimatePresence mode="popLayout">
           {filteredResources.map((resource) => (
             <motion.div 
               layout
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ duration: 0.2 }}
               key={resource.id} 
             >
               <div 
                 className="glass-panel p-5 bg-white border border-slate-250/60 flex flex-col justify-between group hover:border-emerald-300 transition-all duration-300 shadow-sm h-full"
               >
                 <div>
                   <div className="flex items-start justify-between mb-3 gap-3">
                     <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getFlairColor(resource.flair)}`}>
                       {getFlairIcon(resource.flair)}
                       {resource.flair}
                     </span>
                     <a 
                       href={resource.link} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-150 rounded text-slate-500 transition-colors"
                       title="Open Resource"
                     >
                       <ExternalLink className="w-4 h-4" />
                     </a>
                   </div>
                   <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors leading-tight">{resource.title}</h3>
                   <p className="text-xs text-slate-600 leading-relaxed mb-4">{resource.description}</p>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100 mt-auto flex items-center gap-2 text-[10px] text-slate-500">
                   <span className="font-semibold text-slate-700">{resource.authorOrSource}</span>
                 </div>
               </div>
             </motion.div>
           ))}
         </AnimatePresence>
 
         {filteredResources.length === 0 && (
           <div className="col-span-full glass-panel p-12 text-center flex flex-col items-center justify-center bg-white border border-slate-200">
             <Globe className="w-8 h-8 text-slate-400 mb-3" />
             <h3 className="text-sm font-bold text-slate-800 mb-1">No resources found</h3>
             <p className="text-xs text-slate-500">Try selecting a different flair category.</p>
           </div>
         )}
       </motion.div>

    </div>
  );
}
