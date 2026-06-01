import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PortfolioState {
  watchlistIds: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  clearWatchlist: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      watchlistIds: [],
      addToWatchlist: (id) =>
        set((s) => ({
          watchlistIds: s.watchlistIds.includes(id) ? s.watchlistIds : [...s.watchlistIds, id],
        })),
      removeFromWatchlist: (id) =>
        set((s) => ({ watchlistIds: s.watchlistIds.filter((x) => x !== id) })),
      isInWatchlist: (id) => get().watchlistIds.includes(id),
      clearWatchlist: () => set({ watchlistIds: [] }),
    }),
    { name: 'pricemarket-portfolio' }
  )
);
