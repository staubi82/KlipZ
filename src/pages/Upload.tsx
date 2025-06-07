import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload as UploadIcon, Link as LinkIcon, Loader2, X, Film, AlertCircle, ArrowRight, CheckCircle2, Globe, Lock as LockIcon } from 'lucide-react';
import { VideoJS } from '../components/VideoJS'; // Import VideoJS component
import { API_BASE } from '../config';

export function Upload() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Single file upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Batch upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [batchProgress, setBatchProgress] = useState<{[key: string]: number}>({});
  const [batchStatus, setBatchStatus] = useState<{[key: string]: 'pending' | 'uploading' | 'completed' | 'error'}>({});
  
  // Common metadata states
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState('');
  const [isFormatSupportedForPreview, setIsFormatSupportedForPreview] = useState(true);
  const [transcode, setTranscode] = useState(false);
  
  // Batch-specific metadata
  const [batchMetadata, setBatchMetadata] = useState({
    category: '',
    tags: '',
    description: '',
    transcode: false
  });

  // State for URL import
  const [fetchedMetadata, setFetchedMetadata] = useState<any>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [importId, setImportId] = useState<string | null>(null); // New state for import ID
  const [importProgress, setImportProgress] = useState(0); // New state for import progress
  const [importStatus, setImportStatus] = useState<'pending' | 'completed' | 'error' | null>(null); // New state for import status


  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Load user categories on component mount
  useEffect(() => {
    // Load categories
    fetch(`${API_BASE}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        // Extract category names from API response objects
        const categoryNames = data.map((cat: any) => cat.name);
        setUserCategories(categoryNames);
      })
      .catch(err => console.log('Keine Kategorien gefunden oder Fehler beim Laden'));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadMode === 'single') {
      const file = files[0];
      if (file) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Überprüfen Sie, ob der Browser das Videoformat abspielen kann
        const videoElement = document.createElement('video');
        const canPlay = videoElement.canPlayType(file.type);

        if (canPlay === '') {
          console.warn(`Browser kann Dateiformat nicht abspielen: ${file.type}`);
          setIsFormatSupportedForPreview(false);
        } else {
          console.log(`Browser kann Dateiformat abspielen: ${file.type} (${canPlay})`);
          setIsFormatSupportedForPreview(true);
        }
      }
    } else {
      // Batch mode - handle multiple files
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      
      // Initialize progress and status for each file
      const initialProgress: {[key: string]: number} = {};
      const initialStatus: {[key: string]: 'pending' | 'uploading' | 'completed' | 'error'} = {};
      
      fileArray.forEach(file => {
        const fileId = `${file.name}-${file.size}-${file.lastModified}`;
        initialProgress[fileId] = 0;
        initialStatus[fileId] = 'pending';
      });
      
      setBatchProgress(initialProgress);
      setBatchStatus(initialStatus);
    }
  };

  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    
    // Initialize progress and status for new files
    const newProgress = { ...batchProgress };
    const newStatus = { ...batchStatus };
    
    fileArray.forEach(file => {
      const fileId = `${file.name}-${file.size}-${file.lastModified}`;
      newProgress[fileId] = 0;
      newStatus[fileId] = 'pending';
    });
    
    setBatchProgress(newProgress);
    setBatchStatus(newStatus);
  };

  const removeFileFromBatch = (fileToRemove: File) => {
    const fileId = `${fileToRemove.name}-${fileToRemove.size}-${fileToRemove.lastModified}`;
    setSelectedFiles(prev => prev.filter(file =>
      `${file.name}-${file.size}-${file.lastModified}` !== fileId
    ));
    
    // Remove from progress and status tracking
    const newProgress = { ...batchProgress };
    const newStatus = { ...batchStatus };
    delete newProgress[fileId];
    delete newStatus[fileId];
    setBatchProgress(newProgress);
    setBatchStatus(newStatus);
  };

  const getFileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const [fileUploadStatus, setFileUploadStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle');

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Show uploading status immediately
    setFileUploadStatus('uploading');
    setIsLoading(true); // Keep isLoading for general loading indication if needed elsewhere

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('transcode', transcode.toString()); // Send transcode option
      // Add category, tags, and visibility
      formData.append('category', category || 'alle'); // Default to 'alle' if no category selected
      formData.append('tags', JSON.stringify(tags)); // Send tags as JSON string
      formData.append('isPublic', isPublic.toString());

      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload fehlgeschlagen');
      
      // Set status to uploaded after successful fetch response
      setFileUploadStatus('uploaded');
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
      setFileUploadStatus('error');
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Reset batch upload function
  const resetBatchUpload = () => {
    setSelectedFiles([]);
    setBatchProgress({});
    setBatchStatus({});
    setBatchMetadata({
      category: '',
      tags: '',
      description: '',
      transcode: false
    });
  };

  // Batch upload function
  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);

    // Process files sequentially to avoid overwhelming the server
    for (const file of selectedFiles) {
      const fileId = getFileId(file);
      
      try {
        // Update status to uploading
        setBatchStatus(prev => ({ ...prev, [fileId]: 'uploading' }));

        const formData = new FormData();
        formData.append('video', file);
        
        // Use batch metadata or generate from filename
        const fileTitle = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        formData.append('title', fileTitle);
        formData.append('description', batchMetadata.description);
        formData.append('transcode', batchMetadata.transcode.toString());
        formData.append('category', batchMetadata.category || 'alle');
        
        // Parse tags from comma-separated string
        const tagsArray = batchMetadata.tags ? batchMetadata.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        formData.append('tags', JSON.stringify(tagsArray));
        formData.append('isPublic', 'true'); // Default to public for batch uploads

        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Upload fehlgeschlagen');
        
        // Update status to completed
        setBatchStatus(prev => ({ ...prev, [fileId]: 'completed' }));
        setBatchProgress(prev => ({ ...prev, [fileId]: 100 }));

      } catch (err) {
        console.error(`Fehler beim Upload von ${file.name}:`, err);
        setBatchStatus(prev => ({ ...prev, [fileId]: 'error' }));
      }
    }

    setIsLoading(false);
    
    // Show completion message
    const completedCount = Object.values(batchStatus).filter(status => status === 'completed').length;
    const errorCount = Object.values(batchStatus).filter(status => status === 'error').length;
    
    if (completedCount > 0) {
      alert(`Batch-Upload abgeschlossen!\n✅ ${completedCount} Videos erfolgreich hochgeladen${errorCount > 0 ? `\n❌ ${errorCount} Videos fehlgeschlagen` : ''}`);
    }
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
    setImportStatus('pending'); // Set import status to pending
    setImportProgress(0); // Reset progress

    try {
      const response = await fetch(`${API_BASE}/api/import-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: originalUrl,
          title,
          description,
          category,
          tags,
          isPublic
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Starten des Imports');
      }

      const { importId } = await response.json();
      setImportId(importId); // Store the import ID

      // Start listening for progress updates
      const eventSource = new EventSource(`${API_BASE}/api/import-progress/${importId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setImportProgress(data.progress);
        setImportStatus(data.status);

        if (data.status !== 'pending') {
          eventSource.close(); // Close connection when import is done
          setIsLoading(false); // Stop loading indicator
          // No alert here, status is handled in the overlay
          // Optionally redirect to the video page using data.videoId if data.status === 'completed'
          // if (data.status === 'completed' && data.videoId) {
          //   navigate(`/video/${data.videoId}`);
          // }
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE Fehler:', err);
        eventSource.close();
        setIsLoading(false);
        setImportStatus('error');
        // No alert here, status is handled in the overlay
      };

    } catch (error: any) {
      console.error('Fehler beim Starten des URL-Imports:', error);
      setIsLoading(false);
      setImportStatus('error');
      // No alert here, status is handled in the overlay
    }
  };

  const handleCancel = () => {
    setUrl('');
    setFetchedMetadata(null);
    setShowMetadataForm(false);
    setOriginalUrl('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setTags([]);
    setTitle('');
    setDescription('');
    setCategory('');
    setIsPublic(true);
    setIsLoading(false);
    setImportId(null); // Reset import states
    setImportProgress(0);
    setImportStatus(null);
    
    // Reset batch upload states
    resetBatchUpload();
    setUploadMode('single');
  };


  return (
    <div className="max-w-4xl mx-auto space-y-12 relative">
      {/* Loading/Status Overlay */}
      {/* Loading/Status Overlay */}
      {(importStatus === 'pending' || importStatus === 'completed' || importStatus === 'error') && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            {importStatus === 'pending' && (
              <>
                <Loader2 className="w-12 h-12 text-cyber-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyber-text-light dark:text-white mb-2">
                  Video wird importiert...
                </h3>
                <p className="text-cyber-text-light/60 dark:text-white/60 mb-4">
                  Bitte warten Sie, während das Video heruntergeladen und verarbeitet wird.
                </p>
                {/* Import Progress Bar */}
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyber-text-light/80 dark:text-white/80">
                      Fortschritt
                    </span>
                    <span className="text-sm font-medium text-cyber-primary">
                      {importProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="overflow-hidden h-3 rounded-full bg-cyber-primary/20">
                    <div
                      style={{ width: `${importProgress}%` }}
                      className="h-full bg-cyber-primary transition-all duration-300 rounded-full"
                    />
                  </div>
                </div>
              </>
            )}
            {importStatus === 'completed' && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyber-text-light dark:text-white mb-2">
                  Import erfolgreich abgeschlossen!
                </h3>
                <p className="text-cyber-text-light/60 dark:text-white/60 mb-4">
                  Ihr Video wurde erfolgreich importiert und verarbeitet.
                </p>
                <button
                  onClick={handleCancel} // Use handleCancel to close and reset
                  className="mt-4 py-2 px-4 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300"
                >
                  Schließen
                </button>
              </>
            )}
            {importStatus === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyber-text-light dark:text-white mb-2">
                  Import fehlgeschlagen
                </h3>
                <p className="text-cyber-text-light/60 dark:text-white/60 mb-4">
                  Es gab einen Fehler beim Importieren Ihres Videos. Bitte versuchen Sie es erneut.
                  {/* Optionally display error details: {downloadProgress[importId]?.error} */}
                </p>
                 <button
                  onClick={handleCancel} // Use handleCancel to close and reset
                  className="mt-4 py-2 px-4 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300"
                >
                  Schließen
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* File Upload Status Overlay */}
      {fileUploadStatus !== 'idle' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
            {fileUploadStatus === 'uploading' && (
              <>
                <Loader2 className="w-12 h-12 text-cyber-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyber-text-light dark:text-white mb-2">
                  Video wird transkodiert...
                </h3>
                <p className="text-cyber-text-light/60 dark:text-white/60 mb-4">
                  Das Video wird gerade verarbeitet. Sie können warten oder das Fenster schließen -
                  die Transkodierung läuft im Hintergrund weiter.
                </p>
                <button
                  onClick={() => setFileUploadStatus('idle')} // Close overlay
                  className="mt-4 py-2 px-4 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300"
                >
                  Schließen
                </button>
              </>
            )}
            {fileUploadStatus === 'uploaded' && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyber-text-light dark:text-white mb-2">
                  Upload erfolgreich abgeschlossen!
                </h3>
                <button
                  onClick={() => setFileUploadStatus('idle')} // Close overlay
                  className="mt-4 py-2 px-4 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300"
                >
                  Schließen
                </button>
              </>
            )}
            {fileUploadStatus === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyber-text-light dark:text-white mb-2">
                  Upload fehlgeschlagen
                </h3>
                <p className="text-cyber-text-light/60 dark:text-white/60 mb-4">
                  Es gab einen Fehler beim Hochladen Ihrer Datei. Bitte versuchen Sie es erneut.
                </p>
                <button
                  onClick={() => setFileUploadStatus('idle')} // Close overlay
                  className="mt-4 py-2 px-4 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300"
                >
                  Schließen
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <h1 className="text-4xl font-black text-cyber-text-light dark:text-white tracking-wider flex items-center gap-3">
          <Film className="w-10 h-10 text-cyber-primary" />
          Neues Video 🎬
        </h1>
        <div className="mt-2 text-cyber-text-light/60 dark:text-white/60">
          Wähle eine der Optionen, um dein Video hochzuladen
        </div>
      </div>

      {/* Upload Mode Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => setUploadMode('single')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            uploadMode === 'single'
              ? 'bg-cyber-primary text-white shadow-lg'
              : 'text-cyber-text-light/60 dark:text-white/60 hover:text-cyber-primary'
          }`}
        >
          Einzelnes Video
        </button>
        <button
          onClick={() => setUploadMode('batch')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            uploadMode === 'batch'
              ? 'bg-cyber-primary text-white shadow-lg'
              : 'text-cyber-text-light/60 dark:text-white/60 hover:text-cyber-primary'
          }`}
        >
          Batch Upload
        </button>
      </div>
      
      <div className="space-y-6">
        {uploadMode === 'single' && (
          <>
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

            {/* Single File Upload Section */}
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
          </>
        )}

        {uploadMode === 'batch' && (
          <>
            {/* Batch File Upload Section */}
            <div className="rounded-2xl border-2 border-dashed border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors p-8 relative group cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="video/*"
                multiple
                onChange={handleFileSelect}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-cyber-primary/10 flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-cyber-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cyber-text-light dark:text-white group-hover:text-cyber-primary transition-colors">
                      Mehrere Dateien hochladen
                    </h3>
                    <p className="text-cyber-text-light/60 dark:text-white/60 mt-1">
                      Drag & Drop oder klicken - Mehrfachauswahl möglich
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-cyber-primary/40 group-hover:text-cyber-primary transition-colors" />
              </div>
            </div>

            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="rounded-2xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white">
                    Ausgewählte Dateien ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={resetBatchUpload}
                    className="text-cyber-text-light/60 dark:text-white/60 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => {
                    const fileId = getFileId(file);
                    const status = batchStatus[fileId] || 'pending';
                    const progress = batchProgress[fileId] || 0;
                    
                    return (
                      <div key={fileId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Film className="w-5 h-5 text-cyber-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-cyber-text-light dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-cyber-text-light/60 dark:text-white/60">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {status === 'pending' && (
                            <span className="text-xs text-cyber-text-light/60 dark:text-white/60">Warteschlange</span>
                          )}
                          {status === 'uploading' && (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-cyber-primary" />
                              <span className="text-xs text-cyber-primary">{progress}%</span>
                            </div>
                          )}
                          {status === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          
                          <button
                            onClick={() => removeFileFromBatch(file)}
                            className="text-cyber-text-light/40 dark:text-white/40 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Batch Metadata Form */}
            {selectedFiles.length > 0 && (
              <div className="rounded-2xl border border-cyber-primary/20 bg-white/80 dark:bg-gray-800/80 p-6">
                <h3 className="text-lg font-semibold text-cyber-text-light dark:text-white mb-4">
                  Gemeinsame Metadaten für alle Videos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyber-text-light dark:text-white mb-2">
                      Kategorie
                    </label>
                    <select
                      value={batchMetadata.category}
                      onChange={(e) => setBatchMetadata(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white focus:outline-none focus:border-cyber-primary transition-all"
                    >
                      <option value="">Kategorie wählen</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="rounded-xl border-2 border-dashed border-cyber-primary/30 p-4 bg-cyber-primary/5">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={batchMetadata.transcode}
                        onChange={(e) => setBatchMetadata(prev => ({ ...prev, transcode: e.target.checked }))}
                        className="w-5 h-5 text-cyber-primary bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded focus:ring-cyber-primary focus:ring-2 mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-cyber-text-light dark:text-white">
                          Videos transkodieren (nacheinander verarbeitet)
                        </span>
                        <p className="text-xs text-cyber-text-light/60 dark:text-white/60 mt-1">
                          Konvertiert Videos für bessere Kompatibilität und kleinere Dateigröße.
                          ⚠️ Bei großen Videos kann dies sehr lange dauern - bitte haben Sie Geduld!
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-cyber-text-light dark:text-white mb-2">
                    Tags (durch Komma getrennt)
                  </label>
                  <input
                    type="text"
                    value={batchMetadata.tags}
                    onChange={(e) => setBatchMetadata(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="z.B. tutorial, gaming, review"
                    className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary transition-all"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-cyber-text-light dark:text-white mb-2">
                    Beschreibung (optional)
                  </label>
                  <textarea
                    value={batchMetadata.description}
                    onChange={(e) => setBatchMetadata(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Gemeinsame Beschreibung für alle Videos..."
                    rows={3}
                    className="w-full bg-white dark:bg-gray-700 border-2 border-cyber-primary/30 rounded-xl py-3 px-4 text-cyber-text-light dark:text-white placeholder-cyber-text-light/50 dark:placeholder-white/50 focus:outline-none focus:border-cyber-primary transition-all resize-none"
                  />
                </div>
                
                <button
                  onClick={handleBatchUpload}
                  disabled={isLoading || selectedFiles.length === 0}
                  className="w-full mt-6 flex items-center justify-center space-x-2 py-4 px-6 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UploadIcon className="w-5 h-5" />
                  )}
                  <span>
                    {isLoading
                      ? `Uploading ${Object.values(batchStatus).filter(s => s === 'uploading').length}/${selectedFiles.length}...`
                      : `${selectedFiles.length} Videos hochladen`
                    }
                  </span>
                </button>
              </div>
            )}
          </>
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
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-cyber-primary/5 group flex items-center justify-center">
                    {previewUrl ? (
                      <>
                        <VideoJS
                          options={{
                            autoplay: false,
                            controls: true,
                            responsive: true,
                            fluid: true,
                            sources: [{
                              src: previewUrl || '',
                              type: selectedFile?.type || 'video/mp4' // Use selected file type or default
                            }]
                          }}
                        />
                        {!isFormatSupportedForPreview && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                            <div className="text-center text-white p-4 bg-black bg-opacity-70 rounded-lg">
                              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                              <p>Dieses Videoformat wird von Ihrem Browser für die Vorschau möglicherweise nicht unterstützt. Es wird nach dem Hochladen verarbeitet.</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      fetchedMetadata && fetchedMetadata.thumbnail && (
                        <img
                          src={fetchedMetadata.thumbnail}
                          alt="Video Vorschau"
                          className="w-full h-full object-cover"
                        />
                      )
                    )}
                  </div>
                )}
                
                {/* Upload Progress for File Upload - Removed */}

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
                    <option value="">Alle (Standard)</option>
                    {userCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {userCategories.length === 0 && (
                    <p className="text-sm text-cyber-text-light/60 dark:text-white/60 mt-1">
                      Keine Kategorien vorhanden. <Link to="/profile" className="text-cyber-primary hover:underline">Erstelle deine erste Kategorie</Link> in deinem Profil.
                    </p>
                  )}
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
                                
                {/* Transcode Option - Improved Design */}
                <div className="rounded-xl border-2 border-dashed border-cyber-primary/30 p-6 bg-cyber-primary/5">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="transcode-checkbox"
                      checked={transcode}
                      onChange={(e) => setTranscode(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-cyber-primary rounded border-cyber-primary/30 focus:ring-cyber-primary dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-cyber-primary dark:checked:border-transparent mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="transcode-checkbox" className="text-sm font-medium text-cyber-text-light/80 dark:text-white/80 cursor-pointer">
                        Video transkodieren (empfohlen für bessere Kompatibilität)
                      </label>
                      <p className="text-xs text-cyber-text-light/60 dark:text-white/60 mt-2">
                        ⚠️ Bei großen oder langen Videos kann die Transkodierung mehrere Minuten bis Stunden dauern.
                        Bitte haben Sie Geduld.
                      </p>
                    </div>
                  </div>
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
                    disabled={isLoading || importStatus === 'pending'} // Disable while importing
                  >
                    {isLoading && importStatus === 'pending' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadIcon className="w-5 h-5" />
                    )}
                    <span>
                      {isLoading && importStatus === 'pending'
                        ? 'Wird importiert...'
                        : importStatus === 'completed'
                        ? 'Import abgeschlossen'
                        : importStatus === 'error'
                        ? 'Import fehlgeschlagen'
                        : 'Video importieren'}
                    </span>
                  </button>
                ) : (
                  <>
                    {fileUploadStatus === 'uploaded' ? (
                       <div className="mb-4 flex flex-col gap-1 text-sm text-cyber-text-light/80 dark:text-white/80">
                        <p>Datei erfolgreich übertragen.</p>
                        <p>Starte Transkodierung.</p>
                        <p>Das Transkodieren kann einige Zeit dauern. Sie können dieses Fenster schließen und die Liste der Videos überprüfen, sobald es fertig ist.</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 py-4 px-6 bg-cyber-primary text-white rounded-xl hover:bg-cyber-primary/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleUpload}
                        disabled={fileUploadStatus === 'uploading' || !selectedFile}
                      >
                        {fileUploadStatus === 'uploading' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UploadIcon className="w-5 h-5" />
                        )}
                        <span>{fileUploadStatus === 'uploading' ? 'Wird hochgeladen...' : 'Video hochladen'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}