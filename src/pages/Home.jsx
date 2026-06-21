import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  Award, Star, Shield, Users, Code, Sparkles,
  ArrowRight, Settings,
  Calendar, CheckCircle, ExternalLink, BadgeCheck,
  Brain, Cpu, Database, Cloud, Server, Layers,
  Zap, Rocket, Target, Medal, Trophy, Image,
  Upload, Camera, User, Mail, MapPin, Briefcase,
  GraduationCap, BookOpen, Globe, Download,
  ZoomIn, ChevronDown, ChevronUp,
  Building2, School, TargetIcon, Wand2, Palette,
  Layout, Type, Move, RotateCw, Eye, Droplet, Sun, X
} from 'lucide-react';
import { useCertificates } from '../hooks/useCertificates';
import CustomCursor from '../components/ui/CustomCursor';
import AdminPanel from '../components/admin/AdminPanel';

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary-400/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

// 3D Tilt Card component
const TiltCard = ({ children, className = '' }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-300 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const {
    certifications,
    profile,
    loading,
    updateCertifications,
    updateProfile,
    addCertificate,
    editCertificate,
    deleteCertificate,
    exportData,
    importData,
    reload
  } = useCertificates();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const categories = ['All', ...new Set(certifications.map(c => c.category).filter(Boolean))];
  const filteredCerts = selectedCategory === 'All'
    ? certifications
    : certifications.filter(c => c.category === selectedCategory);

  const stats = [
    { label: 'Certifications', value: certifications.filter(c => c.type === 'certification').length, icon: Award },
    { label: 'Badges', value: certifications.filter(c => c.type === 'badge').length, icon: Medal },
    { label: 'Skills', value: certifications.reduce((acc, c) => acc + (c.skills?.length || 0), 0), icon: Code },
    { label: 'Experience', value: profile?.experience || '1+ Years', icon: Briefcase },
  ];

  const openCertificate = (cert) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
  };

  const downloadCertificate = (cert) => {
    if (cert.downloadUrl && cert.downloadUrl !== '#') {
      window.open(cert.downloadUrl, '_blank');
    } else if (cert.certificateImage) {
      const link = document.createElement('a');
      link.href = cert.certificateImage;
      link.download = `${cert.title}-certificate.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Downloading certificate...');
    } else {
      toast.success('Certificate ready for download!');
    }
  };

  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile?.name || 'Sultan Salauddin Ansari',
    "jobTitle": profile?.title || 'MERN-STACK & AI Developer',
    "url": "https://funclexa.dev",
    "sameAs": [
      profile?.github,
      profile?.linkedin,
      profile?.twitter
    ].filter(Boolean),
    "hasCredential": certifications.map(cert => ({
      "@type": "EducationalOccupationalCredential",
      "name": cert.title,
      "credentialCategory": cert.type === 'certification' ? "certification" : "badge",
      "issuedBy": { "@type": "Organization", "name": cert.issuer },
      "dateIssued": cert.date,
      "identifier": cert.credentialId
    }))
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile?.name || 'Sultan Salauddin Ansari'} - Certifications & Badges | FuncLexa</title>
        <meta name="description" content={`${profile?.name || 'Sultan Salauddin Ansari'}'s professional certifications and badges. ${certifications.length} achievements verified.`} />
        <meta property="og:title" content={`${profile?.name || 'Sultan Salauddin Ansari'} - Certifications & Badges`} />
        <meta property="og:description" content="Professional certifications and badges verified by leading organizations." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden" ref={containerRef}>
        <Toaster position="top-right" />

        {/* Dynamic 3D Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[60vw] h-[60vw] rounded-full blur-3xl transition-all duration-1000"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
              top: `${(mousePosition.y / window.innerHeight) * 30}%`,
              left: `${(mousePosition.x / window.innerWidth) * 30}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute w-[40vw] h-[40vw] rounded-full blur-3xl transition-all duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)',
              bottom: `${(1 - mousePosition.y / window.innerHeight) * 30}%`,
              right: `${(1 - mousePosition.x / window.innerWidth) * 30}%`,
              transform: 'translate(50%, 50%)',
            }}
          />
          <div
            className="absolute w-[30vw] h-[30vw] rounded-full blur-3xl transition-all duration-500"
            style={{
              background: 'radial-gradient(circle, rgba(244,63,94,0.06), transparent 70%)',
              top: `${50 + ((mousePosition.y / window.innerHeight) - 0.5) * 20}%`,
              left: `${50 + ((mousePosition.x / window.innerWidth) - 0.5) * 20}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <FloatingParticles />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-[#050816]/80 backdrop-blur-2xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-float-slow overflow-hidden p-1">
                <img src="/funclexa.png" alt="FuncLexa" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <span className="text-lg font-bold text-gradient-cyber">Sultan Salauddin Ansari</span>
                <span className="hidden sm:inline text-[10px] text-slate-400 ml-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  FuncLexa
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10 group relative"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-primary-400 transition" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section - Extraordinary */}
        <section className="relative pt-32 pb-16 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div style={{ opacity, scale }} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 text-primary-400 text-xs font-medium mb-6"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="font-bold">FuncLexa</span> — Certifications & Badges
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="
    flex flex-col
    text-4xl
    sm:text-5xl
    lg:text-6xl
    xl:text-7xl
    font-bold
    leading-[1.05]
    tracking-tight
    mb-6
  "
                >
                  <span className="text-gradient-cyber">
                    Certifications
                  </span>

                  <span className="text-white">
                    & Professional Credentials
                  </span>

                  <span
                    className="
      mt-3
      text-lg
      sm:text-xl
      lg:text-3xl
      font-medium
      text-slate-400
    "
                  >
                    of{" "}
                    <span className="text-cyan-400">
                      Sultan Salauddin Ansari
                    </span>
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-slate-400 max-w-2xl mb-4"
                >
                  {profile?.title || 'MERN-STACK & AI Developer'}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-slate-500 max-w-2xl mb-6"
                >
                  {profile?.bio || 'Passionate about building AI-integrated web applications and scalable systems.'}
                </motion.p>

                {/* Premium Badge Row */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-3 mb-6"
                >
                  <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-primary-400" />
                      <div>
                        <div className="text-sm font-bold text-white">Certifications & Badges</div>
                        <div className="text-xs text-slate-400">{certifications.length} Achievements</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-secondary-500/20 to-cyan-400/20 border border-secondary-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center gap-3">
                      <Globe className="w-6 h-6 text-secondary-400" />
                      <div>
                        <div className="text-sm font-bold text-white">FuncLexa</div>
                        <div className="text-xs text-slate-400">Ecosystem</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <a href={profile?.github || "https://github.com/ansarisultan"} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10 group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 group-hover:text-white transition"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" /><path d="M9 18c-4.5 1.5-5-2.5-7-3" /></svg>
                  </a>
                  <a href={profile?.linkedin || "https://www.linkedin.com/in/SultanSAnsari"} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10 group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 group-hover:text-white transition"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                  </a>
                  <a href={profile?.twitter || "https://x.com/ansari_sultan07"} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10 group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 group-hover:text-white transition"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                  </a>
                  <a href={`mailto:${profile?.email || "sultansalauddinansari490@gmail.com"}`} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/10 group">
                    <Mail className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                  </a>
                  <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                    Part of <span className="text-primary-400 font-medium">FuncLexa</span>
                  </span>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {stats.map((stat, idx) => (
                    <div key={idx} className="panel-3d p-4 text-center hover:border-primary-500/30 transition duration-500 group">
                      <stat.icon className="w-5 h-5 text-primary-400 mx-auto mb-1 group-hover:scale-110 transition" />
                      <div className="text-xl font-bold text-gradient-cyber">{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right - Profile Photo with 3D Effect */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-1 -mt-12 lg:-mt-36 xl:-mt-40"
              >
                <TiltCard className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                  <div className="relative panel-3d p-2 rounded-full group">
                    <div className="relative overflow-hidden rounded-full bg-[#050816]">
                      <img
                        src="/profile.png"
                        alt={profile?.name || 'Profile'}
                        className="w-full aspect-square object-cover hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-center p-4">
                        <span className="text-xs text-white font-medium">Profile Photo</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="text-xs text-slate-400 mr-2">Filter by:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${selectedCategory === category
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border border-primary-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                  {category}
                  {category !== 'All' && (
                    <span className="ml-1 text-[10px] opacity-50">
                      ({certifications.filter(c => c.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Certifications Grid */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <BadgeCheck className="w-7 h-7 text-primary-400" />
                <span className="text-gradient-cyber">Certifications & Badges</span>
                <span className="text-sm font-normal text-slate-400">
                  ({filteredCerts.length} items)
                </span>
              </h2>
              <p className="text-slate-400">Verified professional credentials from leading organizations</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCerts.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="panel-3d p-0 group hover:border-primary-500/30 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  {/* Certificate Image */}
                  <div
                    className="relative w-full h-56 bg-gradient-to-br from-slate-900/50 to-slate-800/50 overflow-hidden cursor-pointer group/image"
                    onClick={() => openCertificate(item)}
                  >
                    {item.certificateImage ? (
                      <>
                        <img
                          src={item.certificateImage}
                          alt={`${item.title} Certificate`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/20 transition flex items-center gap-2">
                              <ZoomIn className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadCertificate(item); }}
                              className="px-4 py-2 rounded-xl bg-primary-500/80 backdrop-blur-sm text-white text-xs font-medium hover:bg-primary-500 transition flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10">
                        <div className="text-center">
                          <Image className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">No Certificate Image</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`text-[8px] px-2 py-1 rounded-full font-medium backdrop-blur-sm ${item.type === 'certification'
                        ? 'bg-primary-500/80 text-white'
                        : 'bg-warm-500/80 text-white'
                        }`}>
                        {item.type === 'certification' ? '📜 Certification' : '🏅 Badge'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.badgeColor || 'from-primary-500 to-secondary-500'} flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.15)]`}>
                        {item.image ? (
                          <img src={item.image} alt={item.issuer} className="w-6 h-6" />
                        ) : (
                          <span className="text-white font-bold text-xs">{item.issuer[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                        <p className="text-xs text-slate-400">{item.issuer}</p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                      {item.credentialId && (
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
                          <Shield className="w-3 h-3 text-primary-400" />
                          {item.credentialId}
                        </span>
                      )}
                      {item.date && (
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
                          <Calendar className="w-3 h-3 text-secondary-400" />
                          {item.date}
                        </span>
                      )}
                    </div>

                    {item.skills && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                            {skill}
                          </span>
                        ))}
                        {item.skills.length > 4 && (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-slate-500">
                            +{item.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        {item.link && item.link !== '#' && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 transition flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Verify
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openCertificate(item)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
                          title="View Certificate"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadCertificate(item)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
                          title="Download Certificate"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCerts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="w-12 h-12 text-slate-500" />
                </div>
                <p className="text-slate-400">No certifications found in this category</p>
                <p className="text-xs text-slate-500 mt-1">Try selecting a different category</p>
              </div>
            )}
          </div>
        </section>

        {/* Certificate Modal */}
        <AnimatePresence>
          {isModalOpen && selectedCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="panel-3d p-6 overflow-hidden">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {selectedCert.certificateImage ? (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900/50">
                      <img
                        src={selectedCert.certificateImage}
                        alt={`${selectedCert.title} Certificate`}
                        className="w-full h-auto max-h-[60vh] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-2xl bg-slate-900/50 flex items-center justify-center border-2 border-dashed border-white/10">
                      <div className="text-center">
                        <Image className="w-16 h-16 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">No certificate image uploaded</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCert.title}</h2>
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedCert.type === 'certification'
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
                            : 'bg-warm-500/20 text-warm-400 border border-warm-500/20'
                            }`}>
                            {selectedCert.type === 'certification' ? '📜 Certification' : '🏅 Badge'}
                          </div>
                          <span className="text-sm text-slate-400">{selectedCert.issuer}</span>
                          <span className="text-sm text-slate-500">•</span>
                          <span className="text-sm text-slate-400">{selectedCert.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadCertificate(selectedCert)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>

                    {selectedCert.description && (
                      <p className="text-slate-300">{selectedCert.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      {selectedCert.credentialId && (
                        <div>
                          <span className="text-xs text-slate-400">Credential ID</span>
                          <p className="text-sm font-mono text-white">{selectedCert.credentialId}</p>
                        </div>
                      )}
                      {selectedCert.category && (
                        <div>
                          <span className="text-xs text-slate-400">Category</span>
                          <p className="text-sm text-white">{selectedCert.category}</p>
                        </div>
                      )}
                      {selectedCert.skills && selectedCert.skills.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-xs text-slate-400">Skills</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedCert.skills.map((skill) => (
                              <span key={skill} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedCert.link && selectedCert.link !== '#' && (
                      <div className="pt-4 border-t border-white/5">
                        <a
                          href={selectedCert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-400 hover:text-primary-300 transition flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Verify Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FuncLexa Footer */}
        <footer className="py-12 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] overflow-hidden p-1">
                  <img src="/funclexa.png" alt="FuncLexa" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gradient-cyber">FuncLexa</span>
                  <span className="block text-xs text-slate-400">Ecosystem</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-md">
                Building AI-integrated web applications and scalable systems as part of the
                <span className="text-primary-400 font-medium mx-1">FuncLexa</span> ecosystem.
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <span>© 2024 Sultan Salauddin Ansari</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>All rights reserved</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-primary-400">funclexa.dev</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Admin Panel */}
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onUpdate={updateCertifications}
          profile={profile}
          onProfileUpdate={updateProfile}
        />

        <CustomCursor />
      </div>
    </>
  );
}
