import { create } from "zustand";
import type { DateFilter } from "@/types/taskFilter";

interface TaskFilterState {
  dateFilter: DateFilter;
  labelFilter: string | null;
  projectFilter: string | null;
  setDateFilter: (filter: DateFilter) => void;
  setLabelFilter: (labelId: string | null) => void;
  setProjectFilter: (projectId: string | null) => void;
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  dateFilter: "all",
  labelFilter: null,
  projectFilter: null,
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setLabelFilter: (labelId) => set({ labelFilter: labelId }),
  setProjectFilter: (projectId) => set({ projectFilter: projectId }),
}));
