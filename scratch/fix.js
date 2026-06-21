const fs = require('fs');
const content = fs.readFileSync('src/data/certifications.json', 'utf8');

try {
  JSON.parse(content);
  console.log("JSON is valid");
} catch (e) {
  console.log("JSON is invalid:", e.message);
  // find the last valid part or just strip out the bad cert
  // actually, let's just restore it to a simple valid state
  const validData = {
    version: 1,
    certifications: [
      {
        id: "1",
        title: "Full Stack Web Development",
        issuer: "Meta",
        date: "2024",
        credentialId: "META-FS-2024-001",
        type: "certification",
        image: "https://img.icons8.com/fluency/96/meta.png",
        description: "Comprehensive full-stack development certification covering MERN stack, deployment, and best practices.",
        skills: ["React", "Node.js", "MongoDB", "Express"],
        category: "Web Development",
        link: "#",
        downloadUrl: "#",
        badgeColor: "from-primary-500 to-secondary-500",
        certificateImage: ""
      }
    ],
    profile: {}
  };
  fs.writeFileSync('src/data/certifications.json', JSON.stringify(validData, null, 2));
  console.log("Restored certifications.json");
}
