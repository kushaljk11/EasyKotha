/**
 * Nepal Location Utility Module
 * Provides dynamic access to Nepal's geographic data (provinces, districts, municipalities)
 * Uses @nepalutils/nepal-geodata for reliable location data
 */

import { getNepaliGeographicData } from '@nepalutils/nepal-geodata';

// Cache for loaded data to avoid multiple async loads
let cachedLocationData = null;
let loadingPromise = null;

/**
 * Load Nepal location data asynchronously
 * Uses caching to prevent redundant loads
 * @returns {Promise<Object>} Resolved geographic data object
 */
async function loadLocationData() {
  // Return cached data if already loaded
  if (cachedLocationData) {
    return cachedLocationData;
  }

  // Return existing loading promise if already in progress
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start new loading promise
  loadingPromise = (async () => {
    try {
      const data = await getNepaliGeographicData();
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid location data format: expected object');
      }

      // Validate required properties
      const requiredProperties = ['provinces', 'districts', 'municipalities'];
      const missingProps = requiredProperties.filter(prop => !data[prop]);
      
      if (missingProps.length > 0) {
        throw new Error(`Missing required properties in location data: ${missingProps.join(', ')}`);
      }

      // Validate that each property is an array or object
      if (!Array.isArray(data.provinces) && typeof data.provinces !== 'object') {
        throw new Error('provinces must be an array or object');
      }
      if (!Array.isArray(data.districts) && typeof data.districts !== 'object') {
        throw new Error('districts must be an array or object');
      }
      if (!Array.isArray(data.municipalities) && typeof data.municipalities !== 'object') {
        throw new Error('municipalities must be an array or object');
      }

      cachedLocationData = data;
      return data;
    } catch (error) {
      // Provide readable error message
      console.error('Location data loading error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(`Failed to load location data: ${error.message}`);
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Get list of all provinces in Nepal
 * @returns {Promise<Array<string>>} Array of province names
 */
export async function getProvinces() {
  try {
    const data = await loadLocationData();
    
    if (Array.isArray(data.provinces)) {
      return data.provinces.map(prov => 
        typeof prov === 'string' ? prov : prov.name
      ).filter(Boolean);
    }
    
    if (typeof data.provinces === 'object') {
      return Object.keys(data.provinces).filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting provinces:', error.message);
    throw error;
  }
}

/**
 * Get districts for a specific province
 * @param {string} provinceName - The province name
 * @returns {Promise<Array<string>>} Array of district names
 */
export async function getDistrictsByProvince(provinceName) {
  try {
    if (!provinceName || typeof provinceName !== 'string') {
      return [];
    }

    const data = await loadLocationData();
    
    // Handle object structure: { [province]: { [district]: {...} } }
    if (typeof data.districts === 'object' && !Array.isArray(data.districts)) {
      const provinceDistricts = data.districts[provinceName];
      
      if (!provinceDistricts) {
        return [];
      }
      
      if (Array.isArray(provinceDistricts)) {
        return provinceDistricts.map(dist => 
          typeof dist === 'string' ? dist : dist.name
        ).filter(Boolean);
      }
      
      if (typeof provinceDistricts === 'object') {
        return Object.keys(provinceDistricts).filter(Boolean);
      }
    }

    // Handle flat array structure (fallback)
    if (Array.isArray(data.districts)) {
      return data.districts
        .filter(dist => dist?.province === provinceName || dist?.provinceName === provinceName)
        .map(dist => typeof dist === 'string' ? dist : dist.name)
        .filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error(`Error getting districts for province "${provinceName}":`, error.message);
    throw error;
  }
}

/**
 * Get municipalities for a specific district
 * @param {string} districtName - The district name
 * @returns {Promise<Array<string>>} Array of municipality names
 */
export async function getMunicipalitiesByDistrict(districtName) {
  try {
    if (!districtName || typeof districtName !== 'string') {
      return [];
    }

    const data = await loadLocationData();
    
    // Handle object structure: { [district]: [...municipalities] }
    if (typeof data.municipalities === 'object' && !Array.isArray(data.municipalities)) {
      const districtMunicipalities = data.municipalities[districtName];
      
      if (!districtMunicipalities) {
        return [];
      }
      
      if (Array.isArray(districtMunicipalities)) {
        return districtMunicipalities.map(mun => 
          typeof mun === 'string' ? mun : mun.name
        ).filter(Boolean);
      }
      
      if (typeof districtMunicipalities === 'object') {
        return Object.keys(districtMunicipalities).filter(Boolean);
      }
    }

    // Handle flat array structure (fallback)
    if (Array.isArray(data.municipalities)) {
      return data.municipalities
        .filter(mun => mun?.district === districtName || mun?.districtName === districtName)
        .map(mun => typeof mun === 'string' ? mun : mun.name)
        .filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error(`Error getting municipalities for district "${districtName}":`, error.message);
    throw error;
  }
}

/**
 * Get filtered municipality suggestions based on search keyword
 * Useful for city/municipality input with autocomplete
 * @param {string} districtName - The district to search in
 * @param {string} searchKeyword - Search keyword (case-insensitive partial match)
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {Promise<Array<string>>} Filtered municipality names
 */
export async function getMunicipalitySuggestions(districtName, searchKeyword = '', limit = 10) {
  try {
    if (!districtName || typeof districtName !== 'string') {
      return [];
    }

    const municipalities = await getMunicipalitiesByDistrict(districtName);
    
    if (!searchKeyword || typeof searchKeyword !== 'string') {
      return municipalities.slice(0, limit);
    }

    const keyword = searchKeyword.toLowerCase().trim();
    
    const filtered = municipalities
      .filter(mun => mun.toLowerCase().includes(keyword))
      .slice(0, limit);

    return filtered;
  } catch (error) {
    console.error(`Error getting municipality suggestions for "${districtName}":`, error.message);
    return [];
  }
}

/**
 * Validate if a province exists
 * @param {string} provinceName - The province name to validate
 * @returns {Promise<boolean>} True if province exists, false otherwise
 */
export async function isValidProvince(provinceName) {
  try {
    if (!provinceName || typeof provinceName !== 'string') {
      return false;
    }

    const provinces = await getProvinces();
    return provinces.some(p => p.toLowerCase() === provinceName.toLowerCase());
  } catch (error) {
    console.error('Error validating province:', error.message);
    return false;
  }
}

/**
 * Validate if a district exists in a specific province
 * @param {string} provinceName - The province name
 * @param {string} districtName - The district name to validate
 * @returns {Promise<boolean>} True if district exists in province, false otherwise
 */
export async function isValidDistrict(provinceName, districtName) {
  try {
    if (!provinceName || !districtName || typeof provinceName !== 'string' || typeof districtName !== 'string') {
      return false;
    }

    const districts = await getDistrictsByProvince(provinceName);
    return districts.some(d => d.toLowerCase() === districtName.toLowerCase());
  } catch (error) {
    console.error('Error validating district:', error.message);
    return false;
  }
}

/**
 * Validate if a municipality exists in a specific district
 * @param {string} districtName - The district name
 * @param {string} municipalityName - The municipality name to validate
 * @returns {Promise<boolean>} True if municipality exists in district, false otherwise
 */
export async function isValidMunicipality(districtName, municipalityName) {
  try {
    if (!districtName || !municipalityName || typeof districtName !== 'string' || typeof municipalityName !== 'string') {
      return false;
    }

    const municipalities = await getMunicipalitiesByDistrict(districtName);
    return municipalities.some(m => m.toLowerCase() === municipalityName.toLowerCase());
  } catch (error) {
    console.error('Error validating municipality:', error.message);
    return false;
  }
}

/**
 * Clear cached location data (useful for testing or manual refresh)
 */
export function clearLocationCache() {
  cachedLocationData = null;
  loadingPromise = null;
}

export default {
  loadLocationData,
  getProvinces,
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getMunicipalitySuggestions,
  isValidProvince,
  isValidDistrict,
  isValidMunicipality,
  clearLocationCache,
};
