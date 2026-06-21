const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/data/certifications.json', 'utf8'));
console.log('Total certs:', d.certifications.length);
console.log('File size:', fs.statSync('src/data/certifications.json').size, 'bytes');
d.certifications.forEach((c, i) => {
  const img = c.certificateImage || '';
  console.log(i, c.title, 'certImg length:', img.length);
});
