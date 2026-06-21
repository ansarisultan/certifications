import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin for handling local API requests during development
function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Parse JSON request helper
        const getRequestBody = () => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', err => reject(err));
          });
        };

        if (req.url === '/api/save-data' && req.method === 'POST') {
          getRequestBody()
            .then(data => {
              const filePath = path.join(__dirname, 'src/data/certifications.json');
              
              // Load current file to get version or check consistency
              let currentVersion = 1;
              try {
                if (fs.existsSync(filePath)) {
                  const content = fs.readFileSync(filePath, 'utf8');
                  const parsed = JSON.parse(content);
                  currentVersion = parsed.version || 1;
                }
              } catch (e) {
                console.error('Error reading certifications.json for version bump:', e);
              }

              // Bump version
              const newVersion = currentVersion + 1;
              const payload = {
                version: newVersion,
                certifications: data.certifications || [],
                profile: data.profile || {}
              };

              const tempPath = filePath + '.tmp';
              try {
                fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf8');
                try {
                  fs.renameSync(tempPath, filePath);
                } catch (renameErr) {
                  // Fallback in case of lock/access issues on Windows
                  fs.copyFileSync(tempPath, filePath);
                  try {
                    fs.unlinkSync(tempPath);
                  } catch (e) {}
                }
                console.log(`Saved certifications.json successfully, bumped version to ${newVersion}`);
              } catch (writeErr) {
                console.error('Failed to write certifications.json atomically:', writeErr);
                // Fallback to direct write if temp path is blocked
                fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
              }
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, version: newVersion }));
            })
            .catch(err => {
              console.error('Error saving data:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            });
          return;
        }

        if (req.url === '/api/upload-image' && req.method === 'POST') {
          getRequestBody()
            .then(data => {
              const { fileName, fileData } = data; // fileData is base64 string
              if (!fileName || !fileData) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing fileName or fileData' }));
                return;
              }

              // Strip out base64 prefix if exists (e.g. data:image/png;base64,)
              const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Data, 'base64');

              // Create public/uploads directory if it doesn't exist
              const uploadsDir = path.join(__dirname, 'public/uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              // Generate a safe unique name
              const ext = path.extname(fileName) || '.png';
              const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
              const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
              const destPath = path.join(uploadsDir, uniqueFileName);

              fs.writeFileSync(destPath, buffer);
              console.log(`Uploaded image saved to: ${destPath}`);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                url: `/uploads/${uniqueFileName}` 
              }));
            })
            .catch(err => {
              console.error('Error uploading image:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            });
          return;
        }

        next();
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
