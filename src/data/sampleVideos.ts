interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  uploadDate: string;
}

export const sampleVideos: Video[] = [
  {
    id: "1",
    title: "Grundlagen der Quantenphysik",
    description: "Eine Einführung in die faszinierende Welt der Quantenphysik.",
    thumbnail: "https://images.pexels.com/photos/2156/sky-earth-space-working.jpg",
    videoUrl: "https://example.com/video1.mp4",
    views: 15420,
    uploadDate: "2024-01-15"
  },
  {
    id: "2",
    title: "Machine Learning Tutorial",
    description: "Schritt-für-Schritt Anleitung zum Einstieg in Machine Learning.",
    thumbnail: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg",
    videoUrl: "https://example.com/video2.mp4",
    views: 8930,
    uploadDate: "2024-01-18"
  },
  {
    id: "3",
    title: "Cybersicherheit Basics",
    description: "Wichtige Grundlagen der IT-Sicherheit für Anfänger.",
    thumbnail: "https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg",
    videoUrl: "https://example.com/video3.mp4",
    views: 12150,
    uploadDate: "2024-01-20"
  }
];