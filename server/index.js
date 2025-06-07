const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Statische Verzeichnisse für Uploads und Thumbnails bereitstellen
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/thumbnails', express.static(path.join(__dirname, 'thumbnails')));

const db = new Database(path.join(__dirname, 'videos.db'));

db.exec(`CREATE TABLE IF NOT EXISTS videos(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  filepath TEXT,
  thumbnail TEXT,
  duration REAL,
  category TEXT, -- Added category column
  tags TEXT, -- Added tags column (will store as JSON string)
  is_public INTEGER DEFAULT 1, -- Added is_public column (1 for public, 0 for private)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
// Note: If the database file already exists, you might need to manually alter the table
// or delete the videos.db file to apply the new schema in a development environment.
// In a production environment, a proper database migration strategy would be required.

const uploadDir = path.join(__dirname, 'uploads');
const thumbDir = path.join(__dirname, 'thumbnails');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    // This endpoint now only handles file uploads
    const { title, description } = req.body;
    const filePath = req.file ? req.file.path : null;

    if (!filePath) {
      return res.status(400).json({ message: 'Keine Datei angegeben.' });
    }

    // Prüfe, ob Datei existiert und gib Dateigröße aus
    const fileExists = fs.existsSync(filePath);
    const fileSize = fileExists ? fs.statSync(filePath).size : 0;
    console.log(`Datei existiert: ${fileExists}, Größe: ${fileSize} Bytes, Pfad: ${filePath}`);

    if (!fileExists || fileSize === 0) {
      return res.status(400).json({ message: 'Videodatei existiert nicht oder ist leer.' });
    }

    const thumbPath = await generateThumbnail(filePath, thumbDir);
    const duration = await getDuration(filePath);

    // Speichere nur den relativen Pfad für das Thumbnail
    const relativeThumbPath = path.relative(__dirname, thumbPath).replace(/\\/g, '/');
    const relativeFilePath = path.relative(__dirname, filePath).replace(/\\/g, '/');

    const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail, duration, category, tags, is_public) VALUES (?,?,?,?,?,?,?,?)');
    const info = stmt.run(
      title || '',
      description || '',
      relativeFilePath,
      '/' + relativeThumbPath,
      duration,
      req.body.category || '', // Get category from body
      JSON.stringify(req.body.tags || []), // Store tags as JSON string
      req.body.isPublic === false ? 0 : 1 // Store isPublic as integer (1 for true, 0 for false)
    );

    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Hochladen', error: err.message });
  }
});

// Add the new /api/fetch-metadata endpoint
app.post('/api/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL fehlt' });
  }

  try {
    const ytdlp = spawn('yt-dlp', ['--dump-json', url]);
    let data = '';
    let errorData = '';

    ytdlp.stdout.on('data', (chunk) => {
      data += chunk;
    });

    ytdlp.stderr.on('data', (chunk) => {
      errorData += chunk;
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(data);
          // Extract relevant information
          const videoInfo = {
            title: metadata.title,
            description: metadata.description,
            thumbnail: metadata.thumbnail, // yt-dlp provides a thumbnail URL
            duration: metadata.duration,
            original_url: url // Keep the original URL for the final import step
          };
          res.json(videoInfo);
        } catch (parseError) {
          console.error('Fehler beim Parsen der yt-dlp Ausgabe:', parseError);
          res.status(500).json({ message: 'Fehler beim Parsen der Video-Metadaten' });
        }
      } else {
        console.error('yt-dlp Fehler beim Abrufen der Metadaten:', errorData);
        res.status(500).json({ message: 'Fehler beim Abrufen der Video-Metadaten', error: errorData });
      }
    });
  } catch (err) {
    console.error('Serverfehler beim Abrufen der Metadaten:', err);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// Add the new /api/import-url endpoint for the final URL import step
app.post('/api/import-url', async (req, res) => {
  try {
    const { url, title, description, category, tags, isPublic } = req.body; // isPublic hinzugefügt

    if (!url) {
      return res.status(400).json({ message: 'URL fehlt' });
    }

    // Create a unique temporary directory for this download
    const tempDir = path.join(uploadDir, Date.now().toString() + '-' + Math.round(Math.random() * 1e9));
    fs.mkdirSync(tempDir, { recursive: true });

    // Use the existing downloadFromUrl function with the temp directory
    const filePath = await downloadFromUrl(url, tempDir);

    if (!filePath) {
       // downloadFromUrl should reject on error, but adding a check here just in case
       return res.status(500).json({ message: 'Fehler beim Herunterladen des Videos' });
    }

    const thumbPath = await generateThumbnail(filePath, thumbDir);
    const duration = await getDuration(filePath);

    const relativeThumbPath = path.relative(__dirname, thumbPath).replace(/\\/g, '/');
    const relativeFilePath = path.relative(__dirname, filePath).replace(/\\/g, '/');

    const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail, duration, category, tags, is_public) VALUES (?,?,?,?,?,?,?,?)');
    const info = stmt.run(
      title || '',
      description || '',
      relativeFilePath,
      '/' + relativeThumbPath,
      duration,
      category || '', // Get category from body
      JSON.stringify(tags || []), // Store tags as JSON string
      isPublic === false ? 0 : 1 // Store isPublic as integer (1 for true, 0 for false)
    );

    res.json({ id: info.lastInsertRowid });

  } catch (err) {
    console.error('Fehler beim Importieren der URL:', err);
    res.status(500).json({ message: 'Fehler beim Importieren des Videos von URL', error: err.message });
  }
});

app.get('/api/videos', (req, res) => {
  const rows = db.prepare('SELECT id, title, description, thumbnail, duration, created_at FROM videos ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/videos/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).end();

  const filePath = path.resolve(row.filepath);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.delete('/api/videos/:id', (req, res) => {
  try {
    const id = req.params.id;
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    if (!video) {
      return res.status(404).json({ message: 'Video nicht gefunden' });
    }
    // Videodatei und Thumbnail löschen
    if (fs.existsSync(video.filepath)) {
      fs.unlinkSync(video.filepath);
    }
    if (fs.existsSync(path.join(__dirname, video.thumbnail))) {
      fs.unlinkSync(path.join(__dirname, video.thumbnail));
    }
    // Datenbankeintrag löschen
    db.prepare('DELETE FROM videos WHERE id = ?').run(id);
    res.json({ message: 'Video gelöscht' });
  } catch (err) {
    res.status(500).json({ message: 'Fehler beim Löschen des Videos', error: err.message });
  }
});

const downloadFromUrl = (url, dir) => {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', ['-o', path.join(dir, '%(id)s.%(ext)s'), url]);
    let stderr = '';
    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    ytdlp.on('close', async (code) => {
      if (code === 0) {
        try {
          // Suche die neueste Datei im Verzeichnis dir
          const files = await fs.promises.readdir(dir);
          const videoFiles = files.filter(f => f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.webm'));
          if (videoFiles.length === 0) {
            return reject(new Error('Keine Videodatei gefunden'));
          }
          videoFiles.sort((a, b) => {
            return fs.statSync(path.join(dir, b)).mtime.getTime() - fs.statSync(path.join(dir, a)).mtime.getTime();
          });
          const latestFile = path.join(dir, videoFiles[0]);
          resolve(latestFile);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`yt-dlp Fehler: ${stderr}`));
      }
    });
  });
};

const generateThumbnail = (file, dir) => {
  const thumbPath = path.join(dir, path.basename(file, path.extname(file)) + '.jpg');
  return new Promise((resolve, reject) => {
    ffmpeg(file)
      .on('end', () => resolve(thumbPath))
      .on('error', reject)
      .screenshots({ count: 1, folder: dir, filename: path.basename(thumbPath) });
  });
};

const getDuration = (file) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
};

const PORT = process.env.PORT || 3301;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
