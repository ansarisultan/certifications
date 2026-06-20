// This will work both locally and in production
// Data is stored in localStorage with export/import capability

const STORAGE_KEY = 'certifications_data';
const PROFILE_KEY = 'profile_data';

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

  // Export data as JSON (for backup)
  exportData: () => {
    return {
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
    return true;
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },
};

// Default data for first run
export const getDefaultData = () => ({
  certifications: [
    {
      id: '1',
      title: 'Full Stack Web Development',
      issuer: 'Meta',
      date: '2024',
      credentialId: 'META-FS-2024-001',
      type: 'certification',
      image: 'https://img.icons8.com/fluency/96/meta.png',
      certificateImage: '',
      description: 'Comprehensive full-stack development certification covering MERN stack, deployment, and best practices.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      category: 'Web Development',
      link: '#',
      downloadUrl: '#',
      badgeColor: 'from-primary-500 to-secondary-500',
    },
    {
      id: '2',
      title: 'AI & Machine Learning',
      issuer: 'Google',
      date: '2024',
      credentialId: 'GOOGLE-AI-2024-002',
      type: 'certification',
      image: 'https://img.icons8.com/fluency/96/google-logo.png',
      certificateImage: '',
      description: 'Advanced AI and machine learning certification with practical implementations.',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
      category: 'AI & ML',
      link: '#',
      downloadUrl: '#',
      badgeColor: 'from-secondary-500 to-cyan-400',
    },
    {
      id: '3',
      title: 'AWS Cloud Architect',
      issuer: 'Amazon',
      date: '2024',
      credentialId: 'AWS-ARCH-2024-003',
      type: 'badge',
      image: 'https://img.icons8.com/fluency/96/amazon-web-services.png',
      certificateImage: '',
      description: 'AWS cloud architecture certification covering EC2, S3, Lambda, and more.',
      skills: ['AWS', 'EC2', 'S3', 'Lambda'],
      category: 'Cloud Computing',
      link: '#',
      downloadUrl: '#',
      badgeColor: 'from-warm-500 to-amber-400',
    },
  ],
  profile: {
    name: 'Sultan Salauddin Ansari',
    title: 'Full-Stack Developer & AI Engineer',
    bio: 'Passionate about building AI-integrated web applications and scalable systems. Creator of the FuncLexa ecosystem.',
    location: 'India',
    email: 'sultan@funclexa.com',
    github: 'https://github.com/sultan-salauddin',
    linkedin: 'https://linkedin.com/in/sultan-salauddin',
    twitter: 'https://twitter.com/sultan_salauddin',
    photo: '',
    experience: '3+ Years',
    projects: '12+',
    ecosystem: 'FuncLexa',
  },
});
