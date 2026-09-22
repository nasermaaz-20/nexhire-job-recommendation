import { useState, useEffect, useCallback, useRef } from 'react';
import { getMyRecommendations, recordInteraction as recordInteractionAPI } from '../api/recommendationsApi';
import { saveJob, unsaveJob } from '../api/jobsApi';
import { applyToJob } from '../api/applicationsApi';
import { toast } from 'react-toastify';

export const useRecommendations = () => {
  // ✅ All recommendations from API (unfiltered)
  const [allRecommendations, setAllRecommendations] = useState([]);
  // ✅ Filtered + paginated recommendations (what the component sees)
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sort_by: 'match_score',
    job_level: null,
    employment_type: null,
    location_id: null,
    remote_only: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const viewedJobs = useRef(new Set());

  // =====================================================
  // ✅ Transform API data to match frontend expectations
  // =====================================================
  const transformRecommendations = (rawRecs) => {
    if (!Array.isArray(rawRecs)) return [];

    return rawRecs.map(rec => ({
      ...rec,
      // ✅ Map "score" → "match_score" (as percentage 0-100)
      match_score: Math.round((rec.score || 0) * 100),
      // ✅ Build match_details from content_score & collab_score
      match_details: {
        content_score: Math.round((rec.content_score || 0) * 100),
        collab_score: Math.round((rec.collab_score || 0) * 100),
        alpha: rec.alpha || 0.5,
        // ✅ Build skill match info from job data
        ...(rec.job && rec.job.skills ? {
          skills_required: rec.job.skills.filter(s => s.is_required).length,
          skills_total: rec.job.skills.length,
        } : {}),
      },
    }));
  };

  // =====================================================
  // ✅ Apply filters & sorting client-side
  // =====================================================
  const applyFiltersAndPagination = useCallback((allRecs, currentFilters, page, limit) => {
    let filtered = [...allRecs];

    // Filter by job level
    if (currentFilters.job_level) {
      const level = parseInt(currentFilters.job_level);
      filtered = filtered.filter(rec => rec.job?.job_level === level);
    }

    // Filter by employment type
    if (currentFilters.employment_type) {
      const type = parseInt(currentFilters.employment_type);
      filtered = filtered.filter(rec => rec.job?.employment_type === type);
    }

    // Filter by remote only
    if (currentFilters.remote_only) {
      filtered = filtered.filter(rec =>
        rec.job?.remote_option === 1 || rec.job?.remote_option === 2
      );
    }

    // Filter by location
    if (currentFilters.location_id) {
      const locId = parseInt(currentFilters.location_id);
      filtered = filtered.filter(rec => rec.job?.location_id === locId);
    }

    // Sort
    switch (currentFilters.sort_by) {
      case 'created_at':
        filtered.sort((a, b) =>
          new Date(b.job?.created_at || 0) - new Date(a.job?.created_at || 0)
        );
        break;
      case 'salary_max':
        filtered.sort((a, b) =>
          (b.job?.salary_max || 0) - (a.job?.salary_max || 0)
        );
        break;
      case 'match_score':
      default:
        filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        break;
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);

    setRecommendations(paginated);
    setPagination(prev => ({
      ...prev,
      page,
      total,
      totalPages,
    }));
  }, []);

  // =====================================================
  // ✅ Fetch from API
  // =====================================================
  const fetchRecommendations = useCallback(async (currentFilters, page) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fetch larger batch from API (filtering happens client-side)
      const params = {
        limit: 100,
        method: 'hybrid',
      };

      const response = await getMyRecommendations(params);

      // ✅ FIX: Extract recommendations array correctly
      // response = { success: true, data: { user_id, count, recommendations: [...] } }
      const apiData = response.data || response || {};
      const rawRecs = apiData.recommendations || apiData.data?.recommendations || [];

      console.log('📨 API Response:', response);
      console.log('📋 Raw recommendations:', rawRecs.length);

      // ✅ Transform to match frontend expected format
      const transformed = transformRecommendations(rawRecs);

      console.log('✅ Transformed recommendations:', transformed.length);

      // ✅ Store all recommendations
      setAllRecommendations(transformed);

      // ✅ Apply filters and pagination
      applyFiltersAndPagination(transformed, currentFilters, page, pagination.limit);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ Fetch recommendations error:', err);
      setError(err.message || 'Failed to load recommendations');
      setRecommendations([]);
      setAllRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, applyFiltersAndPagination]);

  // =====================================================
  // Initial fetch
  // =====================================================
  useEffect(() => {
    fetchRecommendations(filters, 1);
  }, []);

  // =====================================================
  // ✅ Filter/Sort/Page changes (client-side, no re-fetch)
  // =====================================================
  const applyFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    // ✅ Apply filters on existing data (no API call needed)
    applyFiltersAndPagination(allRecommendations, updatedFilters, 1, pagination.limit);
  }, [filters, allRecommendations, pagination.limit, applyFiltersAndPagination]);

  const changePage = useCallback((page) => {
    applyFiltersAndPagination(allRecommendations, filters, page, pagination.limit);
  }, [filters, allRecommendations, pagination.limit, applyFiltersAndPagination]);

  const refresh = useCallback(() => {
    fetchRecommendations(filters, 1);
  }, [filters, fetchRecommendations]);

  // =====================================================
  // Interactions (unchanged)
  // =====================================================
  const recordInteraction = useCallback(async (jobId, type) => {
    try {
      await recordInteractionAPI(jobId, type);
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  }, []);

  const trackView = useCallback((jobId) => {
    if (!viewedJobs.current.has(jobId)) {
      viewedJobs.current.add(jobId);
      recordInteraction(jobId, 'view');
    }
  }, [recordInteraction]);

  const handleSave = useCallback(async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await unsaveJob(jobId);
        toast.success('Job removed from saved');
      } else {
        await saveJob(jobId);
        await recordInteraction(jobId, 'save');
        toast.success('Job saved successfully');
      }
      return !isSaved;
    } catch (err) {
      toast.error('Failed to save job');
      return isSaved;
    }
  }, [recordInteraction]);

  const handleApply = useCallback(async (jobId) => {
    try {
      await applyToJob(jobId);
      await recordInteraction(jobId, 'apply');
      toast.success('Application submitted successfully');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to apply');
      return false;
    }
  }, [recordInteraction]);

  return {
    recommendations,
    loading,
    error,
    filters,
    pagination,
    lastUpdated,
    applyFilters,
    changePage,
    refresh,
    trackView,
    handleSave,
    handleApply,
  };
};