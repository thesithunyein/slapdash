export interface MapDefinition {
  id: string;
  name: string;
  theme: string;
  tagline: string;
  unlockLevel: number;
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  roadColor: number;
  sidewalkColor: number;
  curbColor: number;
  grassColor: number;
  buildingColors: number[];
  ambientColor: number;
  dirLightColor: number;
  propType: 'market' | 'palm' | 'cactus' | 'pine' | 'cherry' | 'cyber';
  weatherEffect: 'market_breeze' | 'sea_mist' | 'sand' | 'cyber_rain' | 'snow' | 'sakura';
  cloudStyle: 'fluffy_white' | 'tropical_cumulus' | 'sunset_amber' | 'cyber_neon' | 'snow_blizzard' | 'twilight_mist';
  celestialType: 'sun' | 'tropical_sun' | 'desert_sunset' | 'cyber_moon' | 'winter_sun' | 'golden_moon';
  badgeColor: string;
}

export const GAME_MAPS: MapDefinition[] = [
  {
    id: 'market',
    name: 'Bazaar Boulevard',
    theme: 'Traditional Daylight Market',
    tagline: 'Sun-drenched bustling market street with fruit stalls & fresh pavement',
    unlockLevel: 1,
    skyColor: 0x38bdf8,
    fogColor: 0x7dd3fc,
    fogDensity: 0.0055,
    roadColor: 0x181a24,
    sidewalkColor: 0x94a3b8,
    curbColor: 0xe2e8f0,
    grassColor: 0x15803d,
    buildingColors: [0xb45309, 0x0369a1, 0x991b1b, 0x475569, 0x1e3a8a, 0x854d0e],
    ambientColor: 0x7dd3fc,
    dirLightColor: 0xfffaed,
    propType: 'market',
    weatherEffect: 'market_breeze',
    cloudStyle: 'fluffy_white',
    celestialType: 'sun',
    badgeColor: '#10B981',
  },
  {
    id: 'tropical_coast',
    name: 'Sunny Palm Bay',
    theme: 'Tropical Ocean Promenade',
    tagline: 'Azure ocean skies, golden sand sidewalks, and swaying coconut palms',
    unlockLevel: 3,
    skyColor: 0x0ea5e9,
    fogColor: 0x38bdf8,
    fogDensity: 0.005,
    roadColor: 0x334155,
    sidewalkColor: 0xfde68a, // Sandy warm sidewalk
    curbColor: 0xffedd5,
    grassColor: 0x22c55e,
    buildingColors: [0xf59e0b, 0x06b6d4, 0xf43f5e, 0x10b981, 0x8b5cf6, 0xec4899],
    ambientColor: 0x38bdf8,
    dirLightColor: 0xffedd5,
    propType: 'palm',
    weatherEffect: 'sea_mist',
    cloudStyle: 'tropical_cumulus',
    celestialType: 'tropical_sun',
    badgeColor: '#06B6D4',
  },
  {
    id: 'sunset_desert',
    name: 'Mirage Canyon',
    theme: 'Sunset Terracotta Desert',
    tagline: 'Blazing twilight sunset through towering red canyons and desert cacti',
    unlockLevel: 8,
    skyColor: 0xea580c,
    fogColor: 0xf97316,
    fogDensity: 0.0065,
    roadColor: 0x292524,
    sidewalkColor: 0xd97706,
    curbColor: 0xfed7aa,
    grassColor: 0xb45309, // Dry desert clay
    buildingColors: [0x78350f, 0x9a3412, 0xc2410c, 0xa16207, 0x854d0e, 0x451a03],
    ambientColor: 0xfb923c,
    dirLightColor: 0xffedd5,
    propType: 'cactus',
    weatherEffect: 'sand',
    cloudStyle: 'sunset_amber',
    celestialType: 'desert_sunset',
    badgeColor: '#F97316',
  },
  {
    id: 'neon_night',
    name: 'Cyber Shibuya',
    theme: 'Synthwave Night Metropolis',
    tagline: 'Rain-slicked neon highways flanked by holographic skyscrapers & violet haze',
    unlockLevel: 15,
    skyColor: 0x080b14,
    fogColor: 0x1e1b4b,
    fogDensity: 0.008,
    roadColor: 0x090d16,
    sidewalkColor: 0x1e293b,
    curbColor: 0x06b6d4, // Glowing cyan curbs
    grassColor: 0x312e81,
    buildingColors: [0x1e1b4b, 0x312e81, 0x4c1d95, 0x0284c7, 0x581c87, 0x0f172a],
    ambientColor: 0x818cf8,
    dirLightColor: 0xc084fc,
    propType: 'cyber',
    weatherEffect: 'cyber_rain',
    cloudStyle: 'cyber_neon',
    celestialType: 'cyber_moon',
    badgeColor: '#8B5CF6',
  },
  {
    id: 'winter_peak',
    name: 'Frosty Alps',
    theme: 'Snowbound Alpine Expressway',
    tagline: 'Sub-zero frosted highways lined with snow-covered pines and swirling flurries',
    unlockLevel: 25,
    skyColor: 0x38bdf8,
    fogColor: 0xbae6fd,
    fogDensity: 0.007,
    roadColor: 0x1e293b,
    sidewalkColor: 0xe0f2fe, // Frost snow
    curbColor: 0xffffff,
    grassColor: 0xf8fafc, // Snow cover
    buildingColors: [0x0f766e, 0x0369a1, 0x334155, 0x164e63, 0x155e75, 0x0c4a6e],
    ambientColor: 0xa5f3fc,
    dirLightColor: 0xf0fdfa,
    propType: 'pine',
    weatherEffect: 'snow',
    cloudStyle: 'snow_blizzard',
    celestialType: 'winter_sun',
    badgeColor: '#38BDF8',
  },
  {
    id: 'golden_temple',
    name: 'Sacred Lantern Way',
    theme: 'Cherry Blossom Sanctuary',
    tagline: 'Moonlit cobblestone path guided by glowing crimson lanterns & pink sakura blossoms',
    unlockLevel: 35,
    skyColor: 0x17122b,
    fogColor: 0x2e1065,
    fogDensity: 0.0065,
    roadColor: 0x1c1917,
    sidewalkColor: 0x44403c,
    curbColor: 0xf43f5e, // Crimson curb
    grassColor: 0x14532d,
    buildingColors: [0x881337, 0x9f1239, 0x7c2d12, 0x4c0519, 0x991b1b, 0x27272a],
    ambientColor: 0xf472b6,
    dirLightColor: 0xfef08a,
    propType: 'cherry',
    weatherEffect: 'sakura',
    cloudStyle: 'twilight_mist',
    celestialType: 'golden_moon',
    badgeColor: '#EC4899',
  },
];

export function getMapById(id: string): MapDefinition {
  return GAME_MAPS.find((m) => m.id === id) || GAME_MAPS[0];
}
