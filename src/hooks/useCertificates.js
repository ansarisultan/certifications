import { useState, useEffect } from 'react';
import { storage, getDefaultData } from '../utils/storage';

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

      // If no data, load defaults
      if (!certs || certs.length === 0) {
        const defaultData = getDefaultData();
        storage.setCertifications(defaultData.certifications);
        storage.setProfile(defaultData.profile);
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

  const updateCertifications = (newData) => {
    storage.setCertifications(newData);
    setCertifications(newData);
  };

  const updateProfile = (newData) => {
    storage.setProfile(newData);
    setProfile(newData);
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
