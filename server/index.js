const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// In-memory object to store download progress
const downloadProgress = {};

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

db.exec(`CREATE TABLE IF NOT EXISTS profile(
  id INTEGER PRIMARY KEY CHECK (id = 1),
  username TEXT,
  email TEXT,
  bio TEXT
);`);
// API routes for profile management
// Migration to add avatar column if it does not exist
try {
  db.prepare("ALTER TABLE profile ADD COLUMN avatar TEXT").run();
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
const upload = multer({ storage });

app.post('/api/upload', upload.single('video'), async (req, res) => {
  const tempFilePath = req.file ? req.file.path : null;
  const tempDir = req.file ? path.dirname(req.file.path) : null;

  if (!tempFilePath || !tempDir) {
    return res.status(400).json({ message: 'Keine Datei angegeben.' });
  }

  try {
    // Generate a unique filename for the permanent location
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + fileExtension;
    const permanentFilePath = path.join(uploadDir, uniqueFilename);

    // Move the file from the temporary directory to the permanent upload directory
    fs.renameSync(tempFilePath, permanentFilePath);

    // Prüfe, ob Datei existiert und gib Dateigröße aus
    const fileExists = fs.existsSync(permanentFilePath);
    const fileSize = fileExists ? fs.statSync(permanentFilePath).size : 0;
    console.log(`Datei existiert: ${fileExists}, Größe: ${fileSize} Bytes, Pfad: ${permanentFilePath}`);

    if (!fileExists || fileSize === 0) {
      // Clean up the temporary directory on error
      fs.rmdir(tempDir, { recursive: true }, (err) => {
        if (err) console.error('Fehler beim Löschen des temporären Verzeichnisses nach Fehler:', err);
      });
      return res.status(400).json({ message: 'Videodatei existiert nicht oder ist leer nach Verschieben.' });
    }

    // Transkodieren Sie das Video
    console.log(`Starte Transkodierung für: ${permanentFilePath}`);
    const transcodedFilePath = await transcodeVideo(permanentFilePath, uploadDir);
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
       if (permanentFilePath && fs.existsSync(permanentFilePath)) {
          fs.unlink(permanentFilePath, (unlinkErr) => {
            if (unlinkErr) console.error('Fehler beim Löschen der ursprünglichen Datei nach Transkodierungsfehler:', unlinkErr);
          });
       }
       return res.status(500).json({ message: 'Transkodierte Videodatei existiert nicht oder ist leer.' });
    }

    // Löschen Sie die ursprüngliche hochgeladene Datei nach der Transkodierung
    fs.unlink(permanentFilePath, (err) => {
      if (err) console.error('Fehler beim Löschen der ursprünglichen Datei nach Transkodierung:', err);
    });

    const thumbPath = await generateThumbnail(transcodedFilePath, thumbDir);
    const duration = await getDuration(transcodedFilePath);

    // Speichere nur den relativen Pfad für das Thumbnail
    const relativeThumbPath = path.relative(__dirname, thumbPath).replace(/\\/g, '/');
    const relativeFilePath = path.relative(__dirname, transcodedFilePath).replace(/\\/g, '/');

    const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail, duration, category, tags, is_public) VALUES (?,?,?,?,?,?,?,?)');
    const info = stmt.run(
      req.body.title || '',
      req.body.description || '',
      relativeFilePath,
      '/' + relativeThumbPath,
      duration,
      req.body.category || '', // Get category from body
      JSON.stringify(req.body.tags || []), // Store tags as JSON string
      req.body.isPublic === false ? 0 : 1 // Store isPublic as integer (1 for true, 0 for false)
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
    // Löschen Sie die permanente Datei, wenn die Transkodierung fehlschlägt
    if (permanentFilePath && fs.existsSync(permanentFilePath)) {
       fs.unlink(permanentFilePath, (unlinkErr) => {
         if (unlinkErr) console.error('Fehler beim Löschen der permanenten Datei nach Transkodierungsfehler:', unlinkErr);
       });
    }
    res.status(500).json({ message: 'Fehler beim Hochladen oder Transkodieren', error: err.message });
  }
});

// Add the new /api/fetch-metadata endpoint
app.post('/api/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL fehlt' });
  }

  try {
    // Use yt-dlp to fetch metadata
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
            // Add other relevant fields if needed
          };
          res.json(extractedMetadata);
        } catch (parseError) {
          console.error('Fehler beim Parsen der yt-dlp Ausgabe:', parseError);
          res.status(500).json({ message: 'Fehler beim Verarbeiten der Metadaten', error: parseError.message });
        }
      } else {
        console.error('yt-dlp Fehler beim Abrufen der Metadaten:', stderr);
        res.status(500).json({ message: 'Fehler beim Abrufen der Metadaten von der URL', error: stderr });
      }
    });

  } catch (error) {
    console.error('Serverfehler beim Abrufen der Metadaten:', error);
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});

// GET profile data
app.get('/api/profile', (req, res) => {
  const row = db.prepare('SELECT username, email, bio FROM profile WHERE id = 1').get();
  if (row) {
    res.json(row);
  } else {
    // Return default empty profile if none exists
    res.json({ username: '', email: '', bio: '' });
  }
});

// POST save profile data
app.post('/api/profile', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Fehler beim Speichern des Profils:', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Speichern des Profils' });
  }
});

// Add the new /api/import-url endpoint to initiate URL import
app.post('/api/import-url', async (req, res) => {
  const { url, title, description, category, tags, isPublic } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL fehlt' });
  }

  const importId = Date.now().toString() + '-' + Math.round(Math.random() * 1e9);
  downloadProgress[importId] = { progress: 0, status: 'pending', error: null };

  // Run the download in the background
  downloadFromUrl(url, uploadDir, importId)
    .then(async ({ tempFilePath, tempDir }) => { // downloadFromUrl now returns tempFilePath and tempDir
      try {
        // Generate a unique filename for the permanent location
        const fileExtension = path.extname(tempFilePath);
        const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + fileExtension;
        const permanentFilePath = path.join(uploadDir, uniqueFilename);

        // Move the file from the temporary directory to the permanent upload directory
        fs.renameSync(tempFilePath, permanentFilePath);

        const thumbPath = await generateThumbnail(permanentFilePath, thumbDir);
        const duration = await getDuration(permanentFilePath);

        const relativeThumbPath = path.relative(__dirname, thumbPath).replace(/\\/g, '/');
        const relativeFilePath = path.relative(__dirname, permanentFilePath).replace(/\\/g, '/');

        const stmt = db.prepare('INSERT INTO videos(title, description, filepath, thumbnail, duration, category, tags, is_public) VALUES (?,?,?,?,?,?,?,?)');
        const info = stmt.run(
          title || '',
          description || '',
          relativeFilePath,
          '/' + relativeThumbPath,
          duration,
          category || '',
          JSON.stringify(tags || []),
          isPublic === false ? 0 : 1
        );

        downloadProgress[importId].status = 'completed';
        downloadProgress[importId].videoId = info.lastInsertRowid;

        // Clean up the temporary directory after successful import
        fs.rmdir(tempDir, { recursive: true }, (err) => {
          if (err) {
            console.error('Fehler beim Löschen des temporären Verzeichnisses:', err);
          }
        });

      } catch (err) {
        console.error('Fehler nach Download-Abschluss:', err);
        downloadProgress[importId].status = 'error';
        downloadProgress[importId].error = err.message;
      }
    })
    .catch((err) => {
      console.error('Fehler beim Herunterladen der URL:', err);
      downloadProgress[importId].status = 'error';
      downloadProgress[importId].error = err.message;
    });

  res.json({ importId }); // Return the import ID immediately
});

app.get('/api/videos', (req, res) => {
  const rows = db.prepare('SELECT id, title, description, thumbnail, duration, created_at FROM videos ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/videos/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).end();

  console.log(`Abgerufener Dateipfad aus DB: ${row.filepath}`);
  const filePath = path.resolve(row.filepath);
  console.log(`Aufgelöster Dateipfad: ${filePath}`);

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
        'Content-Type': 'video/mp4', // Annahme: MP4, muss ggf. dynamisch ermittelt werden
      };
  
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4', // Annahme: MP4, muss ggf. dynamisch ermittelt werden
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

// PUT update video data
app.put('/api/videos/:id', (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, category, tags, is_public } = req.body; // Erwarte aktualisierte Felder
    
    // Überprüfe, ob das Video existiert
    const video = db.prepare('SELECT id FROM videos WHERE id = ?').get(id);
    if (!video) {
      return res.status(404).json({ message: 'Video nicht gefunden' });
    }

    // Aktualisiere die Datenbank
    const stmt = db.prepare('UPDATE videos SET title = ?, description = ?, category = ?, tags = ?, is_public = ? WHERE id = ?');
    stmt.run(
      title || '',
      description || '',
      category || '',
      JSON.stringify(tags || []),
      is_public === false ? 0 : 1,
      id
    );

    res.json({ message: 'Video erfolgreich aktualisiert' });

  } catch (err) {
    console.error('Fehler beim Aktualisieren des Videos:', err);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Videos', error: err.message });
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
