import defaultData from '../data/certifications.json';

const STORAGE_KEY = 'certifications_data';
const PROFILE_KEY = 'profile_data';
const VERSION_KEY = 'certifications_version';

export const storage = {
  // Get all certifications
  getCertifications: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Save certifications
  setCertifications: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Get profile
  getProfile: () => {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Save profile
  setProfile: (data) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  },

  // Get data version
  getVersion: () => {
    try {
      const v = localStorage.getItem(VERSION_KEY);
      return v ? parseInt(v, 10) : 0;
    } catch {
      return 0;
    }
  },

  // Save data version
  setVersion: (v) => {
    localStorage.setItem(VERSION_KEY, v.toString());
  },

  // Export data as JSON (for backup)
  exportData: () => {
    return {
      version: storage.getVersion() || 1,
      certifications: storage.getCertifications(),
      profile: storage.getProfile(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data from JSON
  importData: (data) => {
    if (data.certifications) {
      storage.setCertifications(data.certifications);
    }
    if (data.profile) {
      storage.setProfile(data.profile);
    }
    if (data.version) {
      storage.setVersion(data.version);
    }
    return true;
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(VERSION_KEY);
  },
};

// Default data for first run
export const getDefaultData = () => defaultData;
