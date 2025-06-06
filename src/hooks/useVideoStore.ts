import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoState {
  likes: { [key: number]: boolean };
  dislikes: { [key: number]: boolean };
  favorites: number[];
  toggleLike: (videoId: number) => void;
  toggleDislike: (videoId: number) => void;
  toggleFavorite: (videoId: number) => void;
  isLiked: (videoId: number) => boolean;
  isDisliked: (videoId: number) => boolean;
  isFavorite: (videoId: number) => boolean;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      likes: {},
      dislikes: {},
      favorites: [],
      
      toggleLike: (videoId: number) => {
        set((state) => {
          const newLikes = { ...state.likes };
          const newDislikes = { ...state.dislikes };
          
          if (newLikes[videoId]) {
            delete newLikes[videoId];
          } else {
            newLikes[videoId] = true;
            delete newDislikes[videoId];
          }
          
          return { likes: newLikes, dislikes: newDislikes };
        });
      },
      
      toggleDislike: (videoId: number) => {
        set((state) => {
          const newDislikes = { ...state.dislikes };
          const newLikes = { ...state.likes };
          
          if (newDislikes[videoId]) {
            delete newDislikes[videoId];
          } else {
            newDislikes[videoId] = true;
            delete newLikes[videoId];
          }
          
          return { dislikes: newDislikes, likes: newLikes };
        });
      },
      
      toggleFavorite: (videoId: number) => {
        set((state) => {
          const isFavorite = state.favorites.includes(videoId);
          const newFavorites = isFavorite
            ? state.favorites.filter(id => id !== videoId)
            : [...state.favorites, videoId];
          
          return { favorites: newFavorites };
        });
      },
      
      isLiked: (videoId: number) => get().likes[videoId] || false,
      isDisliked: (videoId: number) => get().dislikes[videoId] || false,
      isFavorite: (videoId: number) => get().favorites.includes(videoId),
    }),
    {
      name: 'video-storage',
    }
  )
);