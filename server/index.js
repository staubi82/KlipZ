const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory object to store download progress
const downloadProgress = {};

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Statische Verzeichnisse für Uploads und Thumbnails bereitstellen
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/thumbnails', express.static(path.join(__dirname, 'thumbnails')));

const db = new Database(path.join(__dirname, 'videos.db'));

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

db.exec(`CREATE TABLE IF NOT EXISTS videos(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  filepath TEXT,
  thumbnail TEXT,
  duration REAL,
  mime_type TEXT, -- Added mime_type column
  category TEXT, -- Added category column
  tags TEXT, -- Added tags column (will store as JSON string)
  is_public INTEGER DEFAULT 1, -- Added is_public column (1 for public, 0 for private)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Create users table for authentication
db.exec(`CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  isAdmin INTEGER DEFAULT 0,
  profilePicture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS profile(
  id INTEGER PRIMARY KEY CHECK (id = 1),
  username TEXT,
  email TEXT,
  bio TEXT
);`);

// Create categories table
db.exec(`CREATE TABLE IF NOT EXISTS categories(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
// API routes for profile management
// Migration to add avatar column if it does not exist
try {
  db.prepare("ALTER TABLE profile ADD COLUMN avatar TEXT").run();
} catch (e) {
  // Ignore error if column already exists
}
// Migration to add mime_type column to videos table if it does not exist
try {
  db.prepare("ALTER TABLE videos ADD COLUMN mime_type TEXT").run();
} catch (e) {
  // Ignore error if column already exists
}
app.get('/api/profile', (req, res) => {
  const row = db.prepare('SELECT username, email, bio, avatar FROM profile WHERE id = 1').get();
  if (row) {
    res.json(row);
  } else {
    res.json({ username: '', email: '', bio: '', avatar: '' });
  }
});

app.post('/api/profile', (req, res) => {
  const { username, email, bio, avatar } = req.body;
  if (!username || !email) {
    return res.status(400).json({ message: 'Username und Email sind erforderlich.' });
  }
  const exists = db.prepare('SELECT 1 FROM profile WHERE id = 1').get();
  if (exists) {
    const stmt = db.prepare('UPDATE profile SET username = ?, email = ?, bio = ?, avatar = ? WHERE id = 1');
    stmt.run(username, email, bio, avatar);
  } else {
    const stmt = db.prepare('INSERT INTO profile (id, username, email, bio, avatar) VALUES (1, ?, ?, ?, ?)');
    stmt.run(username, email, bio, avatar);
  }
  res.json({ message: 'Profil gespeichert' });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, Email und Passwort sind erforderlich' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Passwort muss mindestens 6 Zeichen lang sein' });
  }

  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      return res.status(400).json({ message: 'Benutzer mit dieser Email oder diesem Benutzernamen existiert bereits' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, hashedPassword);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: result.lastInsertRowid,
        username,
        email,
        isAdmin: false
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      _id: result.lastInsertRowid,
      username,
      email,
      isAdmin: false,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Fehler bei der Registrierung' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email und Passwort sind erforderlich' });
  }

  try {
    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin === 1
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin === 1,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Fehler bei der Anmeldung' });
  }
});

// Protected route example
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, profilePicture, isAdmin FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Benutzer nicht gefunden' });
  }

  res.json({
    _id: user.id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    isAdmin: user.isAdmin === 1
  });
});

// API routes for category management
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT name FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (err) {
    console.error('Fehler beim Abrufen der Kategorien:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Kategorien', error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Kategoriename ist erforderlich.' });
  }

  const trimmedName = name.trim();
  
  try {
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    stmt.run(trimmedName);
    res.json({ message: 'Kategorie erfolgreich erstellt', name: trimmedName });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ message: 'Eine Kategorie mit diesem Namen existiert bereits.' });
    } else {
      console.error('Fehler beim Erstellen der Kategorie:', err);
      res.status(500).json({ message: 'Fehler beim Erstellen der Kategorie', error: err.message });
    }
  }
});

app.delete('/api/categories/:name', (req, res) => {
  const { name } = req.params;
  
  try {
    // First, update all videos with this category to have empty category
    const updateStmt = db.prepare('UPDATE videos SET category = "" WHERE category = ?');
    updateStmt.run(name);
    
    // Then delete the category
    const deleteStmt = db.prepare('DELETE FROM categories WHERE name = ?');
    const result = deleteStmt.run(name);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Kategorie nicht gefunden.' });
    }
    
    res.json({ message: 'Kategorie erfolgreich gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen der Kategorie:', err);
    res.status(500).json({ message: 'Fehler beim Löschen der Kategorie', error: err.message });
  }
});

// Get categories with video counts
app.get('/api/categories/counts', (req, res) => {
  try {
    // Get total video count
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM videos').get().count;
    
    // Get categories with their video counts
    const categoryCounts = db.prepare(`
      SELECT
        c.name,
        COUNT(v.id) as count
      FROM categories c
      LEFT JOIN videos v ON c.name = v.category
      GROUP BY c.name
      ORDER BY c.name
    `).all();
    
    // Add "Alle" category with total count
    const result = [
      { name: 'Alle', count: totalCount },
      ...categoryCounts
    ];
    
    res.json(result);
  } catch (err) {
    console.error('Fehler beim Abrufen der Kategorie-Counts:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Kategorie-Counts', error: err.message });
  }
});

// Note: If the database file already exists, you might need to manually alter the table
// or delete the videos.db file to apply the new schema in a development environment.
// In a production environment, a proper database migration strategy would be required.

const uploadDir = path.join(__dirname, 'uploads');
const thumbDir = path.join(__dirname, 'thumbnails');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(uploadDir, 'temp-' + Date.now() + '-' + Math.round(Math.random() * 1e9));
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname); // Use original filename in temp dir
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB für Video-Uploads
    fieldSize: 50 * 1024 * 1024,       // 50MB für Metadaten-Felder
    fields: 20,                        // Anzahl der erlaubten Felder
    files: 1                           // Nur eine Datei pro Upload
  }
});

app.post('/api/upload', upload.single('video'), async (req, res) => {
  const tempFilePath = req.file ? req.file.path : null;
  const tempDir = req.file ? path.dirname(req.file.path) : null;
  // Get the transcode option from the request body, default to true
  const transcode = req.body.transcode === 'true'; // FormData sends values as strings

  if (!tempFilePath || !tempDir) {
    return res.status(400).json({ message: 'Keine Datei angegeben.' });
  }

  let finalFilePath = tempFilePath; // Start with the temporary file path

  try {
    // Generate a unique filename for the permanent location
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + fileExtension;
    const permanentFilePath = path.join(uploadDir, uniqueFilename);

    // Move the file from the temporary directory to the permanent upload directory
    fs.renameSync(tempFilePath, permanentFilePath);
    finalFilePath = permanentFilePath; // Update finalFilePath to the permanent location

    // Prüfe, ob Datei existiert und gib Dateigröße aus
    const fileExists = fs.existsSync(finalFilePath);
    const fileSize = fileExists ? fs.statSync(finalFilePath).size : 0;
    console.log(`Datei existiert: ${fileExists}, Größe: ${fileSize} Bytes, Pfad: ${finalFilePath}`);

    if (!fileExists || fileSize === 0) {
      // Clean up the temporary directory on error
      fs.rmdir(tempDir, { recursive: true }, (err) => {
        if (err) console.error('Fehler beim Löschen des temporären Verzeichnisses nach Fehler:', err);
      });
      return res.status(400).json({ message: 'Videodatei existiert nicht oder ist leer nach Verschieben.' });
    }

    let videoToProcessPath = finalFilePath; // Path to the video file that will be processed
    let mimeType = req.file.mimetype; // Store original mime type

    if (transcode) {
      // Transkodieren Sie das Video
      console.log(`Starte Transkodierung für: ${finalFilePath}`);
      const transcodedFilePath = await transcodeVideo(finalFilePath, uploadDir);
      console.log(`Transkodierung abgeschlossen. Transkodierte Datei: ${transcodedFilePath}`);

      // Überprüfen Sie die transkodierte Datei
      const transcodedFileExists = fs.existsSync(transcodedFilePath);
      const transcodedFileSize = transcodedFileExists ? fs.statSync(transcodedFilePath).size : 0;
      console.log(`Transkodierte Datei existiert: ${transcodedFileExists}, Größe: ${transcodedFileSize} Bytes, Pfad: ${transcodedFilePath}`);

      if (!transcodedFileExists || transcodedFileSize === 0) {
         // Clean up the temporary directory on error
         fs.rmdir(tempDir, { recursive: true }, (err) => {
           if (err) console.error('Fehler beim Löschen des temporären Verzeichnisses nach Transkodierungsfehler:', err);
         });
         // Löschen Sie die permanente Datei, wenn die Transkodierung fehlschlägt
         if (finalFilePath && fs.existsSync(finalFilePath)) {
            fs.unlink(finalFilePath, (unlinkErr) => {
              if (unlinkErr) console.error('Fehler beim Löschen der ursprünglichen Datei nach Transkodierungsfehler:', unlinkErr);
            });
         }
         return res.status(500).json({ message: 'Transkodierte Videodatei existiert nicht oder ist leer.' });
      }

      // Löschen Sie die ursprüngliche hochgeladene Datei nach der Transkodierung
      fs.unlink(finalFilePath, (err) => {
        if (err) console.error('Fehler beim Löschen der ursprünglichen Datei nach Transkodierung:', err);
      });

      videoToProcessPath = transcodedFilePath; // Use the transcoded file for further processing
      mimeType = 'video/mp4'; // Transcoded videos are always MP4
    } else {
      console.log(`Transkodierung übersprungen für: ${finalFilePath}`);
      // No transcoding, use the original file and its mime type
    }

    const thumbPath = await generateThumbnail(videoToProcessPath, thumbDir);
    const duration = await getDuration(videoToProcessPath);

    // Speichere nur den relativen Pfad für das Thumbnail
    const relativeThumbPath = path.relative(__dirname, thumbPath).replace(/\\/g, '/');
    const relativeFilePath = path.relative(__dirname, videoToProcessPath).replace(/\\/g, '/');

    const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail, duration, category, tags, is_public, mime_type) VALUES (?,?,?,?,?,?,?,?,?)');
    const info = stmt.run(
      req.body.title || '',
      req.body.description || '',
      relativeFilePath,
      '/' + relativeThumbPath,
      duration,
      req.body.category || '', // Get category from body
      JSON.stringify(req.body.tags || []), // Store tags as JSON string
      req.body.isPublic === 'false' ? 0 : 1, // Store isPublic as integer (1 for true, 0 for false)
      mimeType // Store the determined MIME type
    );

    // Clean up the temporary directory after successful upload
    fs.rmdir(tempDir, { recursive: true }, (err) => {
      if (err) console.error('Fehler beim Löschen des temporären Verzeichnisses:', err);
    });

    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    // Clean up the temporary directory on error
    if (tempDir) {
      fs.rmdir(tempDir, { recursive: true }, (cleanupErr) => {
        if (cleanupErr) console.error('Fehler beim Löschen des temporären Verzeichnisses nach Fehler:', cleanupErr);
      });
    }
    // Löschen Sie die permanente Datei, wenn ein Fehler auftritt
    if (finalFilePath && fs.existsSync(finalFilePath)) {
       fs.unlink(finalFilePath, (unlinkErr) => {
         if (unlinkErr) console.error('Fehler beim Löschen der permanenten Datei nach Fehler:', unlinkErr);
       });
    }
    res.status(500).json({ message: 'Fehler beim Hochladen oder Verarbeiten des Videos', error: err.message });
  }
});

// Endpoint to fetch video metadata from a URL
app.post('/api/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL ist erforderlich.' });
  }

  try {
    // Use yt-dlp to get video metadata in JSON format
    const ytdlp = spawn('yt-dlp', ['--dump-json', url]);
    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(stdout);
          // Extract relevant metadata
          const extractedMetadata = {
            title: metadata.title,
            description: metadata.description,
            thumbnail: metadata.thumbnail,
            duration: metadata.duration,
            // Add other relevant fields as needed
          };
          res.json(extractedMetadata);
        } catch (parseError) {
          console.error('Fehler beim Parsen der yt-dlp Ausgabe:', parseError);
          res.status(500).json({ message: 'Fehler beim Verarbeiten der Metadaten.', error: parseError.message });
        }
      } else {
        console.error(`yt-dlp Fehler beim Abrufen der Metadaten für ${url}: ${stderr}`);
        res.status(500).json({ message: 'Fehler beim Abrufen der Metadaten von der URL.', error: stderr });
      }
    });
  } catch (err) {
    console.error('Serverfehler beim Abrufen der Metadaten:', err);
    res.status(500).json({ message: 'Interner Serverfehler.', error: err.message });
  }
});

// Endpoint to handle URL import
app.post('/api/import-url', async (req, res) => {
  const { url, title, description, category, tags, isPublic } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL ist erforderlich.' });
  }

  // Generate a unique import ID
  const importId = Date.now().toString() + '-' + Math.round(Math.random() * 1e9);
  downloadProgress[importId] = { progress: 0, status: 'pending' };

  res.json({ importId }); // Respond immediately with the import ID

  try {
    const uploadDir = path.join(__dirname, 'uploads');
    const thumbDir = path.join(__dirname, 'thumbnails');
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(thumbDir, { recursive: true });

    // Download the video using yt-dlp
    const { tempFilePath, tempDir } = await downloadFromUrl(url, uploadDir, importId);

    // Generate a unique filename for the permanent location
    const fileExtension = path.extname(tempFilePath);
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + fileExtension;
    const permanentFilePath = path.join(uploadDir, uniqueFilename);

    // Move the file from the temporary directory to the permanent upload directory
    fs.renameSync(tempFilePath, permanentFilePath);

    // Determine MIME type (yt-dlp usually downloads in common formats, can refine this)
    const mimeType = 'video/' + fileExtension.substring(1); // Simple guess based on extension

    const thumbPath = await generateThumbnail(permanentFilePath, thumbDir);
    const duration = await getDuration(permanentFilePath);

    // Speichere nur den relativen Pfad für das Thumbnail
    const relativeThumbPath = path.relative(__dirname, thumbPath).replace(/\\/g, '/');
    const relativeFilePath = path.relative(__dirname, permanentFilePath).replace(/\\/g, '/');

    const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail, duration, category, tags, is_public, mime_type) VALUES (?,?,?,?,?,?,?,?,?)');
    const info = stmt.run(
      title || '',
      description || '',
      relativeFilePath,
      '/' + relativeThumbPath,
      duration,
      category || '',
      JSON.stringify(tags || []),
      isPublic === false ? 0 : 1,
      mimeType
    );

    // Clean up the temporary directory after successful import
    fs.rmdir(tempDir, { recursive: true }, (err) => {
      if (err) console.error('Fehler beim Löschen des temporären Verzeichnisses nach Import:', err);
    });

    // Update progress to completed
    if (downloadProgress[importId]) {
      downloadProgress[importId].progress = 100;
      downloadProgress[importId].status = 'completed';
      downloadProgress[importId].videoId = info.lastInsertRowid; // Optionally send video ID
    }

  } catch (err) {
    console.error('Fehler beim URL-Import:', err);
    // Update progress to error
    if (downloadProgress[importId]) {
      downloadProgress[importId].status = 'error';
      downloadProgress[importId].error = err.message;
    }
    // Note: Temporary directory cleanup on error is handled within downloadFromUrl
  }
});

app.get('/api/videos', (req, res) => {
  // console.log('Fetching videos from database...'); // Log before fetching
  const { category } = req.query;
  
  try {
    let query = 'SELECT id, title, description, thumbnail, filepath, duration, category, created_at FROM videos';
    let params = [];
    
    if (category && category !== 'Alle') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = db.prepare(query).all(...params);
    // console.log('Successfully fetched videos:', rows.length); // Log number of videos fetched
    // console.log('Fetched video data (first 5):', rows.slice(0, 5)); // Log first 5 videos
  
    // Erweitere die Daten um videoUrl basierend auf filepath
    const videosWithUrl = rows.map(video => ({
      ...video,
      videoUrl: video.filepath ? `/uploads/${video.filepath.split('/').pop()}` : ''
    }));

    res.json(videosWithUrl);
  } catch (err) {
    console.error('Error fetching videos:', err); // Log any errors
    res.status(500).json({ message: 'Fehler beim Abrufen der Videos', error: err.message });
  }
});

app.get('/api/videos/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!row) {
    console.log(`Video with ID ${req.params.id} not found.`); // Log if video not found
    return res.status(404).end();
  }

  console.log(`Abgerufener Dateipfad aus DB für Video ID ${req.params.id}: ${row.filepath}`); // Log retrieved filepath
  const filePath = path.resolve(__dirname, row.filepath); // Resolve path relative to server directory
  console.log(`Aufgelöster Dateipfad: ${filePath}`); // Log resolved filepath
  console.log(`Abgerufener MIME-Typ aus DB: ${row.mime_type}`); // Log retrieved mime type


  fs.stat(filePath, (err, stat) => {
    if (err) {
      console.error(`Fehler bei fs.stat für ${filePath}:`, err);
      return res.status(404).send('Datei nicht gefunden.');
    }

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
  
      file.on('error', (streamErr) => {
        console.error(`Fehler beim Erstellen/Lesen des Streams für ${filePath}:`, streamErr);
        res.status(500).send('Fehler beim Streamen der Datei.');
      });
  
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': row.mime_type || 'video/mp4', // Use stored mime_type or default to video/mp4
      };
  
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': row.mime_type || 'video/mp4', // Use stored mime_type or default to video/mp4
      };
      res.writeHead(200, head);
      const file = fs.createReadStream(filePath);
      file.on('error', (streamErr) => {
        console.error(`Fehler beim Erstellen/Lesen des Streams für ${filePath}:`, streamErr);
        res.status(500).send('Fehler beim Streamen der Datei.');
      });
      file.pipe(res);
    }
  });
});
// PUT endpoint to update video metadata
app.put('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category, tags } = req.body;
  
  try {
    // Prepare the update statement
    const stmt = db.prepare(`
      UPDATE videos 
      SET title = ?, description = ?, category = ?, tags = ? 
      WHERE id = ?
    `);
    
    // Convert tags array to JSON string for storage
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    
    // Execute the update
    const result = stmt.run(title, description, category || '', tagsJson, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Video nicht gefunden' });
    }
    
    console.log(`Video ${id} erfolgreich aktualisiert`);
    res.json({ 
      success: true, 
      message: 'Video erfolgreich aktualisiert',
      changes: result.changes 
    });
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Videos:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Videos' });
  }
});

// DELETE endpoint to delete a video
app.delete('/api/videos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  try {
    // First, get the video info to delete associated files
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video nicht gefunden' });
    }
    
    // Delete the video from database
    const stmt = db.prepare('DELETE FROM videos WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Video nicht gefunden' });
    }
    
    // Optionally delete the actual video file and thumbnail
    // (You might want to keep files for backup or implement this later)
    /*
    try {
      if (video.filepath && fs.existsSync(video.filepath)) {
        fs.unlinkSync(video.filepath);
      }
      if (video.thumbnail && fs.existsSync(video.thumbnail)) {
        fs.unlinkSync(video.thumbnail);
      }
    } catch (fileError) {
      console.warn('Warnung: Konnte Dateien nicht löschen:', fileError);
      // Continue anyway, database deletion was successful
    }
    */
    
    console.log(`Video ${id} erfolgreich gelöscht`);
    res.json({
      success: true,
      message: 'Video erfolgreich gelöscht',
      deletedId: id
    });
    
  } catch (error) {
    console.error('Fehler beim Löschen des Videos:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Videos' });
  }
});

const downloadFromUrl = (url, baseDir, importId) => {
  return new Promise((resolve, reject) => {
    // Create a unique temporary directory for this download within the baseDir
    const tempDir = path.join(baseDir, Date.now().toString() + '-' + Math.round(Math.random() * 1e9));
    fs.mkdirSync(tempDir, { recursive: true });

    // Added -P option to specify download dir and --newline for progress on new lines
    const ytdlp = spawn('yt-dlp', ['-o', path.join(tempDir, '%(id)s.%(ext)s'), '--newline', url]);
    let stderr = '';
    let stdout = '';

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
      const progressMatch = data.toString().match(/\s(\d+\.\d+)%/);
      if (progressMatch && progressMatch[1]) {
        const progress = parseFloat(progressMatch[1]);
        if (downloadProgress[importId]) {
          downloadProgress[importId].progress = progress;
        }
      }
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
      // yt-dlp often puts progress on stderr
      const progressMatch = data.toString().match(/\s(\d+\.\d+)%/);
      if (progressMatch && progressMatch[1]) {
        const progress = parseFloat(progressMatch[1]);
        if (downloadProgress[importId]) {
          downloadProgress[importId].progress = progress;
        }
      }
    });

    ytdlp.on('close', async (code) => {
      if (code === 0) {
        try {
          const files = await fs.promises.readdir(tempDir);
          const videoFiles = files.filter(f => f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.webm'));
          if (videoFiles.length === 0) {
            if (downloadProgress[importId]) {
               downloadProgress[importId].status = 'error';
               downloadProgress[importId].error = 'Keine Videodatei gefunden';
            }
            return reject(new Error('Keine Videodatei gefunden'));
          }
          videoFiles.sort((a, b) => {
            return fs.statSync(path.join(tempDir, b)).mtime.getTime() - fs.statSync(path.join(tempDir, a)).mtime.getTime();
          });
          const latestFile = path.join(tempDir, videoFiles[0]);
          resolve({ tempFilePath: latestFile, tempDir }); // Return both file path and temp directory
        } catch (err) {
          if (downloadProgress[importId]) {
             downloadProgress[importId].status = 'error';
             downloadProgress[importId].error = err.message;
          }
          // Clean up the temporary directory on error as well
          fs.rmdir(tempDir, { recursive: true }, (cleanupErr) => {
            if (cleanupErr) {
              console.error('Fehler beim Löschen des temporären Verzeichnisses nach Fehler:', cleanupErr);
            }
            reject(err);
          });
        }
      } else {
        if (downloadProgress[importId]) {
           downloadProgress[importId].status = 'error';
           downloadProgress[importId].error = `yt-dlp Fehler: ${stderr}`;
        }
        // Clean up the temporary directory on error as well
        fs.rmdir(tempDir, { recursive: true }, (cleanupErr) => {
          if (cleanupErr) {
            console.error('Fehler beim Löschen des temporären Verzeichnisses nach yt-dlp Fehler:', cleanupErr);
          }
          reject(new Error(`yt-dlp Fehler: ${stderr}`));
        });
      }
    });
  });
};

const generateThumbnail = (file, dir) => {
  const thumbPath = path.join(dir, path.basename(file, path.extname(file)) + '.jpg');
  return new Promise((resolve, reject) => {
    ffmpeg(file)
      .on('end', () => {
        console.log(`Thumbnail erfolgreich generiert für: ${file}`);
        resolve(thumbPath);
      })
      .on('error', (err) => {
        console.error(`Fehler beim Generieren des Thumbnails für ${file}:`, err);
        reject(err);
      })
      .screenshots({ count: 1, folder: dir, filename: path.basename(thumbPath) });
  });
};

const getDuration = (file) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) {
        console.error(`Fehler beim Ermitteln der Dauer für ${file}:`, err);
        return reject(err);
      }
      console.log(`Dauer erfolgreich ermittelt für: ${file}`);
      resolve(metadata.format.duration);
    });
  });
};

const transcodeVideo = (inputFile, outputDir) => {
  const outputFileName = path.basename(inputFile, path.extname(inputFile)) + '_transcoded.mp4';
  const outputFilePath = path.join(outputDir, outputFileName);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .outputOptions([
        '-c:v libx264', // Video-Codec: H.264
        '-preset fast', // Schnellere Transkodierung
        '-crf 23', // Qualitätsfaktor (niedriger = besser Qualität, größer = kleinere Datei)
        '-c:a aac', // Audio-Codec: AAC
        '-b:a 128k', // Audio-Bitrate
        '-movflags +faststart' // Für schnelleres Web-Streaming
      ])
      .output(outputFilePath)
      .on('end', () => {
        console.log(`Video erfolgreich transkodiert: ${inputFile} -> ${outputFilePath}`);
        resolve(outputFilePath);
      })
      .on('error', (err) => {
        console.error(`Fehler beim Transkodieren des Videos ${inputFile}:`, err);
        reject(err);
      })
      .run();
  });
};


// SSE endpoint for download progress
app.get('/api/import-progress/:importId', (req, res) => {
  const importId = req.params.importId;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendProgress = () => {
    if (downloadProgress[importId]) {
      res.write(`data: ${JSON.stringify(downloadProgress[importId])}\n\n`);
      if (downloadProgress[importId].status !== 'pending') {
        // Clean up after completion or error
        delete downloadProgress[importId];
        res.end();
      }
    } else {
      // Import ID not found or already completed/errored and cleaned up
      res.write(`data: ${JSON.stringify({ status: 'error', error: 'Import not found or finished' })}\n\n`);
      res.end();
    }
  };

  // Send initial progress
  sendProgress();

  // Set interval to send progress updates
  const intervalId = setInterval(sendProgress, 1000); // Send updates every 1 second

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
    // Optionally keep the progress data for a short while or log the disconnect
    console.log(`Client disconnected from import progress for ID: ${importId}`);
  });
});


const PORT = process.env.PORT || 3301;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
