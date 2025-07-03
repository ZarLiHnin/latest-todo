// stores/searchStore.ts
import { create } from "zustand";

type SearchState = {
  keyword: string;
  setKeyword: (k: string) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  keyword: "",
  setKeyword: (k) => set({ keyword: k }),
}));
