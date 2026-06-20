import { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, Plus, Trash2, Edit, Save, 
  Shield, Key, Lock, Unlock, Eye, EyeOff,
  Image, Camera, User, Mail, MapPin, Briefcase,
  Globe, Link as LinkIcon, Calendar, Award,
  Download, FileText, UploadCloud, DownloadCloud,
  Database, RefreshCw, CheckCircle, AlertCircle, BadgeCheck
} from 'lucide-react';
import { storage, getDefaultData } from '../../utils/storage';
import toast from 'react-hot-toast';

const ADMIN_KEY = 'sultan_admin_2024';

export default function AdminPanel({ isOpen, onClose, onUpdate, profile, onProfileUpdate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('certifications');
  const [profileData, setProfileData] = useState(profile || {});
  const [showImport, setShowImport] = useState(false);
  const [version, setVersionState] = useState(1);
  const fileInputRef = useRef(null);
  const certImageInputRef = useRef(null);
  const importFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    issuer: '',
    date: '',
    credentialId: '',
    type: 'certification',
    image: '',
    certificateImage: '',
    description: '',
    skills: [],
    category: '',
    link: '',
    downloadUrl: '',
    badgeColor: 'from-primary-500 to-secondary-500',
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      if (profile) setProfileData(profile);
    }
  }, [isAuthenticated, profile]);

  const loadData = () => {
    const data = storage.getCertifications();
    if (data) {
      setCertifications(data);
    } else {
      const defaultData = getDefaultData();
      storage.setCertifications(defaultData.certifications);
      setCertifications(defaultData.certifications);
    }
    setVersionState(storage.getVersion() || 1);
  };

  const saveData = (data) => {
    const currentVersion = storage.getVersion() || 1;
    const newVersion = currentVersion + 1;
    storage.setVersion(newVersion);
    setVersionState(newVersion);
    storage.setCertifications(data);
    setCertifications(data);
    if (onUpdate) onUpdate(data);
    toast.success(`Data saved successfully! (Version bumped to ${newVersion})`);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      setIsAuthenticated(true);
      toast.success('Welcome back, Sultan!');
    } else {
      toast.error('Invalid password');
    }
    setPassword('');
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      id: '',
      title: '',
      issuer: '',
      date: '',
      credentialId: '',
      type: 'certification',
      image: '',
      certificateImage: '',
      description: '',
      skills: [],
      category: '',
      link: '',
      downloadUrl: '',
      badgeColor: 'from-primary-500 to-secondary-500',
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setFormData(item);
  };

  const handleSave = () => {
    if (!formData.title || !formData.issuer) {
      toast.error('Title and Issuer are required');
      return;
    }

    let updatedData;
    if (editingItem) {
      updatedData = certifications.map(c => 
        c.id === editingItem ? { ...formData } : c
      );
    } else {
      const newCert = { ...formData, id: Date.now().toString() };
      updatedData = [...certifications, newCert];
    }
    
    saveData(updatedData);
    setEditingItem(null);
    toast.success(editingItem ? 'Certification updated!' : 'Certification added!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      const updatedData = certifications.filter(c => c.id !== id);
      saveData(updatedData);
      toast.success('Deleted successfully!');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill),
    });
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [field]: reader.result,
        });
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          photo: reader.result,
        });
        toast.success('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    const currentVersion = storage.getVersion() || 1;
    const newVersion = currentVersion + 1;
    storage.setVersion(newVersion);
    setVersionState(newVersion);
    if (onProfileUpdate) {
      onProfileUpdate(profileData);
    }
    toast.success(`Profile updated successfully! (Version bumped to ${newVersion})`);
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        storage.importData(data);
        loadData();
        setVersionState(storage.getVersion() || 1);
        if (data.profile) {
          setProfileData(data.profile);
          if (onProfileUpdate) onProfileUpdate(data.profile);
        }
        toast.success('Data imported successfully!');
        setShowImport(false);
      } catch (error) {
        toast.error('Invalid file format. Please check the JSON structure.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
        <div className="panel-3d max-w-md w-full p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-main flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <p className="text-sm text-slate-400 mt-1">Enter admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Unlock Admin Panel
            </button>
          </form>
          <p className="text-xs text-slate-500 text-center mt-4">
            🔒 Protected area • Authorized access only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl overflow-y-auto p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-main flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
              <p className="text-xs text-slate-400">Manage certifications, badges & profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAuthenticated(false);
                toast.success('Logged out');
              }}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition text-sm"
            >
              <Lock className="w-4 h-4 inline mr-1" />
              Logout
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 transition text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Data Management Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-xs text-slate-400 font-medium">Data Management:</span>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition text-xs flex items-center gap-1"
          >
            <DownloadCloud className="w-3 h-3" />
            Export Data
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-3 py-1.5 rounded-lg bg-secondary-500/20 text-secondary-400 hover:bg-secondary-500/30 transition text-xs flex items-center gap-1"
          >
            <UploadCloud className="w-3 h-3" />
            Import Data
          </button>
          <span className="text-[10px] text-slate-500">
            {certifications.length} items • Version: {version} • Storage: localStorage
          </span>
        </div>

        {/* Import Section */}
        {showImport && (
          <div className="panel-3d p-4 mb-6 animate-slide-up">
            <div className="flex items-center gap-3">
              <input
                ref={importFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => importFileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-secondary-500 to-cyan-400 text-white font-semibold hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition text-sm"
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Select JSON File to Import
              </button>
              <span className="text-xs text-slate-400">Upload a backup JSON file to restore data</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'certifications'
                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border border-primary-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BadgeCheck className="w-4 h-4 inline mr-2" />
            Certifications ({certifications.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border border-primary-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile
          </button>
        </div>

        {activeTab === 'profile' ? (
          // Profile Tab
          <div className="panel-3d p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-slate-400 mb-2 block">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                    {profileData.photo ? (
                      <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition border border-primary-500/20 text-sm"
                    >
                      <Upload className="w-4 h-4 inline mr-1" />
                      Upload Photo
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={profileData.name || ''}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Full Name"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={profileData.title || ''}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                placeholder="Title"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={profileData.location || ''}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                placeholder="Location"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Email"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={profileData.experience || ''}
                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                placeholder="Experience (e.g., 3+ Years)"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <textarea
                value={profileData.bio || ''}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Bio / Description"
                rows="3"
                className="col-span-2 bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={profileData.github || ''}
                onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                placeholder="GitHub URL"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={profileData.linkedin || ''}
                onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                placeholder="LinkedIn URL"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <input
                type="text"
                value={profileData.twitter || ''}
                onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                placeholder="Twitter URL"
                className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={saveProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            </div>
          </div>
        ) : (
          // Certifications Tab
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="panel-3d p-4 text-center">
                <div className="text-2xl font-bold text-gradient-cyber">{certifications.length}</div>
                <div className="text-xs text-slate-400">Total Items</div>
              </div>
              <div className="panel-3d p-4 text-center">
                <div className="text-2xl font-bold text-secondary-400">
                  {certifications.filter(c => c.type === 'certification').length}
                </div>
                <div className="text-xs text-slate-400">Certifications</div>
              </div>
              <div className="panel-3d p-4 text-center">
                <div className="text-2xl font-bold text-warm-400">
                  {certifications.filter(c => c.type === 'badge').length}
                </div>
                <div className="text-xs text-slate-400">Badges</div>
              </div>
              <div className="panel-3d p-4 text-center">
                <div className="text-2xl font-bold text-success-400">
                  {certifications.reduce((acc, c) => acc + (c.skills?.length || 0), 0)}
                </div>
                <div className="text-xs text-slate-400">Total Skills</div>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              className="mb-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Certification
            </button>

            {/* Form */}
            {editingItem !== null || !editingItem ? (
              <div className="panel-3d p-6 mb-6 animate-slide-up">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingItem ? 'Edit Certification' : 'Add New Certification'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Title *"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="Issuer *"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Date (e.g., 2024)"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="Credential ID"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="certification">Certification</option>
                    <option value="badge">Badge</option>
                  </select>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Issuer Logo URL"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  
                  {/* Certificate Image Upload */}
                  <div className="col-span-2">
                    <label className="text-sm text-slate-400 mb-2 block">Certificate Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-28 rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                        {formData.certificateImage ? (
                          <img src={formData.certificateImage} alt="Certificate" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Image className="w-8 h-8 text-slate-500 mx-auto" />
                            <span className="text-[10px] text-slate-500">Upload</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          ref={certImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'certificateImage')}
                          className="hidden"
                        />
                        <button
                          onClick={() => certImageInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition border border-primary-500/20 text-sm"
                        >
                          <Upload className="w-4 h-4 inline mr-1" />
                          Upload Certificate Image
                        </button>
                        <p className="text-[10px] text-slate-500 mt-1">Upload the full certificate image</p>
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Category"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="Verification Link"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    placeholder="Download URL (optional)"
                    className="bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <select
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="col-span-2 bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="from-primary-500 to-secondary-500">Primary → Secondary</option>
                    <option value="from-secondary-500 to-cyan-400">Secondary → Cyan</option>
                    <option value="from-warm-500 to-amber-400">Warm → Amber</option>
                    <option value="from-accent-500 to-rose-400">Accent → Rose</option>
                    <option value="from-primary-500 to-violet-400">Primary → Violet</option>
                  </select>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description"
                    rows="3"
                    className="col-span-2 bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add skill"
                        className="flex-1 bg-[#0F172A]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2.5 rounded-xl bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition border border-primary-500/20"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-500 hover:text-red-400 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingItem ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setFormData({
                        id: '',
                        title: '',
                        issuer: '',
                        date: '',
                        credentialId: '',
                        type: 'certification',
                        image: '',
                        certificateImage: '',
                        description: '',
                        skills: [],
                        category: '',
                        link: '',
                        downloadUrl: '',
                        badgeColor: 'from-primary-500 to-secondary-500',
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {/* List */}
            <div className="space-y-3">
              {certifications.map((item) => (
                <div
                  key={item.id}
                  className="panel-3d p-4 flex items-center justify-between hover:border-primary-500/30 transition"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.badgeColor || 'from-primary-500 to-secondary-500'} flex items-center justify-center flex-shrink-0`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-6 h-6" />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {item.type === 'certification' ? 'C' : 'B'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-semibold truncate">{item.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.type === 'certification'
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
                            : 'bg-warm-500/20 text-warm-400 border border-warm-500/20'
                        }`}>
                          {item.type}
                        </span>
                        {item.certificateImage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-500/20 text-success-400 border border-success-500/20">
                            <Image className="w-3 h-3 inline mr-1" />
                            Has Image
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{item.issuer} • {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
