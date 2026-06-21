import { useState, useEffect } from 'react';
import { storage, getDefaultData } from '../utils/storage';

const syncWithLocalServer = async (certifications, profile) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certifications, profile })
      });
      if (response.ok) {
        const resData = await response.json();
        return resData.version;
      }
    } catch (e) {
      console.error('Failed to auto-sync with local dev server:', e);
    }
  }
  return null;
};

export function useCertificates() {
  const [certifications, setCertifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      let certs = storage.getCertifications();
      let prof = storage.getProfile();
      let storedVersion = storage.getVersion();
      const defaultData = getDefaultData();
      const currentVersion = defaultData.version || 1;

      // If no data, or if version in bundle is newer than stored version
      if (!certs || certs.length === 0 || storedVersion < currentVersion) {
        storage.setCertifications(defaultData.certifications);
        storage.setProfile(defaultData.profile);
        storage.setVersion(currentVersion);
        certs = defaultData.certifications;
        prof = defaultData.profile;
      }

      setCertifications(certs);
      setProfile(prof);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const updateCertifications = async (newData) => {
    storage.setCertifications(newData);
    setCertifications(newData);

    const latestProfile = storage.getProfile() || getDefaultData().profile;
    const newVersion = await syncWithLocalServer(newData, latestProfile);
    if (newVersion) {
      storage.setVersion(newVersion);
      return newVersion;
    }
    return null;
  };

  const updateProfile = async (newData) => {
    storage.setProfile(newData);
    setProfile(newData);

    const latestCerts = storage.getCertifications() || getDefaultData().certifications;
    const newVersion = await syncWithLocalServer(latestCerts, newData);
    if (newVersion) {
      storage.setVersion(newVersion);
      return newVersion;
    }
    return null;
  };

  const addCertificate = (cert) => {
    const newCerts = [...certifications, cert];
    updateCertifications(newCerts);
    return newCerts;
  };

  const editCertificate = (id, updatedCert) => {
    const newCerts = certifications.map(c => 
      c.id === id ? { ...updatedCert } : c
    );
    updateCertifications(newCerts);
    return newCerts;
  };

  const deleteCertificate = (id) => {
    const newCerts = certifications.filter(c => c.id !== id);
    updateCertifications(newCerts);
    return newCerts;
  };

  const exportData = () => {
    return storage.exportData();
  };

  const importData = (data) => {
    storage.importData(data);
    loadData();
  };

  return {
    certifications,
    profile,
    loading,
    error,
    updateCertifications,
    updateProfile,
    addCertificate,
    editCertificate,
    deleteCertificate,
    exportData,
    importData,
    reload: loadData,
  };
}
