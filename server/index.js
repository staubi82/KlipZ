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

const db = new Database(path.join(__dirname, 'videos.db'));

db.exec(`CREATE TABLE IF NOT EXISTS videos(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  filepath TEXT,
  thumbnail TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

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
    const { url, title, description } = req.body;
    let filePath = req.file ? req.file.path : null;

    if (url && !filePath) {
      filePath = await downloadFromUrl(url, uploadDir);
    }

    if (!filePath) {
      return res.status(400).json({ message: 'Keine Datei oder URL angegeben.' });
    }

    const thumbPath = await generateThumbnail(filePath, thumbDir);

    const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail) VALUES (?,?,?,?)');
    const info = stmt.run(title || '', description || '', filePath, thumbPath);

    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Hochladen.' });
  }
});

app.get('/api/videos', (req, res) => {
  const rows = db.prepare('SELECT id, title, description, thumbnail FROM videos ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/videos/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).end();
  res.sendFile(path.resolve(row.filepath));
});

app.use('/thumbnails', express.static(thumbDir));
app.use('/uploads', express.static(uploadDir));

const downloadFromUrl = (url, dir) => {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', ['-o', path.join(dir, '%(id)s.%(ext)s'), url]);
    let output = '';
    ytdlp.stderr.on('data', data => { output += data.toString(); });
    ytdlp.on('close', code => {
      if (code === 0) {
        const match = output.match(/Destination: (.*)/);
        if (match) {
          resolve(match[1]);
        } else {
          reject(new Error('Keine Videodatei gefunden'));
        }
      } else {
        reject(new Error('yt-dlp Fehler'));
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
