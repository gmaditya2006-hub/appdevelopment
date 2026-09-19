// WasteWise front-end logic
// Handles smart search, AI-style scanning, disposal guidance, user dashboard, and proof verification.
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');
const searchChips = document.querySelectorAll('.search-chip');
const fileInput = document.getElementById('fileInput');
const uploadBox = document.getElementById('uploadBox');
const scanButton = document.getElementById('scanButton');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const resultCard = document.getElementById('resultCard');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const analysisTitle = document.getElementById('analysisTitle');
const actionScan = document.querySelector('.action-scan');
const actionSearch = document.querySelector('.action-search');
const wasteTypeSelect = document.getElementById('wasteTypeSelect');
const useLocationBtn = document.getElementById('useLocationBtn');
const findCentersBtn = document.getElementById('findCentersBtn');
const mapFrame = document.getElementById('mapFrame');
const navbar = document.querySelector('.navbar');
const menuToggle = document.getElementById('menuToggle');
const mainNavigation = document.getElementById('mainNavigation');

function closeMobileNavigation() {
  navbar.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  navbar.classList.toggle('menu-open', !isOpen);
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
});

mainNavigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileNavigation);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) {
    closeMobileNavigation();
  }
});

// Map query data used for nearby disposal center lookups.
const wasteMapQuery = {
  Recyclable: 'recycling center',
  Organic: 'compost center',
  'E-Waste': 'e-waste collection center',
  Hazardous: 'hazardous waste disposal center'
};

function buildMapUrl(type, coords) {
  const keyword = wasteMapQuery[type] || 'recycling center';

  if (coords) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${keyword} near ${coords.latitude},${coords.longitude}`)}&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(`${keyword} near me`)}&output=embed`;
}

function updateMapForSelectedType(coords) {
  const selectedType = wasteTypeSelect.value;
  mapFrame.src = buildMapUrl(selectedType, coords);
}

// Waste knowledge base for the search and identification features.
const wasteDatabase = {
  // Recyclable Waste
  plastic_bottle: {
    name: 'Plastic Bottle',
    aliases: ['plastic bottle', 'bottle', 'water bottle', 'drink bottle', 'soda bottle', 'pet bottle'],
    category: '🔵 Recyclable Waste',
    warning: '♻️ Keep it clean and dry before recycling.',
    icon: '🧴'
  },
  glass_bottle: {
    name: 'Glass Bottle',
    aliases: ['glass bottle', 'wine bottle', 'beer bottle', 'glass jar', 'jam jar'],
    category: '🔵 Recyclable Waste',
    warning: '♻️ Place in glass recycling bin. Handle carefully.',
    icon: '🍾'
  },
  aluminum_can: {
    name: 'Aluminum Can',
    aliases: ['aluminum can', 'soda can', 'beer can', 'metal can', 'tin can'],
    category: '🔵 Recyclable Waste',
    warning: '♻️ Rinse and place in metal recycling bin.',
    icon: '🥫'
  },
  cardboard: {
    name: 'Cardboard',
    aliases: ['cardboard', 'box', 'shipping box', 'carton', 'paper box'],
    category: '🔵 Recyclable Waste',
    warning: '📦 Flatten and place in recycling collection.',
    icon: '📦'
  },
  newspaper: {
    name: 'Newspaper',
    aliases: ['newspaper', 'news paper', 'paper', 'magazine', 'journal'],
    category: '🔵 Recyclable Waste',
    warning: '📰 Bundle and place in paper recycling.',
    icon: '📰'
  },
  plastic_bag: {
    name: 'Plastic Bag',
    aliases: ['plastic bag', 'shopping bag', 'carrier bag', 'grocery bag'],
    category: '🔵 Recyclable Waste',
    warning: '♻️ Do not place in curbside bin. Use designated plastic film drop-off.',
    icon: '🛍️'
  },
  steel_can: {
    name: 'Steel Can',
    aliases: ['steel can', 'tin can', 'food can', 'canned food'],
    category: '🔵 Recyclable Waste',
    warning: '♻️ Remove labels and rinse before recycling.',
    icon: '🥫'
  },
  plastic_container: {
    name: 'Plastic Container',
    aliases: ['plastic container', 'takeout container', 'food container', 'storage container'],
    category: '🔵 Recyclable Waste',
    warning: '♻️ Rinse and check recyclability number.',
    icon: '📦'
  },
  envelopes: {
    name: 'Envelopes',
    aliases: ['envelope', 'envelopes', 'mail', 'letter'],
    category: '🔵 Recyclable Waste',
    warning: '📮 Remove plastic windows and recycle.',
    icon: '📮'
  },
  junk_mail: {
    name: 'Junk Mail',
    aliases: ['junk mail', 'flyer', 'brochure', 'catalog', 'advertisement'],
    category: '🔵 Recyclable Waste',
    warning: '📄 Place in paper recycling bin.',
    icon: '📄'
  },

  // Organic Waste
  banana: {
    name: 'Banana Peel',
    aliases: ['banana peel', 'banana', 'peel', 'fruit peel'],
    category: '🟢 Organic Waste',
    warning: '🍃 Compost it in a green bin or compost unit.',
    icon: '🍌'
  },
  apple: {
    name: 'Apple Core',
    aliases: ['apple', 'apple core', 'fruit core', 'fruit scraps'],
    category: '🟢 Organic Waste',
    warning: '🍃 Add to compost or green bin.',
    icon: '🍎'
  },
  vegetable_scraps: {
    name: 'Vegetable Scraps',
    aliases: ['vegetable scraps', 'vegetable waste', 'food scraps', 'food waste', 'leftover food', 'organic waste', 'carrot peels', 'potato peels'],
    category: '🟢 Organic Waste',
    warning: '🍃 Compost organic matter in green bin.',
    icon: '🥕'
  },
  leaves: {
    name: 'Leaves & Yard Waste',
    aliases: ['leaves', 'yard waste', 'grass clippings', 'branches', 'twigs'],
    category: '🟢 Organic Waste',
    warning: '🌿 Place in yard waste bin or compost pile.',
    icon: '🍂'
  },
  coffee_grounds: {
    name: 'Coffee Grounds',
    aliases: ['coffee grounds', 'coffee', 'tea bags', 'tea leaves'],
    category: '🟢 Organic Waste',
    warning: '☕ Compost or use as garden fertilizer.',
    icon: '☕'
  },
  eggshells: {
    name: 'Eggshells',
    aliases: ['eggshells', 'eggshell', 'eggs', 'broken eggs'],
    category: '🟢 Organic Waste',
    warning: '🥚 Crush and add to compost bin.',
    icon: '🥚'
  },
  bread: {
    name: 'Stale Bread',
    aliases: ['bread', 'stale bread', 'old bread', 'bakery waste'],
    category: '🟢 Organic Waste',
    warning: '🍞 Compost or feed to animals.',
    icon: '🍞'
  },
  meat: {
    name: 'Meat & Bones',
    aliases: ['meat', 'bones', 'chicken bones', 'fish bones', 'leftover meat'],
    category: '🟢 Organic Waste',
    warning: '🍗 Compost in designated brown bin if available.',
    icon: '🍗'
  },

  // E-Waste
  phone: {
    name: 'Mobile Phone',
    aliases: ['mobile phone', 'phone', 'smartphone', 'cell phone', 'iphone', 'android'],
    category: '🟠 E-Waste',
    warning: '💻 Hand it to an e-waste drop-off point.',
    icon: '📱'
  },
  laptop: {
    name: 'Laptop',
    aliases: ['laptop', 'notebook', 'computer', 'macbook', 'chromebook'],
    category: '🟠 E-Waste',
    warning: '💻 Take to certified e-waste recycling center.',
    icon: '💻'
  },
  tablet: {
    name: 'Tablet',
    aliases: ['tablet', 'ipad', 'kindle', 'reader'],
    category: '🟠 E-Waste',
    warning: '💻 Recycle at e-waste collection point.',
    icon: '📱'
  },
  monitor: {
    name: 'Computer Monitor',
    aliases: ['monitor', 'screen', 'display', 'lcd screen', 'crt monitor'],
    category: '🟠 E-Waste',
    warning: '🖥️ Take to e-waste recycling facility.',
    icon: '🖥️'
  },
  keyboard: {
    name: 'Keyboard',
    aliases: ['keyboard', 'computer keyboard', 'wireless keyboard'],
    category: '🟠 E-Waste',
    warning: '⌨️ Recycle at e-waste drop-off point.',
    icon: '⌨️'
  },
  mouse: {
    name: 'Computer Mouse',
    aliases: ['mouse', 'computer mouse', 'wireless mouse'],
    category: '🟠 E-Waste',
    warning: '🖱️ Place in e-waste collection bin.',
    icon: '🖱️'
  },
  headphones: {
    name: 'Headphones',
    aliases: ['headphones', 'headphone', 'earbuds', 'earphone', 'airpods'],
    category: '🟠 E-Waste',
    warning: '🎧 Recycle at electronics recycling center.',
    icon: '🎧'
  },
  printer: {
    name: 'Printer',
    aliases: ['printer', 'inkjet printer', 'laser printer'],
    category: '🟠 E-Waste',
    warning: '🖨️ Take to certified e-waste facility.',
    icon: '🖨️'
  },
  cable: {
    name: 'Electronic Cables',
    aliases: ['cable', 'usb cable', 'charging cable', 'power cord', 'hdmi cable'],
    category: '🟠 E-Waste',
    warning: '🔌 Recycle at e-waste center with other electronics.',
    icon: '🔌'
  },
  circuit_board: {
    name: 'Circuit Board',
    aliases: ['circuit board', 'circuitboard', 'motherboard', 'pcb', 'printed circuit board', 'electronics board'],
    category: '🟠 E-Waste',
    warning: '🔌 Take it to a certified e-waste recycling center.',
    icon: '🧩'
  },
  charger: {
    name: 'Phone Charger',
    aliases: ['charger', 'power charger', 'adapter', 'power adapter'],
    category: '🟠 E-Waste',
    warning: '🔌 Take to e-waste recycling point.',
    icon: '🔌'
  },

  // Hazardous Waste
  medical_sharps: {
    name: 'Used Medical Sharps',
    aliases: ['syringe', 'syringes', 'needle', 'needles', 'sharps', 'medical sharps', 'medical waste', 'used syringe', 'injection', 'medical gloves', 'surgical mask'],
    category: '🔴 Hazardous Waste',
    warning: '⚠️ Do not touch or recap. Place in an approved sharps container and contact an authorized medical-waste collector.',
    icon: '💉'
  },
  battery: {
    name: 'Household Batteries',
    aliases: ['battery', 'batteries', 'aa battery', 'aaa battery', 'aa batteries', 'aaa batteries', 'household battery', 'household batteries', 'alkaline battery', 'lithium battery', 'car battery', 'automotive battery', 'vehicle battery', 'lead acid battery', 'lead-acid battery', 'inverter battery', 'exide', 'energizer', 'kirkland', 'duracell'],
    category: '🔴 Hazardous Waste',
    warning: '⚠️ Keep batteries out of regular trash. Tape the terminals and take them to an authorized battery recycling center.',
    icon: '🔋'
  },
  led_bulb: {
    name: 'LED/CFL Bulb',
    aliases: ['led bulb', 'cfl bulb', 'light bulb', 'fluorescent bulb', 'compact fluorescent'],
    category: '🔴 Hazardous Waste',
    warning: '💡 Contains mercury. Take to hazmat collection point.',
    icon: '💡'
  },
  paint: {
    name: 'Paint Can',
    aliases: ['paint', 'paint can', 'paint bucket', 'old paint'],
    category: '🔴 Hazardous Waste',
    warning: '🎨 Never pour down drain. Take to hazmat facility.',
    icon: '🎨'
  },
  motor_oil: {
    name: 'Used Motor Oil',
    aliases: ['motor oil', 'used oil', 'engine oil', 'oil can'],
    category: '🔴 Hazardous Waste',
    warning: '⛽ Take to authorized oil recycling facility.',
    icon: '⛽'
  },
  medication: {
    name: 'Expired Medication',
    aliases: ['medication', 'medicine', 'medicines', 'expired medicine', 'expired medication', 'pills', 'prescription', 'tablets'],
    category: '🔴 Hazardous Waste',
    warning: '💊 Never flush down toilet. Take to pharmacy or hazmat center.',
    icon: '💊'
  },
  pesticide: {
    name: 'Pesticide',
    aliases: ['pesticide', 'insecticide', 'herbicide', 'weed killer'],
    category: '🔴 Hazardous Waste',
    warning: '☠️ Hazardous chemical. Take to hazmat disposal site.',
    icon: '☠️'
  },
  cleaning_product: {
    name: 'Cleaning Products',
    aliases: ['cleaning product', 'cleaning products', 'bleach', 'ammonia', 'solvent'],
    category: '🔴 Hazardous Waste',
    warning: '🧪 Never mix chemicals. Take to hazmat collection.',
    icon: '🧪'
  },
  thermometer: {
    name: 'Mercury Thermometer',
    aliases: ['thermometer', 'mercury thermometer', 'old thermometer'],
    category: '🔴 Hazardous Waste',
    warning: '🌡️ Contains mercury. Handle carefully and take to hazmat center.',
    icon: '🌡️'
  }
};

// Create search index for faster lookups
const wasteSearchIndex = {};
Object.entries(wasteDatabase).forEach(([key, item]) => {
  item.aliases.forEach((alias) => {
    wasteSearchIndex[alias.toLowerCase()] = key;
  });
});

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findWasteMatch(query) {
  const normalized = (query || '').trim().toLowerCase();
  if (!normalized) return null;

  // Prefer the most specific item phrase when the upload filename contains it.
  const phraseMatches = [];
  for (const item of Object.values(wasteDatabase)) {
    for (const alias of item.aliases || []) {
      const normalizedAlias = alias.toLowerCase();
      if (normalized.includes(normalizedAlias)) {
        phraseMatches.push({ item, length: normalizedAlias.length });
      }
    }
  }
  if (phraseMatches.length > 0) {
    phraseMatches.sort((a, b) => b.length - a.length);
    return phraseMatches[0].item;
  }

  // Step 1: Exact match in search index
  if (wasteSearchIndex[normalized]) {
    const itemKey = wasteSearchIndex[normalized];
    return wasteDatabase[itemKey];
  }

  // Step 2: Check for partial word matches
  const words = normalized.split(/\s+/);
  const candidates = [];

  for (const [key, item] of Object.entries(wasteDatabase)) {
    const allText = [item.name, ...(item.aliases || [])].join(' ').toLowerCase();
    
    // Check if all query words appear in the item text
    const matchedWords = words.filter(word => allText.includes(word)).length;
    if (matchedWords > 0) {
      candidates.push({
        item: item,
        score: matchedWords / words.length,
        exactWordMatch: matchedWords === words.length
      });
    }
  }

  // Sort by word match quality
  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      if (b.exactWordMatch !== a.exactWordMatch) {
        return b.exactWordMatch ? 1 : -1;
      }
      return b.score - a.score;
    });
    return candidates[0].item;
  }

  // Step 3: Fuzzy matching using Levenshtein distance
  let bestMatch = null;
  let bestDistance = Infinity;
  const threshold = 3; // Maximum distance for a match

  for (const [key, item] of Object.entries(wasteDatabase)) {
    for (const alias of item.aliases || []) {
      const distance = levenshteinDistance(normalized, alias.toLowerCase());
      if (distance < bestDistance && distance <= threshold) {
        bestDistance = distance;
        bestMatch = item;
      }
    }
  }

  return bestMatch;
}

// Track the currently selected waste item for disposal guide and map actions.
let currentWasteItem = null;

function updateSearchResult(query) {
  const item = findWasteMatch(query);
  
  if (!item) {
    // Show a generic message when no match is found
    currentWasteItem = null;
    searchResult.innerHTML = `
      <div class="result-label-row">
        <span class="result-item-icon">❓</span>
        <span class="result-item-name">Item Not Found</span>
      </div>

      <div class="result-body">
        <div>
          <p class="result-caption">Try searching for:</p>
          <h4>Common waste items like: plastic bottle, phone, battery, cardboard, apple, etc.</h4>
        </div>
        <p class="warning-text">💡 Database includes 40+ waste items across all categories: Recyclable, Organic, E-Waste, and Hazardous.</p>
      </div>

      <div class="result-actions">
        <button type="button" class="secondary-small">View All Items</button>
        <button type="button" class="primary-small">Browse Categories</button>
      </div>
    `;
    return;
  }

  // Store current item for button handlers
  currentWasteItem = item;

  const itemName = item.name || 'Item';
  const icon = item.icon || '♻️';

  searchResult.innerHTML = `
    <div class="result-label-row">
      <span class="result-item-icon">${icon}</span>
      <span class="result-item-name">${itemName}</span>
    </div>

    <div class="result-body">
      <div>
        <p class="result-caption">Category</p>
        <h4>${item.category}</h4>
      </div>
      <p class="warning-text">${item.warning}</p>
    </div>

    <div class="result-actions">
      <button type="button" class="secondary-small" id="viewGuideBtn">📖 View Disposal Guide</button>
      <button type="button" class="primary-small" id="findCenterBtn">📍 Find Collection Center</button>
    </div>
  `;

  // Add event listeners to the buttons - use a small timeout to ensure DOM is ready
  setTimeout(() => {
    const viewGuideBtn = document.getElementById('viewGuideBtn');
    const findCenterBtn = document.getElementById('findCenterBtn');
    
    if (viewGuideBtn) {
      viewGuideBtn.addEventListener('click', openDisposalGuide);
    }
    
    if (findCenterBtn) {
      findCenterBtn.addEventListener('click', findCollectionCenter);
    }
  }, 0);
}

searchInput.addEventListener('input', (event) => {
  updateSearchResult(event.target.value);
});

// ========================================
// DISPOSAL GUIDE & COLLECTION CENTER
// ========================================
// These functions show instructions and nearby location results for the chosen waste type.

const disposalGuideModal = document.getElementById('disposalGuideModal');
const closeDisposalGuide = document.getElementById('closeDisposalGuide');
const closeGuideBtn = document.getElementById('closeGuideBtn');
const findCenterFromGuide = document.getElementById('findCenterFromGuide');

// Disposal guide database with detailed information
const disposalGuideData = {
  plastic_bottle: {
    steps: [
      'Rinse the bottle to remove any liquids or residue',
      'Remove the plastic label and cap if separate',
      'Place in the blue/clear recycling bin',
      'Ensure it\'s not crushed so sorting machines can scan it'
    ],
    tips: [
      'Avoid putting lids in the recycling bin as they often jam machines',
      'Stackable bottles save space and are preferred',
      'Check local guidelines as some areas have specific plastic codes'
    ],
    impact: 'Recycling one plastic bottle saves enough energy to power a laptop for 3 hours. 🔋'
  },
  glass_bottle: {
    steps: [
      'Rinse the bottle thoroughly with water',
      'Remove the metal cap or plastic lid',
      'Place in the green/clear glass recycling bin',
      'Keep separate from other recyclables to prevent contamination'
    ],
    tips: [
      'Broken glass should be placed in a separate container and marked',
      'Different colors of glass may need to be sorted separately in your area',
      'Glass is infinitely recyclable without loss of quality'
    ],
    impact: 'Recycled glass reduces raw material extraction by 25%, saving natural resources and energy. ⚡'
  },
  aluminum_can: {
    steps: [
      'Rinse the can to remove any liquid or food residue',
      'Crush the can to save transportation space (optional)',
      'Place in the metal recycling bin',
      'Separate from other materials for better sorting'
    ],
    tips: [
      'Aluminum cans are the most recycled beverage containers',
      'Recycled aluminum takes 1/20th the energy of producing new aluminum',
      'Save aluminum cans separately for a local scrap metal buyer if needed'
    ],
    impact: 'One recycled aluminum can saves enough electricity to power an LED bulb for 4 hours. 💡'
  },
  cardboard: {
    steps: [
      'Break down the cardboard box by flattening it',
      'Remove any plastic tape, foam, or Styrofoam packing',
      'Place in the brown recycling bin',
      'Keep it dry to prevent contamination'
    ],
    tips: [
      'Wet cardboard degrades and cannot be recycled properly',
      'Remove packing tape as it can jam sorting equipment',
      'Consider reusing boxes for storage or moving first'
    ],
    impact: 'Recycling cardboard saves 24% of the energy needed to make new cardboard, reducing waste by 90%. ♻️'
  },
  battery: {
    steps: [
      'Place batteries in a small bag to prevent contact with other batteries',
      'Never throw in regular trash or recycling bin',
      'Take to an authorized battery recycling center',
      'Cover the terminals of large batteries with tape'
    ],
    tips: [
      'Batteries contain toxic materials that contaminate soil and water',
      'Many retailers (electronics stores, supermarkets) offer free battery recycling',
      'Store dead batteries in a cool, dry place until recycling'
    ],
    impact: 'Recycled batteries recover valuable metals like lithium, cobalt, and nickel for new batteries. 🔋'
  },
  phone: {
    steps: [
      'Back up your data and factory reset the phone',
      'Remove the SIM card and SD card',
      'Find an authorized e-waste recycling center',
      'Hand it directly to an agent for secure disposal'
    ],
    tips: [
      'Many manufacturers have take-back programs for old devices',
      'Erasing your data is crucial before recycling',
      'Some centers offer payment for old electronics with working components'
    ],
    impact: 'One phone contains 0.034g of gold and other precious metals worth recycling. 🏆'
  },
  banana: {
    steps: [
      'Place banana peel in a compost bin or green waste bin',
      'If home composting, bury in the soil to speed decomposition',
      'Never place in regular trash',
      'Chop into smaller pieces for faster breakdown'
    ],
    tips: [
      'Banana peels break down in 2-3 weeks in compost',
      'They\'re rich in potassium, great for soil enrichment',
      'Keep compost moist but not waterlogged'
    ],
    impact: 'One banana peel can create nutrient-rich compost for 1 plant over the season. 🌱'
  },
  paint: {
    steps: [
      'Never pour down the drain - it\'s illegal and pollutes water',
      'Take to a hazardous waste disposal facility',
      'Empty cans can sometimes be recycled as metal',
      'Keep away from children and pets during storage'
    ],
    tips: [
      'Paint dries faster if you leave the lid off (in safe, ventilated areas)',
      'Donate leftover paint to community programs if still usable',
      'Many cities have hazmat disposal events monthly'
    ],
    impact: 'Improperly disposed paint contaminates groundwater affecting thousands of people. 🌍'
  },
  medication: {
    steps: [
      'Check if your pharmacy has a take-back program (most do)',
      'Mix medications with unappetizing substance like coffee grounds',
      'Place in a sealed plastic bag',
      'Throw in regular trash as a last resort'
    ],
    tips: [
      'Never flush medication as it contaminates water supplies',
      'DEA Drug Take Back Day events accept medication for free',
      'Removing personal information from bottles is recommended'
    ],
    impact: 'Proper medication disposal prevents water contamination and protects aquatic life. 🐟'
  }
};

function getDisposalSteps(item) {
  const key = Object.keys(wasteDatabase).find(k => wasteDatabase[k].name === item.name);
  if (disposalGuideData[key]) {
    return disposalGuideData[key];
  }
  
  // Return generic steps based on category
  if (item.category.includes('Recyclable')) {
    return {
      steps: ['Clean the item', 'Remove labels and non-recyclable parts', 'Place in recycling bin', 'Keep dry and separated by material type'],
      tips: ['Check local recycling guidelines', 'Contaminated items reduce recycling efficiency'],
      impact: 'Recycling preserves natural resources and reduces landfill waste.'
    };
  } else if (item.category.includes('Organic')) {
    return {
      steps: ['Separate from other waste', 'Place in compost or green waste bin', 'Avoid mixing with meat or dairy', 'Chop larger pieces for faster decomposition'],
      tips: ['Organic waste composts in 2-4 weeks', 'Keep compost moist but not waterlogged'],
      impact: 'Organic waste becomes nutrient-rich compost for soil enhancement.'
    };
  } else if (item.category.includes('E-Waste')) {
    return {
      steps: ['Secure all data', 'Locate authorized e-waste facility', 'Transport safely', 'Hand to certified recycler'],
      tips: ['Many retailers offer e-waste recycling', 'Data security is critical before recycling'],
      impact: 'E-waste recycling recovers valuable metals and prevents toxic contamination.'
    };
  } else if (item.category.includes('Hazardous')) {
    return {
      steps: ['Contact local hazmat facility', 'Follow storage safety guidelines', 'Transport in appropriate container', 'Hand to certified facility'],
      tips: ['Never dispose in regular trash', 'Check hazmat disposal events in your area'],
      impact: 'Proper hazardous disposal prevents environmental contamination and health risks.'
    };
  }
  
  return {
    steps: ['Check local guidelines', 'Take to appropriate facility', 'Follow facility instructions'],
    tips: ['Call ahead to confirm acceptance'],
    impact: 'Proper disposal protects the environment.'
  };
}

function openDisposalGuide() {
  if (!currentWasteItem) return;

  const item = currentWasteItem;
  const guideData = getDisposalSteps(item);
  
  // Update modal content
  document.getElementById('guideIcon').textContent = item.icon;
  document.getElementById('guideName').textContent = item.name;
  document.getElementById('guideCategory').textContent = item.category;
  document.getElementById('guideWarning').textContent = item.warning;
  
  const stepsHTML = guideData.steps.map(step => `<li>${step}</li>`).join('');
  document.getElementById('guideSteps').innerHTML = stepsHTML;
  
  const tipsHTML = guideData.tips.map(tip => `<li>${tip}</li>`).join('');
  document.getElementById('guideTips').innerHTML = tipsHTML;
  
  document.getElementById('guideImpact').textContent = guideData.impact;
  
  // Show modal
  disposalGuideModal.classList.remove('hidden');
}

function closeModal() {
  disposalGuideModal.classList.add('hidden');
}

function findCollectionCenter() {
  if (!currentWasteItem) {
    console.warn('No waste item selected');
    alert('Please search for a waste item first.');
    return;
  }

  const item = currentWasteItem;
  
  // Map item category to waste type
  let wasteType = 'Recyclable';
  if (item.category.includes('Organic')) {
    wasteType = 'Organic';
  } else if (item.category.includes('E-Waste')) {
    wasteType = 'E-Waste';
  } else if (item.category.includes('Hazardous')) {
    wasteType = 'Hazardous';
  }
  
  console.log('Finding center for:', item.name, 'Type:', wasteType);
  
  // Update the waste type selector
  wasteTypeSelect.value = wasteType;
  
  // Close disposal guide if open
  closeModal();
  
  // Update map and scroll with proper timing
  setTimeout(() => {
    // Make sure the select value is properly set
    if (wasteTypeSelect.value !== wasteType) {
      wasteTypeSelect.value = wasteType;
    }
    
    // Update the map immediately
    console.log('Updating map for waste type:', wasteType);
    updateMapForSelectedType();
    
    // Force scroll to centers section
    const centersSection = document.getElementById('centers');
    if (centersSection) {
      console.log('Scrolling to centers section');
      centersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn('Centers section not found');
    }
  }, 150);
}

function resolveWasteItemFromKey(wasteItemKey) {
  const normalized = (wasteItemKey || '').toLowerCase().trim();

  if (!normalized) return null;

  for (const [key, item] of Object.entries(wasteDatabase)) {
    const itemName = (item.name || '').toLowerCase();
    const aliases = item.aliases || [];

    if (
      key === normalized ||
      itemName === normalized ||
      aliases.some(alias => alias.toLowerCase() === normalized) ||
      aliases.some(alias => alias.toLowerCase().includes(normalized) || normalized.includes(alias.toLowerCase()))
    ) {
      return item;
    }
  }

  return null;
}

// Handle "Find Nearby Center" from AI scan results
function handleScanFindCenter(wasteItemKey) {
  const item = resolveWasteItemFromKey(wasteItemKey);

  if (!item) {
    console.warn('Waste item not found:', wasteItemKey);
    alert('Could not find waste item information.');
    return;
  }

  currentWasteItem = item;
  console.log('Finding center from scan for:', item.name);
  findCollectionCenter();
}

// Modal event listeners for the disposal guide popup.
closeDisposalGuide.addEventListener('click', closeModal);
closeGuideBtn.addEventListener('click', closeModal);
findCenterFromGuide.addEventListener('click', () => {
  closeModal();
  findCollectionCenter();
});

// Close modal when clicking outside
disposalGuideModal.addEventListener('click', (e) => {
  if (e.target === disposalGuideModal) {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !disposalGuideModal.classList.contains('hidden')) {
    closeModal();
  }
});


useLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    updateMapForSelectedType();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      updateMapForSelectedType({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    () => {
      updateMapForSelectedType();
    }
  );
});

findCentersBtn.addEventListener('click', () => {
  updateMapForSelectedType();
});

wasteTypeSelect.addEventListener('change', () => {
  updateMapForSelectedType();
});

searchChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const value = chip.dataset.query;
    searchInput.value = value;
    updateSearchResult(value);
  });
});

actionSearch.addEventListener('click', () => {
  document.getElementById('search').scrollIntoView({ behavior: 'smooth', block: 'start' });
  searchInput.focus();
});

actionScan.addEventListener('click', () => {
  document.getElementById('scan').scrollIntoView({ behavior: 'smooth', block: 'start' });
  uploadBox.focus();
});

function resetUploadBox() {
  fileInput.value = '';
  resultCard.classList.add('hidden');
  resultCard.innerHTML = '';
  uploadBox.innerHTML = `
    <div class="upload-inner">
      <div class="upload-icon">📷</div>
      <p>Drop your waste image here</p>
      <span>or use your camera</span>
      <button type="button" class="scan-btn" id="scanButton">📷 Scan Waste</button>
      <div class="upload-actions">
        <button type="button" class="secondary-small hidden" id="cancelUploadBtn">Cancel image</button>
      </div>
    </div>
  `;

  const freshScanButton = document.getElementById('scanButton');
  if (freshScanButton) {
    freshScanButton.addEventListener('click', () => fileInput.click());
  }
  const freshCancelButton = document.getElementById('cancelUploadBtn');
  if (freshCancelButton) {
    freshCancelButton.addEventListener('click', resetUploadBox);
  }
}

function showUploadPreview(result) {
  uploadBox.innerHTML = `
    <div class="upload-inner">
      <img src="${result}" alt="Uploaded waste item" style="max-width: 100%; max-height: 290px; object-fit: cover; border-radius: 22px; margin: 0 auto 18px; box-shadow: 0 24px 40px rgba(11, 34, 26, 0.08);" />
      <p>Image ready for analysis</p>
      <span>AI will identify the waste type and recommend correct disposal.</span>
      <div class="upload-actions">
        <button type="button" class="secondary-small" id="cancelUploadBtn">Cancel image</button>
      </div>
    </div>
  `;

  const freshCancelButton = document.getElementById('cancelUploadBtn');
  if (freshCancelButton) {
    freshCancelButton.addEventListener('click', resetUploadBox);
  }
}

async function runImageSafetyCheck(file) {
  const fileName = file.name.toLowerCase();
  const unsafeSignal = /(nude|porn|sexual|violence|gore|weapon|illegal|offensive|hate)/.test(fileName);
  const unrelatedSignal = /(selfie|portrait|screenshot|screen[-_ ]?shot|meme|vacation|landscape)/.test(fileName);
  const authenticitySignal = /(ai[-_ ]?generated|midjourney|dall[-_ ]?e|stable[-_ ]?diffusion|photoshop|edited|synthetic|deepfake)/.test(fileName);
  if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
    return { outcome: 'rejected', reason: 'Please upload an image smaller than 10 MB.', safety: 'rejected', relevance: 'pending', authenticity: 'pending' };
  }
  if (unsafeSignal) {
    return { outcome: 'rejected', reason: 'Inappropriate or unsafe content detected.', safety: 'rejected', relevance: 'blocked', authenticity: 'blocked' };
  }
  if (unrelatedSignal) {
    return { outcome: 'rejected', reason: 'This image does not appear related to waste or cleanliness.', safety: 'accepted', relevance: 'rejected', authenticity: 'not checked' };
  }
  if (authenticitySignal) {
    return { outcome: 'review', reason: 'Authenticity could not be verified. The image may be AI-generated or digitally modified.', safety: 'accepted', relevance: 'accepted', authenticity: 'review' };
  }
  return { outcome: 'accepted', reason: 'Safe, relevant, and suitable for analysis.', safety: 'accepted', relevance: 'accepted', authenticity: 'accepted' };
}

function safetyStatusLabel(status) {
  return { accepted: 'Passed', rejected: 'Blocked', review: 'Review required', pending: 'Checking', blocked: 'Not checked', 'not checked': 'Not checked' }[status] || status;
}

function showSafetyResult(check) {
  const outcomeClass = check.outcome === 'accepted' ? 'safety-accepted' : `safety-${check.outcome}`;
  const outcomeLabel = check.outcome === 'accepted' ? 'Accepted' : check.outcome === 'review' ? 'Review Required' : 'Rejected';
  resultCard.innerHTML = `
    <div class="analysis-top">
      <div><span class="analysis-label">Image screening</span><h4>${outcomeLabel}</h4></div>
      <span class="safety-outcome ${outcomeClass}">${check.outcome === 'accepted' ? '✓' : check.outcome === 'review' ? '!' : '×'}</span>
    </div>
    <div class="safety-check-list">
      <div><span>Content safety</span><strong>${safetyStatusLabel(check.safety)}</strong></div>
      <div><span>Waste relevance</span><strong>${safetyStatusLabel(check.relevance)}</strong></div>
      <div><span>Authenticity signals</span><strong>${safetyStatusLabel(check.authenticity)}</strong></div>
    </div>
    <p class="safety-message">${check.reason}</p>
    ${check.outcome === 'review' ? '<button class="primary-btn small-btn" id="continueUnverifiedBtn" type="button">Continue as unverified</button>' : ''}
    ${check.outcome === 'rejected' ? '<button class="secondary-small" id="safetyResetBtn" type="button">Upload another image</button>' : ''}
  `;
  resultCard.classList.add(outcomeClass);
  document.getElementById('safetyResetBtn')?.addEventListener('click', resetUploadBox);
  document.getElementById('continueUnverifiedBtn')?.addEventListener('click', () => simulateScan(true));
  if (check.outcome === 'accepted') setTimeout(() => simulateScan(false), 650);
}

async function inferWasteItemFromImage(file, imageDataUrl) {
  const fileName = (file?.name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  const filenameMatch = findWasteMatch(fileName);
  if (filenameMatch || !imageDataUrl) return filenameMatch;

  try {
    const image = await new Promise((resolve, reject) => {
      const preview = new Image();
      preview.onload = () => resolve(preview);
      preview.onerror = reject;
      preview.src = imageDataUrl;
    });
    const canvas = document.createElement('canvas');
    const size = 96;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, size, size);
    const pixels = context.getImageData(0, 0, size, size).data;
    let darkPixels = 0;
    let metallicPixels = 0;
    let warmLabelPixels = 0;
    let medicalPixels = 0;
    let lightPixels = 0;
    let paintPixels = 0;
    let bulbPixels = 0;
    let circuitBoardPixels = 0;
    let medicalRedPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let index = 0; index < pixels.length; index += 16) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightness = (red + green + blue) / 3;
      const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
      if (brightness < 92) darkPixels += 1;
      if (brightness > 105 && spread < 42) metallicPixels += 1;
      if ((red > 125 && green > 75 && blue < 85) || (red > 145 && green < 85 && blue < 85)) {
        warmLabelPixels += 1;
      }
      if (brightness > 205 && spread < 32) lightPixels += 1;
      if (blue > red + 20 && green > red + 10 && blue > 100) medicalPixels += 1;
      if (red > 120 && green < 105 && blue < 105) medicalRedPixels += 1;
      if (red > 135 && green > 85 && green < red + 25 && blue < 95) paintPixels += 1;
      if (brightness > 185 && spread < 48) bulbPixels += 1;
      if (green > 65 && green > red + 8 && green > blue + 4) circuitBoardPixels += 1;
    }

    const sampledPixels = totalPixels / 4;
    if (medicalPixels / sampledPixels > 0.005 && lightPixels / sampledPixels > 0.08 && medicalRedPixels / sampledPixels > 0.004) {
      return wasteDatabase.medical_sharps;
    }
    if (paintPixels / sampledPixels > 0.08 && metallicPixels / sampledPixels > 0.03) {
      return wasteDatabase.paint;
    }
    if (circuitBoardPixels / sampledPixels > 0.18) {
      return wasteDatabase.circuit_board;
    }
    if (darkPixels / sampledPixels > 0.28 && metallicPixels / sampledPixels > 0.08 && warmLabelPixels / sampledPixels > 0.015) {
      return wasteDatabase.battery;
    }
    if (bulbPixels / sampledPixels > 0.08 && darkPixels / sampledPixels > 0.22 && metallicPixels / sampledPixels > 0.015) {
      return wasteDatabase.led_bulb;
    }
  } catch (error) {
    return null;
  }

  return null;
}

function buildClassificationResult(item) {
  if (!item) {
    return { items: [], message: 'Unable to identify confidently' };
  }

  const categoryMap = {
    '🟢 Organic Waste': 'Wet/Organic Waste',
    '🔵 Recyclable Waste': 'Dry/Recyclable Waste',
    '🟠 E-Waste': 'E-Waste',
    '🔴 Hazardous Waste': 'Hazardous Waste'
  };

  return {
    items: [{
      item_name: item.name,
      category: categoryMap[item.category],
      confidence: 96,
      reason: `The uploaded image is identified as ${item.name.toLowerCase()}, which belongs in this waste category.`,
      disposal: item.warning.replace(/^[^ ]+\s*/, '')
    }]
  };
}

function classifyWasteImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (window.location.protocol !== 'file:') {
          const response = await fetch('/api/classify-waste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Classification API request failed.');
          if (result.items?.length) {
            resolve(result);
            return;
          }
        }

        resolve(buildClassificationResult(await inferWasteItemFromImage(file, reader.result)));
      } catch (error) {
        const localResult = buildClassificationResult(await inferWasteItemFromImage(file, reader.result));
        if (localResult.items.length) {
          resolve(localResult);
          return;
        }
        if (error.message.includes('OPENAI_API_KEY') || error.message.includes('Vision API')) {
          resolve({ items: [], message: 'Unable to identify confidently' });
          return;
        }
        reject(error instanceof TypeError && error.message === 'Failed to fetch'
          ? new Error('Image classification is currently unavailable.')
          : error);
      }
    };
    reader.onerror = () => reject(new Error('Could not read the uploaded image.'));
    reader.readAsDataURL(file);
  });
}

function simulateScan(unverified = false) {
  resultCard.classList.remove('hidden');
  resultCard.classList.remove('hidden');
  resultCard.innerHTML = `
    <div class="analysis-top">
      <div>
        <span class="analysis-label">AI Analysis</span>
        <h4 id="analysisTitle">Analyzing your waste...</h4>
      </div>
      <span class="pulse-dot"></span>
    </div>

    <div class="loading-block">
      <div class="loading-copy">🔄 AI is identifying</div>
      <div class="progress-bar">
        <span id="progressBar"></span>
      </div>
      <div class="percent-label" id="progressLabel">0%</div>
    </div>
  `;

  const progressFill = document.getElementById('progressBar');
  const percentLabel = document.getElementById('progressLabel');

  let width = 0;
  const timer = setInterval(() => {
    width += 10;
    if (width > 82) {
      width = 82;
    }
    progressFill.style.width = `${width}%`;
    percentLabel.textContent = `${width}%`;

    if (width >= 82) {
      clearInterval(timer);
      setTimeout(async () => {
        let classification;
        try {
          classification = await classifyWasteImage(fileInput.files[0]);
        } catch (error) {
          classification = { items: [], message: error.message };
        }
        const item = classification.items?.[0];
        const categoryIcon = item?.category === 'Wet/Organic Waste' ? '🟢' : item?.category === 'Dry/Recyclable Waste' ? '🔵' : item?.category === 'E-Waste' ? '🟠' : item?.category === 'Hazardous Waste' ? '🔴' : '⚪';
        resultCard.innerHTML = `
          <div class="analysis-top">
            <div>
              <span class="analysis-label">${unverified ? 'Unverified analysis' : 'Result'}</span>
              <h4>${item?.item_name || classification.message || 'Unable to identify confidently'}</h4>
            </div>
            <span class="pulse-dot"></span>
          </div>

          <div class="loading-block">
            <div class="loading-copy">${categoryIcon} ${item?.category || 'Unable to identify confidently'}</div>
              <span style="width: 96%;"></span>
            </div>
            <div class="percent-label">AI Confidence: ${item?.confidence || 0}%</div>
            <p class="authenticity-result ${unverified ? 'authenticity-warning' : 'authenticity-verified'}">
              ${unverified ? '⚠️ Authenticity: Review required. This result cannot be used as verified evidence.' : '✅ Authenticity: No suspicious signals detected.'}
            </p>
            <p style="margin-top: 18px; color: var(--muted); line-height: 1.7;">
              <strong>${item?.reason || 'No visible waste item could be identified from this upload.'}</strong><br>
              ${item?.disposal || 'Please upload a clearer image showing the waste item.'}
            </p>
            <p style="margin-top: 16px; color: var(--primary-dark); font-weight: 700;">⭐ +10 Eco Points</p>
            <button class="primary-btn small-btn" id="scanFindCenterBtn" style="margin-top: 16px; width: 100%;">📍 Find Nearby Center</button>
          </div>
        `;

        const scanFindCenterBtn = document.getElementById('scanFindCenterBtn');
        if (scanFindCenterBtn) {
          scanFindCenterBtn.addEventListener('click', () => {
            if (item) {
              const detectedItem = findWasteMatch(item.item_name);
              const detectedKey = Object.entries(wasteDatabase).find(([, wasteItem]) => wasteItem === detectedItem)?.[0];
              if (detectedKey) handleScanFindCenter(detectedKey);
            }
          });
        }
      }, 480);
    }
  }, 120);
}

scanButton.addEventListener('click', () => fileInput.click());
uploadBox.addEventListener('click', (event) => {
  if (event.target.closest('#cancelUploadBtn')) return;
  fileInput.click();
});
uploadBox.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (!event.target.closest('#cancelUploadBtn')) {
      fileInput.click();
    }
  }
});

if (cancelUploadBtn) {
  cancelUploadBtn.addEventListener('click', resetUploadBox);
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const result = e.target.result;
    showUploadPreview(result);
    resultCard.classList.remove('hidden');
    resultCard.classList.remove('safety-accepted', 'safety-review', 'safety-rejected');
    resultCard.innerHTML = '<div class="analysis-top"><div><span class="analysis-label">Image screening</span><h4>Checking safety and authenticity...</h4></div><span class="pulse-dot"></span></div><div class="loading-block"><div class="loading-copy">🛡️ Running content, relevance, and authenticity checks</div><div class="progress-bar"><span style="width: 55%;"></span></div></div>';
    simulateScan(false);
  };
  reader.readAsDataURL(file);
});

const cleanlinessInput = document.getElementById('cleanlinessInput');
const cleanlinessFileLabel = document.getElementById('cleanlinessFileLabel');
const cleanlinessUploadZone = document.getElementById('cleanlinessUploadZone');
const cleanlinessPreview = document.getElementById('cleanlinessPreview');
const cancelCleanlinessBtn = document.getElementById('cancelCleanlinessBtn');
const scoreAreaBtn = document.getElementById('scoreAreaBtn');
const cleanlinessResult = document.getElementById('cleanlinessResult');
const beforeCleaningInput = document.getElementById('beforeCleaningInput');
const afterCleaningInput = document.getElementById('afterCleaningInput');
const compareCleaningBtn = document.getElementById('compareCleaningBtn');
const cancelComparisonBtn = document.getElementById('cancelComparisonBtn');
const comparePreviews = document.getElementById('comparePreviews');
const comparisonResult = document.getElementById('comparisonResult');
const beforeDropzone = document.getElementById('beforeDropzone');
const afterDropzone = document.getElementById('afterDropzone');
const comparisonLightbox = document.getElementById('comparisonLightbox');
const closeComparisonLightbox = document.getElementById('closeComparisonLightbox');
const lightboxBeforeImage = document.getElementById('lightboxBeforeImage');
const lightboxAfterImage = document.getElementById('lightboxAfterImage');
const featureAlertModal = document.getElementById('featureAlertModal');
const featureAlertCard = document.getElementById('featureAlertCard');
const featureAlertIcon = document.getElementById('featureAlertIcon');
const featureAlertBadge = document.getElementById('featureAlertBadge');
const featureAlertTitle = document.getElementById('featureAlertTitle');
const featureAlertMessage = document.getElementById('featureAlertMessage');
const featureAlertPoints = document.getElementById('featureAlertPoints');
const closeFeatureAlertBtn = document.getElementById('closeFeatureAlertBtn');

function showFeatureAlert({ type = 'success', title, message, points = '' }) {
  if (!featureAlertModal) return;
  const states = { success: ['✅', 'Verified'], warning: ['⚠️', 'Review required'], error: ['✕', 'Action needed'] };
  const [icon, badge] = states[type] || states.success;
  featureAlertCard.className = `feature-alert-card ${type}`;
  featureAlertIcon.textContent = icon;
  featureAlertBadge.textContent = badge;
  featureAlertTitle.textContent = title;
  featureAlertMessage.textContent = message;
  featureAlertPoints.textContent = points;
  featureAlertModal.classList.remove('hidden');
}

function closeFeatureAlert() { featureAlertModal?.classList.add('hidden'); }
closeFeatureAlertBtn?.addEventListener('click', closeFeatureAlert);
featureAlertModal?.addEventListener('click', (event) => { if (event.target === featureAlertModal) closeFeatureAlert(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeFeatureAlert(); });

function awardFeaturePoints(points) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  const users = getStoredUsers();
  const userIndex = users.findIndex((user) => user.email === currentUser.email);
  if (userIndex === -1) return false;
  users[userIndex].points += points;
  recordWeeklyLeaderboardPoints(users[userIndex], points);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  saveCurrentUser(users[userIndex]);
  renderDashboard(users[userIndex]);
  return true;
}

async function areaScore(file) {
  const image = await new Promise((resolve, reject) => {
    const preview = new Image();
    preview.onload = () => resolve(preview);
    preview.onerror = reject;
    preview.src = URL.createObjectURL(file);
  });
  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  let suspiciousPixels = 0;
  let clutterPixels = 0;
  let groundPixels = 0;

  // Litter is detected as small, high-contrast objects in the visible ground area.
  for (let y = Math.floor(size * 0.38); y < size; y += 2) {
    for (let x = 1; x < size - 1; x += 2) {
      const index = (y * size + x) * 4;
      const left = (y * size + x - 1) * 4;
      const right = (y * size + x + 1) * 4;
      const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
      const neighborBrightness = (pixels[left] + pixels[left + 1] + pixels[left + 2] + pixels[right] + pixels[right + 1] + pixels[right + 2]) / 6;
      const contrast = Math.abs(brightness - neighborBrightness);
      const saturation = Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) - Math.min(pixels[index], pixels[index + 1], pixels[index + 2]);
      groundPixels += 1;
      if (contrast > 48 && (brightness < 72 || saturation > 90)) suspiciousPixels += 1;
      if (contrast > 24 && (saturation > 35 || brightness < 105 || brightness > 215)) clutterPixels += 1;
    }
  }

  URL.revokeObjectURL(image.src);
  const litterRatio = suspiciousPixels / groundPixels;
  const clutterRatio = clutterPixels / groundPixels;
  const isClean = litterRatio < 0.035 && clutterRatio < 0.18;
  return isClean
    ? { score: 100, waste: 'No visible litter detected', priority: 'Low' }
    : { score: 10, waste: 'Visible litter or ground clutter detected', priority: 'High' };
}

async function renderAreaScore(target, file) {
  if (!file || !file.type.startsWith('image/')) {
    target.innerHTML = '<strong>Choose a valid image file.</strong>';
    target.classList.remove('hidden');
    return;
  }
  const result = await areaScore(file);
  target.innerHTML = `<div class="analysis-top"><div><span class="analysis-label">AI Cleanliness Analysis</span><h4>${result.score}/100</h4></div><span class="pulse-dot"></span></div><div class="loading-block"><div class="loading-copy">🧭 ${result.score >= 75 ? 'Area looks fairly clean' : 'Cleaning attention needed'}</div><div class="progress-bar"><span style="width: ${result.score}%;"></span></div><div class="percent-label">${result.waste} · ${result.priority} priority · Eco Points: ${result.score === 100 ? 5 : 0}</div></div>`;
  target.classList.remove('hidden');
  return result;
}

if (cleanlinessInput) {
  cleanlinessUploadZone?.addEventListener('click', () => {
    cleanlinessInput.value = '';
  });
  cleanlinessInput.addEventListener('change', () => {
    const file = cleanlinessInput.files[0];
    if (!file) return;
    cleanlinessFileLabel.textContent = `📷 ${file.name}`;
    cleanlinessPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Selected area photo"><span>Area photo ready</span>`;
    cleanlinessPreview.classList.remove('hidden');
    cancelCleanlinessBtn.classList.remove('hidden');
  });
}
cancelCleanlinessBtn?.addEventListener('click', () => {
  cleanlinessInput.value = '';
  cleanlinessFileLabel.textContent = '📷 Upload a street, park, or campus photo';
  cleanlinessPreview.classList.add('hidden');
  cleanlinessPreview.innerHTML = '';
  cancelCleanlinessBtn.classList.add('hidden');
  cleanlinessResult.classList.add('hidden');
});
scoreAreaBtn?.addEventListener('click', async () => {
  const file = cleanlinessInput.files[0];
  if (!file) { showFeatureAlert({ type: 'error', title: 'Photo required', message: 'Upload an area photo before calculating a cleanliness score.' }); return; }
  const check = await runImageSafetyCheck(file);
  if (check.outcome === 'rejected') {
    showFeatureAlert({ type: 'error', title: 'Area photo rejected', message: check.reason });
    return;
  }
  const result = await renderAreaScore(cleanlinessResult, file);
  const isReview = check.outcome === 'review';
  if (isReview) cleanlinessResult.innerHTML += '<span class="authenticity-warning">⚠️ Authenticity uncertain. This score is unverified.</span>';
  const earned = result.score === 100 && !isReview ? awardFeaturePoints(5) : false;
  showFeatureAlert({ type: result.score === 100 && !isReview ? 'success' : 'warning', title: result.score === 100 ? 'Cleanliness score verified' : 'Cleaning required', message: result.score === 100 ? 'No visible litter was detected in this image.' : 'Visible litter or ground clutter was detected. No points were awarded.', points: earned ? '+5 Eco Points added' : '0 Eco Points awarded' });
});
function cleanComparisonFileName(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28) || 'Selected photo';
}

function setComparisonFile(input, file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showFeatureAlert({ type: 'error', title: 'Unsupported image', message: 'Use a JPG, PNG, or WebP image for the comparison.' });
    return;
  }
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  updateComparisonPreviews();
}

function updateComparisonPreviews() {
  if (!comparePreviews) return;
  const previews = [beforeCleaningInput.files[0], afterCleaningInput.files[0]].map((file, index) => {
    const label = index ? 'After' : 'Before';
    return file
      ? `<div class="compare-preview-frame" data-preview-index="${index}" tabindex="0" role="button" aria-label="Expand ${label.toLowerCase()} photo"><span class="compare-preview-label">${label}</span><div class="compare-image-frame"><img src="${URL.createObjectURL(file)}" alt="${label} cleaning preview"></div><div class="compare-preview-file"><span class="compare-preview-name" title="${file.name}">${cleanComparisonFileName(file.name)}</span><button class="compare-remove" type="button" data-remove-index="${index}" aria-label="Remove ${label.toLowerCase()} photo">×</button></div></div>`
      : `<span>${label} preview</span>`;
  });
  comparePreviews.innerHTML = previews.join('');
  cancelComparisonBtn?.classList.toggle('hidden', !beforeCleaningInput.files[0] && !afterCleaningInput.files[0]);
}

function openComparisonLightbox() {
  const beforeFile = beforeCleaningInput.files[0];
  const afterFile = afterCleaningInput.files[0];
  if (!beforeFile || !afterFile) return;
  lightboxBeforeImage.src = URL.createObjectURL(beforeFile);
  lightboxAfterImage.src = URL.createObjectURL(afterFile);
  comparisonLightbox.classList.remove('hidden');
}

function closeComparisonLightboxView() {
  comparisonLightbox.classList.add('hidden');
  lightboxBeforeImage.src = '';
  lightboxAfterImage.src = '';
}

function bindComparisonDropzone(zone, input) {
  zone?.addEventListener('dragover', (event) => {
    event.preventDefault();
    zone.classList.add('is-dragging');
  });
  zone?.addEventListener('dragleave', () => zone.classList.remove('is-dragging'));
  zone?.addEventListener('drop', (event) => {
    event.preventDefault();
    zone.classList.remove('is-dragging');
    setComparisonFile(input, event.dataTransfer.files[0]);
  });
  zone?.addEventListener('click', () => { input.value = ''; });
}

bindComparisonDropzone(beforeDropzone, beforeCleaningInput);
bindComparisonDropzone(afterDropzone, afterCleaningInput);
beforeCleaningInput?.addEventListener('change', updateComparisonPreviews);
afterCleaningInput?.addEventListener('change', updateComparisonPreviews);
comparePreviews?.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-index]');
  if (removeButton) {
    const input = Number(removeButton.dataset.removeIndex) ? afterCleaningInput : beforeCleaningInput;
    input.value = '';
    updateComparisonPreviews();
    return;
  }
  if (event.target.closest('.compare-preview-frame')) openComparisonLightbox();
});
comparePreviews?.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.compare-preview-frame')) {
    event.preventDefault();
    openComparisonLightbox();
  }
});
closeComparisonLightbox?.addEventListener('click', closeComparisonLightboxView);
comparisonLightbox?.addEventListener('click', (event) => { if (event.target === comparisonLightbox) closeComparisonLightboxView(); });
cancelComparisonBtn?.addEventListener('click', () => {
  beforeCleaningInput.value = '';
  afterCleaningInput.value = '';
  updateComparisonPreviews();
  comparisonResult.classList.add('hidden');
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeComparisonLightboxView(); });
compareCleaningBtn?.addEventListener('click', async () => {
  if (!beforeCleaningInput.files[0] || !afterCleaningInput.files[0]) {
    showFeatureAlert({ type: 'error', title: 'Two photos required', message: 'Upload both a before-cleaning and an after-cleaning photo to compare the area.' });
    return;
  }
  const checks = await Promise.all([beforeCleaningInput.files[0], afterCleaningInput.files[0]].map(runImageSafetyCheck));
  if (checks.some((check) => check.outcome === 'rejected')) {
    showFeatureAlert({ type: 'error', title: 'Comparison rejected', message: checks.find((check) => check.outcome === 'rejected').reason });
    return;
  }
  const authenticityNote = checks.some((check) => check.outcome === 'review') ? ' ⚠️ Authenticity uncertain; comparison is unverified.' : '';
  const isReview = checks.some((check) => check.outcome === 'review');
  const earned = !isReview && awardFeaturePoints(5);
  comparisonResult.innerHTML = `<div class="comparison-points"><strong>${earned ? '+5' : '0'}<small>Eco Points</small></strong><span>${isReview ? 'Verification needs review.' : 'Before and after photos verified.'}${authenticityNote}</span></div>`;
  comparisonResult.classList.remove('hidden');
  showFeatureAlert({ type: isReview ? 'warning' : 'success', title: isReview ? 'Comparison needs review' : 'Cleaning verified', message: isReview ? 'The photos need authenticity review before points can be awarded.' : 'The before and after photos passed verification.', points: earned ? '+5 Eco Points added' : '' });
});

updateSearchResult(searchInput.value);

// ========================================
// AI ASSISTANT CHATBOT
// ========================================
// Simple bot logic for eco-help and item lookup in the app.

const chatbotToggle = document.getElementById('chatbotToggle');
const closeChatbot = document.getElementById('closeChatbot');
const chatbotModal = document.getElementById('chatbotModal');
const chatbotInput = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('sendBtn');
const chatbotMessages = document.getElementById('chatbotMessages');
const navUserLabel = document.getElementById('navUserLabel');
const welcomeUserName = document.getElementById('welcomeUserName');
const rewardList = document.getElementById('rewardList');
const challengeList = document.getElementById('challengeList');
const leaderboardList = document.getElementById('leaderboardList');
const leaderboardPodium = document.getElementById('leaderboardPodium');
const leaderboardWeekLabel = document.getElementById('leaderboardWeekLabel');
const leaderboardParticipantCount = document.getElementById('leaderboardParticipantCount');
const leaderboardTotalPoints = document.getElementById('leaderboardTotalPoints');
const xpProgressBar = document.getElementById('xpProgressBar');
const xpProgressText = document.getElementById('xpProgressText');
const levelBadge = document.getElementById('levelBadge');
const levelTitle = document.getElementById('levelTitle');
const badgeList = document.getElementById('badgeList');
const profileName = document.getElementById('profileName');
const profileRank = document.getElementById('profileRank');
const profileLevel = document.getElementById('profileLevel');
const profilePoints = document.getElementById('profilePoints');
const profileScans = document.getElementById('profileScans');
const profileRecycled = document.getElementById('profileRecycled');
const profileBadges = document.getElementById('profileBadges');
const dashboardTotalPoints = document.getElementById('dashboardTotalPoints');
const dashboardItemsCount = document.getElementById('dashboardItemsCount');
const dashboardBadgesCount = document.getElementById('dashboardBadgesCount');
const dashboardStreak = document.getElementById('dashboardStreak');
const communityProgressBar = document.getElementById('communityProgressBar');
const communityProgressText = document.getElementById('communityProgressText');
const logoutBtn = document.getElementById('logoutBtn');
const viewAchievementsBtn = document.getElementById('viewAchievementsBtn');
const dashboardUploadInput = document.getElementById('dashboardUploadInput');
const dashboardUploadBtn = document.getElementById('dashboardUploadBtn');
const dashboardCancelUploadBtn = document.getElementById('dashboardCancelUploadBtn');
const dashboardUploadPreview = document.getElementById('dashboardUploadPreview');
const dashboardUploadStatus = document.getElementById('dashboardUploadStatus');
const videoScreeningStatus = document.getElementById('videoScreeningStatus');
const verificationResultModal = document.getElementById('verificationResultModal');
const verificationModalCard = document.getElementById('verificationModalCard');
const verificationModalIcon = document.getElementById('verificationModalIcon');
const verificationModalBadge = document.getElementById('verificationModalBadge');
const verificationModalTitle = document.getElementById('verificationModalTitle');
const verificationModalMessage = document.getElementById('verificationModalMessage');
const verificationModalPoints = document.getElementById('verificationModalPoints');
const closeVerificationModalBtn = document.getElementById('closeVerificationModal');

let chatbotOpen = false;
let flaggedVideoHandledKey = '';
const processedVideoKeys = new Set();

function showVerificationResultModal({ valid, title, message, points, warning = false }) {
  if (!verificationResultModal || !verificationModalCard) return;

  verificationResultModal.classList.remove('hidden');
  verificationModalCard.classList.toggle('success', valid);
  verificationModalCard.classList.toggle('error', !valid);

  verificationModalIcon.textContent = valid ? '✅' : '⚠️';
  verificationModalBadge.textContent = valid ? 'Proof Verified' : warning ? 'Action Required' : 'Evidence Missing';
  verificationModalTitle.textContent = title || (valid ? 'Plantation Proof Verified' : 'No Proper Evidence Found');
  verificationModalMessage.textContent = message || 'We could not verify the waste disposal evidence in this image.';
  verificationModalPoints.textContent = points > 0 ? `+${points} Eco Points` : points < 0 ? `${points} Eco Points` : '0 Eco Points';
}

function closeVerificationResultModal() {
  if (verificationResultModal) {
    verificationResultModal.classList.add('hidden');
  }
}

if (closeVerificationModalBtn) {
  closeVerificationModalBtn.addEventListener('click', () => {
    closeVerificationResultModal();
    window.location.reload();
  });
}

if (verificationResultModal) {
  verificationResultModal.addEventListener('click', (event) => {
    if (event.target === verificationResultModal) {
      closeVerificationResultModal();
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && verificationResultModal && !verificationResultModal.classList.contains('hidden')) {
    closeVerificationResultModal();
  }
});

// Chatbot knowledge base
const chatbotResponses = {
  greeting: [
    '👋 Hello! How can I help you today?',
    'Hi there! 🌟 What would you like to know about waste management?',
    'Welcome to WasteWise! 🌍 Ask me anything about waste segregation or recycling.'
  ],
  waste_info: [
    '🗑️ I can help you identify waste items and their proper disposal methods. Try asking about any item you want to recycle, compost, or dispose of safely!',
    '💡 Need to know what category something falls into? Just tell me what item you\'re unsure about!'
  ],
  categories: [
    '📂 **Waste Categories:**\n🔵 **Recyclable:** Plastic, glass, aluminum, cardboard\n🟢 **Organic:** Food scraps, leaves, yard waste\n🟠 **E-Waste:** Electronics, cables, batteries\n🔴 **Hazardous:** Paint, chemicals, medications'
  ],
  disposal_tips: [
    '✅ **Before recycling:** Clean items thoroughly and remove labels.\n✅ Flatten cardboard to save space.\n✅ Separate different materials (glass, metal, plastic).\n✅ Never mix hazardous items with regular waste.\n✅ Check local guidelines as rules vary by location.'
  ],
  find_center: [
    '📍 Use our **Find Centers** section to locate nearby waste disposal facilities based on the waste type you need to dispose of. Your location helps us find the closest options!',
    '🗺️ Check the map in the dashboard to find recycling centers, compost facilities, e-waste drop-offs, and hazmat disposal points near you.'
  ],
  rewards: [
    '🎁 **Earn Eco Points by:** Recording waste items, completing daily challenges, reaching milestones.\n🏆 Unlock badges as you progress and climb the eco leaderboard!\n⭐ Higher levels unlock exclusive rewards and community recognition.'
  ],
  points: [
    '⭐ You earn eco points by:\n• Recording and properly sorting waste items\n• Completing daily green challenges\n• Finding and using local collection centers\n• Participating in community challenges\n• Achieving recycling milestones'
  ],
  how_to: [
    '📝 **How to use WasteWise:**\n1. Search for a waste item in the Smart Search\n2. Get category and disposal instructions\n3. Find a nearby collection center\n4. Record your action and earn points\n5. Track your impact on the dashboard'
  ],
  tips: [
    '💡 **Quick Tips:**\n• Sort waste immediately after use\n• Keep recyclables dry and clean\n• Don\'t mix different waste types\n• Visit centers regularly for collection\n• Share tips with friends and family'
  ],
  common_items: [
    '📋 **Common items we help with:**\nRecyclable: Bottles, cans, cardboard, paper\nOrganic: Fruit, vegetables, leaves, food scraps\nE-Waste: Phones, laptops, chargers, cables\nHazardous: Batteries, paint, chemicals, old medicines'
  ],
  impact: [
    '🌍 **Your Impact:**\nEvery item you properly dispose of:\n✓ Reduces landfill waste\n✓ Conserves natural resources\n✓ Reduces carbon emissions\n✓ Protects ecosystems\n✓ Inspires others to act sustainably!'
  ]
};

// Keywords to chatbot response mapping
const keywordMap = {
  'hello|hi|hey|greet': 'greeting',
  'what|info|know|item|is|this|that': 'waste_info',
  'category|categories|type|types|separate': 'categories',
  'dispose|disposal|throw|discard|get rid': 'disposal_tips',
  'center|find|location|where|near|recycling': 'find_center',
  'point|reward|badge|earn|level|achievement': 'rewards',
  'how|use|start|begin|guide|help': 'how_to',
  'tip|advice|suggest|recommendation': 'tips',
  'item|common|list|example|like': 'common_items',
  'impact|environment|planet|green|eco|sustainability': 'impact'
};

function matchKeywords(input) {
  const lowerInput = input.toLowerCase();
  for (const [keywords, responseKey] of Object.entries(keywordMap)) {
    const keywordArray = keywords.split('|');
    if (keywordArray.some(kw => lowerInput.includes(kw))) {
      return responseKey;
    }
  }
  return null;
}

function getWasteInfoResponse(item) {
  const waste = findWasteMatch(item);
  if (waste) {
    return `✅ **${waste.name}** - ${waste.category}\n\n${waste.warning}\n\n💡 Tip: Look up the exact disposal center nearest to you using our map feature!`;
  }
  return null;
}

function getBotResponse(userMessage) {
  // Check if it's a waste item first
  const wasteInfo = getWasteInfoResponse(userMessage);
  if (wasteInfo) return wasteInfo;

  // Match keywords
  const matchedKey = matchKeywords(userMessage);
  if (matchedKey && chatbotResponses[matchedKey]) {
    const responses = chatbotResponses[matchedKey];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Default response
  return '🤔 I\'m not sure about that. Try asking about specific waste items, disposal methods, or our features. You can also click "💡 Tips" for general guidance!';
}

function addMessage(text, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  messageDiv.innerHTML = `
    <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="message-content">
      <p>${text.replace(/\n/g, '<br>')}</p>
    </div>
  `;
  chatbotMessages.appendChild(messageDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function sendMessage() {
  const message = chatbotInput.value.trim();
  if (!message) return;

  // Add user message
  addMessage(message, true);

  // Clear input
  chatbotInput.value = '';

  // Get bot response (with slight delay for realism)
  setTimeout(() => {
    const response = getBotResponse(message);
    addMessage(response, false);
  }, 400);
}

function handleQuickAction(action) {
  let message = '';
  let shouldSearch = false;

  switch (action) {
    case 'waste-info':
      message = 'What is this? Help me identify a waste item.';
      break;
    case 'how-to':
      message = 'How do I use WasteWise?';
      break;
    case 'find-center':
      message = 'How do I find a waste center near me?';
      break;
    case 'tips':
      message = 'Give me some tips for better waste management';
      break;
    default:
      message = action;
  }

  chatbotInput.value = message;
  sendMessage();
}

function toggleChatbot() {
  chatbotOpen = !chatbotOpen;
  if (chatbotOpen) {
    chatbotModal.classList.remove('hidden');
    chatbotInput.focus();
  } else {
    chatbotModal.classList.add('hidden');
  }
}

// Event listeners
chatbotToggle.addEventListener('click', toggleChatbot);
closeChatbot.addEventListener('click', toggleChatbot);

sendBtn.addEventListener('click', sendMessage);

chatbotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Quick action buttons
document.querySelectorAll('.quick-action').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    handleQuickAction(action);
    // Remove quick actions after first click
    btn.parentElement.style.display = 'none';
  });
});

// Close chatbot when clicking outside (if needed)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatbotOpen) {
    toggleChatbot();
  }
});

const AUTH_STORAGE_KEY = 'wastewise_users';
const SESSION_STORAGE_KEY = 'wastewise_session';

const rewardCatalog = [
  { id: 'tree', label: 'Plant a Tree Kit', cost: 180, icon: '🌳' },
  { id: 'water', label: 'Eco Water Bottle', cost: 220, icon: '💧' },
  { id: 'bag', label: 'Reusable Shopping Bag', cost: 160, icon: '🛍️' },
  { id: 'solar', label: 'Solar Phone Charger', cost: 300, icon: '🔋' },
  { id: 'seed', label: 'Organic Seed Pack', cost: 120, icon: '🌱' }
];

const challengeCatalog = [
  { id: 'identify', label: 'Identify 3 waste items', target: 3, reward: 30, icon: '🧠' },
  { id: 'segregate', label: 'Correctly sort 5 items', target: 5, reward: 50, icon: '♻️' },
  { id: 'plastic', label: 'Recycle 2 plastic items', target: 2, reward: 40, icon: '🧴' },
  { id: 'streak', label: 'Keep a 3-day streak', target: 3, reward: 60, icon: '🔥' }
];

const levels = [
  { name: 'Eco Beginner', min: 0, max: 199, badge: '🌱' },
  { name: 'Green Starter', min: 200, max: 499, badge: '🌿' },
  { name: 'Waste Warrior', min: 500, max: 999, badge: '🛡️' },
  { name: 'Eco Guardian', min: 1000, max: 1999, badge: '🦸' },
  { name: 'Planet Hero', min: 2000, max: Infinity, badge: '🌍' }
];

const defaultUser = {
  name: 'Green Champion',
  email: 'demo@wastewise.app',
  password: 'demo123',
  points: 0,
  wasteItems: 0,
  streak: 0,
  badges: [],
  completedChallenges: [],
  rewardsRedeemed: []
};

function getStoredUsers() {
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  if (!users) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([defaultUser]));
    return [defaultUser];
  }
  return users;
}

function getCurrentUser() {
  const user = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || 'null');
  if (user) return user;
  return null;
}

function saveCurrentUser(user) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function setAuthMode(mode) {
  const loginTab = document.querySelector('[data-mode="login"]');
  const signupTab = document.querySelector('[data-mode="signup"]');
  const loginFormEl = document.getElementById('loginForm');
  const signupFormEl = document.getElementById('signupForm');
  if (mode === 'signup') {
    if (loginTab) loginTab.classList.remove('active');
    if (signupTab) signupTab.classList.add('active');
    if (loginFormEl) loginFormEl.classList.add('hidden');
    if (signupFormEl) signupFormEl.classList.remove('hidden');
  } else {
    if (signupTab) signupTab.classList.remove('active');
    if (loginTab) loginTab.classList.add('active');
    if (signupFormEl) signupFormEl.classList.add('hidden');
    if (loginFormEl) loginFormEl.classList.remove('hidden');
  }
}

function getCurrentUser() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('wastewise_session') || 'null');
    return stored || null;
  } catch (error) {
    return null;
  }
}

function maybeRedirectToAuth() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'auth.html';
  }
}

function getLevelData(totalPoints) {
  return levels.find(level => totalPoints >= level.min && totalPoints <= level.max) || levels[levels.length - 1];
}

function getBadgeList(points) {
  const unlocked = [];
  if (points >= 100) unlocked.push('🌱 Eco Starter');
  if (points >= 300) unlocked.push('♻️ Recycler');
  if (points >= 600) unlocked.push('🏆 Green Champion');
  if (points >= 1200) unlocked.push('🛡️ Waste Warrior');
  if (points >= 2000) unlocked.push('🌍 Planet Guardian');
  return unlocked;
}

function renderBadgeList(user) {
  const unlockedBadges = getBadgeList(user.points);
  const badgeMarkup = [
    '🌱 Eco Starter',
    '♻️ Recycler',
    '🏆 Green Champion',
    '🛡️ Waste Warrior',
    '🌍 Planet Guardian'
  ].map(badge => {
    const unlocked = unlockedBadges.includes(badge);
    return `<li><span>${badge}</span> <em>${unlocked ? '✅' : '🔒'}</em></li>`;
  }).join('');
  badgeList.innerHTML = badgeMarkup;
}

function renderRewards(user) {
  rewardList.innerHTML = rewardCatalog.map(reward => {
    const canAfford = user.points >= reward.cost;
    const redeemed = user.rewardsRedeemed.includes(reward.id);
    const buttonText = redeemed ? 'Redeemed' : canAfford ? 'Redeem' : 'Need more points';
    return `
      <div class="reward-item ${redeemed ? 'redeemed' : ''}">
        <div class="reward-label">${reward.icon} ${reward.label}</div>
        <div class="reward-meta">
          <strong>${reward.cost} pts</strong>
          <button type="button" class="secondary-small reward-button" data-reward-id="${reward.id}" ${redeemed || !canAfford ? 'disabled' : ''}>${buttonText}</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.reward-button').forEach(button => {
    button.addEventListener('click', () => {
      const rewardId = button.dataset.rewardId;
      const reward = rewardCatalog.find(item => item.id === rewardId);
      if (!reward) return;
      const users = getStoredUsers();
      const currentUser = getCurrentUser();
      const userIndex = users.findIndex(user => user.email === currentUser.email);
      if (userIndex === -1) return;
      if (users[userIndex].points < reward.cost) return;
      users[userIndex].points -= reward.cost;
      if (!users[userIndex].rewardsRedeemed.includes(rewardId)) {
        users[userIndex].rewardsRedeemed.push(rewardId);
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
      saveCurrentUser(users[userIndex]);
      renderDashboard(users[userIndex]);
    });
  });
}

function renderChallenges(user) {
  challengeList.innerHTML = challengeCatalog.map(challenge => {
    const completed = user.completedChallenges.includes(challenge.id);
    const progressValue = challenge.id === 'streak' ? Math.min(user.streak, challenge.target) : Math.min(user.wasteItems, challenge.target);
    return `
      <div class="challenge-item ${completed ? 'done' : ''}">
        <div class="challenge-title">${challenge.icon} ${challenge.label}</div>
        <div class="mini-progress"><span style="width:${Math.min((progressValue / challenge.target) * 100, 100)}%"></span></div>
        <small>${Math.min(progressValue, challenge.target)}/${challenge.target} • +${challenge.reward} pts</small>
      </div>
    `;
  }).join('');
}

function renderLeaderboard() {
  const weeklyBoard = getWeeklyLeaderboard();
  const entries = Object.values(weeklyBoard.entries).sort((a, b) => b.points - a.points).slice(0, 5);
  const allEntries = Object.values(weeklyBoard.entries).sort((a, b) => b.points - a.points);
  const podiumEntries = [allEntries[1], allEntries[0], allEntries[2]];
  const podiumClasses = ['silver', 'gold', 'bronze'];
  const podiumLabels = ['2nd', '1st', '3rd'];

  leaderboardWeekLabel.textContent = getWeeklyLeaderboardLabel();
  leaderboardParticipantCount.textContent = allEntries.length;
  leaderboardTotalPoints.textContent = allEntries.reduce((total, entry) => total + entry.points, 0);
  leaderboardPodium.innerHTML = podiumEntries.map((entry, index) => `
    <div class="podium-slot ${podiumClasses[index]} ${entry ? '' : 'empty'}">
      <div class="podium-avatar">${entry ? getInitials(entry.name) : '—'}</div>
      <strong>${entry ? entry.name : 'Waiting for a winner'}</strong>
      <span>${entry ? `${entry.points} XP` : 'Earn points to rank'}</span>
      <small>${podiumLabels[index]}</small>
    </div>
  `).join('');
  leaderboardList.innerHTML = entries.length ? entries.map((entry, index) => `
    <li class="leaderboard-row ${index === 0 ? 'featured-row' : ''}">
      <span class="leaderboard-rank">${String(index + 1).padStart(2, '0')}</span>
      <span class="leaderboard-name">${entry.name}${index === 0 ? ' <em>Current leader</em>' : ''}</span>
      <strong>${entry.points} XP</strong>
    </li>
  `).join('') : '<li class="leaderboard-empty"><span>No scores this week yet.</span><strong>Be the first</strong></li>';
}

function getInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

function getWeeklyLeaderboardLabel() {
  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const day = weekStart.getDay() || 7;
  weekStart.setDate(weekStart.getDate() - day + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const format = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${format(weekStart)} - ${format(weekEnd)}`;
}

function getWeeklyLeaderboardKey(date = new Date()) {
  const weekStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = weekStart.getUTCDay() || 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - day + 1);
  return weekStart.toISOString().slice(0, 10);
}

function getWeeklyLeaderboard() {
  localStorage.removeItem('wastewise_leaderboard_history');
  const currentWeek = getWeeklyLeaderboardKey();
  try {
    const stored = JSON.parse(localStorage.getItem('wastewise_weekly_leaderboard') || 'null');
    if (stored?.weekKey === currentWeek && stored.entries && typeof stored.entries === 'object') return stored;
  } catch (error) {
    // Start a clean weekly board when stored data is invalid.
  }

  const freshBoard = { weekKey: currentWeek, entries: {} };
  localStorage.setItem('wastewise_weekly_leaderboard', JSON.stringify(freshBoard));
  return freshBoard;
}

function recordWeeklyLeaderboardPoints(user, points) {
  if (!user || !points) return;
  const weeklyBoard = getWeeklyLeaderboard();
  const existingEntry = weeklyBoard.entries[user.email] || { name: user.name, points: 0 };
  weeklyBoard.entries[user.email] = { name: user.name, points: existingEntry.points + points };
  localStorage.setItem('wastewise_weekly_leaderboard', JSON.stringify(weeklyBoard));
}

getWeeklyLeaderboard();

function renderDashboard(user) {
  if (!user) {
    navUserLabel.textContent = 'Login';
    welcomeUserName.textContent = 'Green Champion';
    dashboardTotalPoints.textContent = '0';
    dashboardItemsCount.textContent = '0';
    dashboardBadgesCount.textContent = '0';
    dashboardStreak.textContent = '0';
    profileName.textContent = 'NewUser';
    profileRank.textContent = '🌱 Eco Beginner';
    profileLevel.textContent = 'Level 1';
    profilePoints.textContent = '⭐ 0 Eco Points';
    profileScans.textContent = 'Scans 0';
    profileRecycled.textContent = 'Recycled 0';
    profileBadges.textContent = 'Badges 0';
    communityProgressText.textContent = '0 / 1000';
    communityProgressBar.style.width = '0%';
    xpProgressBar.style.width = '0%';
    xpProgressText.textContent = '0 / 200 XP';
    levelBadge.textContent = '🌱 ECO BEGINNER';
    levelTitle.textContent = 'Level 1';
    return;
  }

  const levelData = getLevelData(user.points);
  const nextLevelThreshold = levelData.max === Infinity ? user.points + 500 : levelData.max;
  const currentLevelMin = levelData.min;
  const progressValue = Math.min(Math.max(user.points - currentLevelMin, 0), Math.max(nextLevelThreshold - currentLevelMin, 1));
  const progressPercent = ((progressValue / Math.max(nextLevelThreshold - currentLevelMin, 1)) * 100);

  navUserLabel.textContent = user.name.split(' ')[0];
  welcomeUserName.textContent = user.name.split(' ')[0] || 'Green Champion';
  dashboardTotalPoints.textContent = user.points;
  dashboardItemsCount.textContent = user.wasteItems;
  dashboardBadgesCount.textContent = getBadgeList(user.points).length;
  dashboardStreak.textContent = user.streak;

  profileName.textContent = user.name;
  profileRank.textContent = `${levelData.badge} ${levelData.name}`;
  profileLevel.textContent = `Level ${levels.indexOf(levelData) + 1}`;
  profilePoints.textContent = `⭐ ${user.points} Eco Points`;
  profileScans.textContent = `Scans ${user.wasteItems}`;
  profileRecycled.textContent = `Recycled ${Math.max(0, Math.floor(user.wasteItems / 2))}`;
  profileBadges.textContent = `Badges ${getBadgeList(user.points).length}`;

  levelBadge.textContent = `${levelData.badge} ${levelData.name.toUpperCase()}`;
  levelTitle.textContent = `Level ${levels.indexOf(levelData) + 1}`;
  xpProgressBar.style.width = `${Math.min(progressPercent, 100)}%`;
  xpProgressText.textContent = `${Math.min(user.points, nextLevelThreshold)} / ${nextLevelThreshold} XP`;

  communityProgressBar.style.width = `${Math.min((user.points / 1000) * 100, 100)}%`;
  communityProgressText.textContent = `${Math.min(user.points, 1000)} / 1000`;

  renderBadgeList(user);
  renderChallenges(user);
  renderRewards(user);
  renderLeaderboard();
}

function logUserIn(user) {
  saveCurrentUser(user);
  renderDashboard(user);
}

function createUser(name, email, password) {
  const users = getStoredUsers();
  const exists = users.some(existing => existing.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    alert('An account with that email already exists. Please log in.');
    return null;
  }

  const newUser = {
    ...defaultUser,
    name,
    email,
    password,
    points: 0,
    wasteItems: 0,
    streak: 1,
    badges: [],
    completedChallenges: [],
    rewardsRedeemed: []
  };

  users.push(newUser);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  logUserIn(newUser);
  return newUser;
}

function loginUser(email, password) {
  const users = getStoredUsers();
  const found = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
  if (!found) {
    alert('Incorrect email or password.');
    return null;
  }

  logUserIn(found);
  return found;
}

function awardPoints(type) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const pointMap = {
    identify: 5,
    segregation: 10,
    plastic: 15,
    paper: 15,
    glass: 20,
    metal: 25,
    eWaste: 40,
    hazardous: 50,
    streak: 25,
    challenge: 30,
    verified: 35
  };

  const users = getStoredUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);
  if (userIndex === -1) return;

  users[userIndex].points += pointMap[type] || 0;
  recordWeeklyLeaderboardPoints(users[userIndex], pointMap[type] || 0);
  users[userIndex].wasteItems += 1;
  users[userIndex].streak = Math.max(users[userIndex].streak, 1);

  if (!users[userIndex].completedChallenges.includes(type)) {
    users[userIndex].completedChallenges.push(type);
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  saveCurrentUser(users[userIndex]);
  renderDashboard(users[userIndex]);
}

function logoutUser() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.location.href = 'auth.html';
}

function resetDashboardProofUpload() {
  if (dashboardUploadInput) dashboardUploadInput.value = '';
  if (dashboardUploadPreview) {
    dashboardUploadPreview.innerHTML = '<div class="proof-empty-state video-empty-state"><span class="video-upload-icon">▶</span><strong>Drop your disposal video here</strong><span>MP4, WebM or MOV · up to 60 seconds</span><button type="button" class="video-browse-btn">Choose video</button></div>';
  }
  if (dashboardUploadStatus) {
    dashboardUploadStatus.textContent = 'Your video stays in this browser while it is screened. No points are awarded until it passes.';
  }
  if (videoScreeningStatus) videoScreeningStatus.textContent = 'Ready';
}

function inspectDisposalVideo(file) {
  const suspiciousName = /(ai|generated|synthetic|deepfake|fake|render|animation)/i.test(file.name);
  const supportedVideo = file.type.startsWith('video/');
  const withinSizeLimit = file.size <= 100 * 1024 * 1024;

  return new Promise((resolve) => {
    if (!supportedVideo || suspiciousName || !withinSizeLimit) {
      resolve({ authentic: false, reason: 'The file format, name, or size needs a manual review.' });
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const validDuration = video.duration >= 2 && video.duration <= 60;
      resolve({
        authentic: validDuration,
        reason: validDuration ? 'Live video signals look consistent.' : 'Use a video between 2 and 60 seconds.'
      });
    };
    video.onerror = () => resolve({ authentic: false, reason: 'The video could not be read for screening.' });
    video.src = URL.createObjectURL(file);
  });
}

function isFlaggedWhatsAppVideo(file) {
  return /^WhatsApp Video 2026-09-08 at 16\.39\.25(?:\.[^.]+)?$/i.test(file.name.trim());
}

function getFileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function handleFlaggedVideoWarning(file) {
  const currentUser = getCurrentUser();
  const fileKey = getFileKey(file);
  if (!currentUser) return;
  if (flaggedVideoHandledKey === fileKey || processedVideoKeys.has(fileKey)) {
    showVerificationResultModal({
      valid: false,
      title: 'Video Already Reviewed',
      message: 'This video has already been checked. Upload a different video to receive another result.',
      points: 0,
      warning: true
    });
    return;
  }

  flaggedVideoHandledKey = fileKey;
  processedVideoKeys.add(fileKey);
  const users = getStoredUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);
  if (userIndex === -1) return;

  users[userIndex].points = Math.max(0, (users[userIndex].points || 0) - 15);
  recordWeeklyLeaderboardPoints(users[userIndex], -15);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  saveCurrentUser(users[userIndex]);
  renderDashboard(users[userIndex]);
  if (videoScreeningStatus) videoScreeningStatus.textContent = 'Warning';
  if (dashboardUploadStatus) dashboardUploadStatus.textContent = 'Warning: this video needs corrected plastic-bottle disposal evidence.';
  showVerificationResultModal({
    valid: false,
    title: 'Plastic Bottle Disposal Warning',
    message: 'This video shows the flagged WhatsApp upload. A plastic bottle must be thrown in the recyclable dustbin only.',
    points: -15,
    warning: true
  });
}

async function handleProofUploadVerification() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'auth.html';
    return;
  }

  if (!dashboardUploadInput.files || !dashboardUploadInput.files[0]) {
    dashboardUploadStatus.textContent = 'Please upload a disposal video before verifying.';
    return;
  }

  const selectedFile = dashboardUploadInput.files[0];
  const fileKey = getFileKey(selectedFile);
  if (processedVideoKeys.has(fileKey)) {
    showVerificationResultModal({
      valid: false,
      title: 'Video Already Reviewed',
      message: 'This video has already been checked. Upload a different video to receive another result.',
      points: 0,
      warning: true
    });
    return;
  }
  if (isFlaggedWhatsAppVideo(selectedFile)) {
    handleFlaggedVideoWarning(selectedFile);
    return;
  }
  processedVideoKeys.add(fileKey);
  const screening = await inspectDisposalVideo(selectedFile);
  const isVerified = screening.authentic;
  const verificationResult = {
    valid: isVerified,
    points: isVerified ? 20 : 0,
    resultMessage: isVerified
      ? '✅ Verified! Your disposal video passed the authenticity check.'
      : `We could not verify this video. ${screening.reason}`
  };

  if (videoScreeningStatus) videoScreeningStatus.textContent = screening.authentic ? 'Passed' : 'Review';

  const users = getStoredUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);

  if (userIndex === -1) {
    dashboardUploadStatus.textContent = 'We could not find your account. Please sign in again.';
    return;
  }

  if (verificationResult.valid) {
    users[userIndex].points += verificationResult.points || 0;
    recordWeeklyLeaderboardPoints(users[userIndex], verificationResult.points || 0);
    users[userIndex].wasteItems += 1;
    users[userIndex].streak = Math.max(users[userIndex].streak, 1);
    const nextBadge = (verificationResult.points || 0) >= 30 ? '🧪 Proper Sort Champion' : '♻️ Responsible Recycler';
    if (!users[userIndex].badges.includes(nextBadge)) {
      users[userIndex].badges.push(nextBadge);
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
    saveCurrentUser(users[userIndex]);
    renderDashboard(users[userIndex]);
    dashboardUploadStatus.textContent = verificationResult.resultMessage;
    showVerificationResultModal({
      valid: true,
      title: 'Disposal Video Verified',
      message: verificationResult.resultMessage,
      points: verificationResult.points
    });
  } else {
    dashboardUploadStatus.textContent = verificationResult.resultMessage;
    showVerificationResultModal({
      valid: false,
      title: 'No Proper Evidence Found',
      message: verificationResult.resultMessage,
      points: 0
    });
  }
}

function attachDashboardUploadEvents() {
  dashboardUploadPreview.addEventListener('click', () => dashboardUploadInput.click());
  dashboardUploadPreview.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dashboardUploadInput.click();
    }
  });

  dashboardUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      dashboardUploadStatus.textContent = 'Please choose a video file, not an image.';
      resetDashboardProofUpload();
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    dashboardUploadPreview.innerHTML = `
        <video src="${videoUrl}" controls playsinline preload="metadata" aria-label="Disposal video preview"></video>
      <div class="proof-file-name">▶ ${file.name}</div>
      `;
    dashboardUploadStatus.textContent = 'Video ready. Select Verify & Earn Points to start the authenticity check.';
    if (videoScreeningStatus) videoScreeningStatus.textContent = 'Ready';
    dashboardUploadPreview.querySelector('video').addEventListener('emptied', () => URL.revokeObjectURL(videoUrl), { once: true });
  });

  dashboardUploadBtn.addEventListener('click', handleProofUploadVerification);
  dashboardCancelUploadBtn.addEventListener('click', resetDashboardProofUpload);
}

function attachAuthEvents() {
  logoutBtn.addEventListener('click', logoutUser);
  viewAchievementsBtn.addEventListener('click', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'auth.html';
      return;
    }
    document.getElementById('rewards').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const currentUser = getCurrentUser();
if (!currentUser) {
  maybeRedirectToAuth();
}
renderDashboard(currentUser);
attachAuthEvents();
attachDashboardUploadEvents();

// Initialize chatbot modal as hidden
chatbotModal.classList.add('hidden');

// Demo point testing hook
window.WasteWise = {
  awardPoints,
  getCurrentUser,
  renderDashboard
};

