import React, { useState } from 'react';
import { Upload as UploadIcon, Link as LinkIcon, Loader2, X, Film, AlertCircle, ArrowRight, CheckCircle2, Globe, Lock as LockIcon } from 'lucide-react';

export function Upload() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState('');

  // New state for URL import metadata
  const [fetchedMetadata, setFetchedMetadata] = useState<any>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');


  const API_BASE = 'http://localhost:3301';

  const categories = [
    'Gaming',
    'Musik',
    'Sport',
    'Bildung',
    'Unterhaltung',
    'Nachrichten',
    'Tech',
    'Lifestyle'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Simuliere Upload-Fortschritt
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      // Add category, tags, and visibility if your backend supports it
      // formData.append('category', category);
      // formData.append('tags', JSON.stringify(tags)); // Assuming backend expects JSON string
      // formData.append('isPublic', isPublic.toString());

      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload fehlgeschlagen');
      
      // Reset form after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setDescription('');
      setTags([]);
      setCategory('');
      setIsPublic(true);

    } catch (err) {
      console.error('Fehler beim Upload:', err);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Function to fetch metadata from URL
  const handleFetchMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFetchedMetadata(null); // Clear previous metadata
    setShowMetadataForm(false); // Hide form while fetching

    try {
      const response = await fetch(`${API_BASE}/api/fetch-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Abrufen der Metadaten');
      }

      const metadata = await response.json();
      setFetchedMetadata(metadata);
      setOriginalUrl(url); // Store original URL for import
      setTitle(metadata.title || ''); // Populate title from metadata
      setDescription(metadata.description || ''); // Populate description from metadata
      setTags([]); // Reset tags for new video
      setCategory(''); // Reset category for new video
      setIsPublic(true); // Default to public
      setShowMetadataForm(true); // Show the metadata form

    } catch (error: any) {
      console.error('Fehler beim Abrufen der Video-Metadaten:', error);
      // Optionally show an error message to the user
      alert(`Fehler: ${error.message}`); // Simple alert for now
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the final URL import
  const handleImportUrl = async () => {
    if (!fetchedMetadata || !originalUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/import-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: originalUrl,
          title,
          description,
          category, // Include category and tags in the import request
          tags,
          isPublic // Include visibility
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Importieren des Videos');
      }

      // Reset form after successful import
      setUrl('');
      setFetchedMetadata(null);
      setShowMetadataForm(false);
      setOriginalUrl('');
      setTitle('');
      setDescription('');
      setTags([]);
      setCategory('');
      setIsPublic(true);

      alert('Video erfolgreich importiert!'); // Success message

    } catch (error: any) {
      console.error('Fehler beim Importieren der URL:', error);
      // Optionally show an error message to the user
      alert(`Fehler beim Importieren: ${error.message}`); // Simple alert for now
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUrl('');
    setFetchedMetadata(null);
    setShowMetadataForm(false);
    setOriginalUrl('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setTags([]);
    setTitle('');
    setDescription('');
    setCategory('');
    setIsPublic(true);
    setIsLoading(false);
  };


  return (
    <div className="max-w-4xl mx-auto space-y-12 relative">
      <div className="relative">
        <h1 className="text-4xl font-black text-cyber-text-light dark:text-white tracking-wider flex items-center gap-3">
          <Film className="w-10 h-10 text-cyber-primary" />
          Neues Video 🎬
        </h1>
        <div className="mt-2 text-cyber-text-light/60 dark:text-white/60">
          Wähle eine der beiden Optionen, um dein Video hochzuladen
        </div>
      </div>
      
      <div className="space-y-6">
        {/* URL Import Section */}
        {!showMetadataForm && !selectedFile && (
          <div className="rounded-2xl border border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors p-8 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-cyber-primary/10 flex items-center justify-center">
                  <LinkIcon className="w-8 h-8 text-cyber-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cyber-text-light dark:text-white">URL Import</h3>
                  <p className="text-cyber-text-light/60 dark:text-white/60 mt-1">
                    YouTube oder andere Plattformen
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleFetchMetadata} className="flex-1 flex flex-col">
              <div className="space-y-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !url}
                  className="w-full mt-6 flex items-center justify-center space-x-2 py-4 px-6 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LinkIcon className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Wird geladen...' : 'Metadaten abrufen'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Separator */}
        {!showMetadataForm && !selectedFile && (
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-white dark:bg-gray-800">
              <span className="text-cyber-text-light/40 dark:text-white/40">oder</span>
            </div>
            <div className="w-full h-px bg-cyber-primary/20"></div>
          </div>
        )}

        {/* File Upload Section */}
        {!showMetadataForm && !selectedFile && (
          <div className="rounded-2xl border-2 border-dashed border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors p-8 relative group cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="video/*"
              onChange={handleFileSelect}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-cyber-primary/10 flex items-center justify-center">
                  <UploadIcon className="w-8 h-8 text-cyber-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cyber-text-light dark:text-white group-hover:text-cyber-primary transition-colors">
                    Datei hochladen
                  </h3>
                  <p className="text-cyber-text-light/60 dark:text-white/60 mt-1">
                    Drag & Drop oder klicken
                  </p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-cyber-primary/40 group-hover:text-cyber-primary transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* Metadata Form or File Upload Preview */}
      {(showMetadataForm || selectedFile) && (
        <>
          <div className="rounded-2xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-8">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="text-lg font-semibold text-cyber-text-light dark:text-white">
                  {selectedFile ? 'Video ausgewählt' : 'Metadaten geladen'}
                </span>
              </div>

              <div className="space-y-6">
                {/* Video Preview / Thumbnail */}
                {(previewUrl || (fetchedMetadata && fetchedMetadata.thumbnail)) && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-cyber-primary/5 group">
                    {previewUrl ? (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={fetchedMetadata.thumbnail}
                        alt="Video Vorschau"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                
                {/* Upload Progress for File Upload */}
                {selectedFile && <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                      Upload Fortschritt
                    </span>
                    <span className="text-sm font-medium text-cyber-primary">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 rounded-full bg-cyber-primary/10">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="h-full bg-cyber-primary transition-all duration-300 rounded-full relative overflow-hidden"
                    />
                  </div>
                </div>}

                {/* Metadata Fields (Title, Description, Category, Tags, Visibility) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Gib deinem Video einen Titel"
                    className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Beschreibung
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschreibe dein Video..."
                    className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary transition-all resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Kategorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary transition-all"
                  >
                    <option value="">Kategorie wählen...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-cyber-primary/10 text-cyber-primary hover:bg-cyber-primary/20 transition-colors"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-cyber-primary/60"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagAdd}
                    placeholder="Tags hinzufügen (Enter drücken)"
                    className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                    Sichtbarkeit
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                        isPublic
                          ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary'
                          : 'border-cyber-primary/30 text-cyber-text-light/60 dark:text-white/60'
                      }`}
                    >
                      <Globe className="w-5 h-5" />
                      <span>Öffentlich</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                        !isPublic
                          ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary'
                          : 'border-cyber-primary/30 text-cyber-text-light/60 dark:text-white/60'
                      }`}
                    >
                      <LockIcon className="w-5 h-5" />
                      <span>Privat</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-cyber-text-light/60 dark:text-white/60 text-sm mt-8">
                  <AlertCircle className="w-4 h-4" />
                  <span>Maximale Dateigröße: 500MB</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-4 px-6 rounded-xl border-2 border-cyber-primary/30 text-cyber-text-light dark:text-white hover:bg-cyber-primary/5 transition-all duration-300"
                >
                  Abbrechen
                </button>
                {showMetadataForm ? (
                   <button
                    type="button"
                    className="flex-1 py-4 px-6 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleImportUrl}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadIcon className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Wird importiert...' : 'Video importieren'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex-1 py-4 px-6 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpload}
                    disabled={isLoading || !selectedFile}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadIcon className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Wird hochgeladen...' : 'Video hochladen'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}