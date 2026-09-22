import { create } from 'zustand';

export const useJobStore = create((set) => ({
  jobs: [],
  selectedJob: null,
  filters: {},
  loading: false,
  error: null,
  setJobs: (jobs) => set({ jobs, error: null }),
  setSelectedJob: (selectedJob) => set({ selectedJob }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearJobs: () => set({ jobs: [], selectedJob: null, error: null }),
}));
