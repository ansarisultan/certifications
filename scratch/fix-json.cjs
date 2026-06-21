const fs = require('fs');
const content = fs.readFileSync('src/data/certifications.json', 'utf8');

// The file has multiple JSON objects concatenated. We need to extract the LAST one
// (which has the most recent data with higher version number).
// Strategy: find all top-level JSON objects by tracking brace depth.

const objects = [];
let depth = 0;
let start = -1;

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  if (ch === '{') {
    if (depth === 0) start = i;
    depth++;
  } else if (ch === '}') {
    depth--;
    if (depth === 0 && start >= 0) {
      objects.push(content.substring(start, i + 1));
      start = -1;
    }
  }
}

console.log(`Found ${objects.length} JSON objects in the file`);

// Parse each and find the one with the highest version
let best = null;
let bestVersion = -1;

for (let i = 0; i < objects.length; i++) {
  try {
    const parsed = JSON.parse(objects[i]);
    const v = parsed.version || 0;
    const certCount = (parsed.certifications || []).length;
    console.log(`Object ${i}: version=${v}, certs=${certCount}`);
    if (v > bestVersion) {
      bestVersion = v;
      best = parsed;
    }
  } catch (e) {
    console.log(`Object ${i}: INVALID JSON - ${e.message}`);
  }
}

if (best) {
  // Clean: only keep version, certifications, profile
  const clean = {
    version: best.version || 1,
    certifications: best.certifications || [],
    profile: best.profile || {}
  };
  
  // Remove any test/junk certifications (those with dummy titles)
  clean.certifications = clean.certifications.filter(c => {
    const title = (c.title || '').toLowerCase();
    // Keep only certs with meaningful titles (at least 4 chars, not gibberish)
    return title.length >= 3;
  });
  
  console.log(`\nWriting clean file with version=${clean.version}, ${clean.certifications.length} certs`);
  clean.certifications.forEach((c, i) => {
    const imgLen = (c.certificateImage || '').length;
    console.log(`  ${i}: "${c.title}" by ${c.issuer} (certImage: ${imgLen > 100 ? imgLen + ' chars - BASE64' : imgLen + ' chars'})`);
  });
  
  fs.writeFileSync('src/data/certifications.json', JSON.stringify(clean, null, 2), 'utf8');
  console.log('\nFile cleaned and saved successfully!');
} else {
  console.log('ERROR: Could not find any valid JSON object!');
}
