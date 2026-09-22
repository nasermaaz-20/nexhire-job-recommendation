import { useState, useEffect } from 'react';
import { getAllJobs } from '../api/jobsApi';
import { getMyApplications } from '../api/applicationsApi';
import { getUserProfile } from '../api/usersApi';
import axiosInstance from '../api/axiosInstance';

export const useDashboard = (user) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentJobs: [],
    applicationsCount: 0,
    savedJobsCount: 0,
    viewedCount: 0,
    profile: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [recentJobs, applications, interactions, profile] = await Promise.allSettled([
          getAllJobs({ limit: 10, sort_by: 'created_at' }),
          getMyApplications(),
          axiosInstance.get('/interactions/my-history'),
          getUserProfile(),
        ]);

        const recentJobsData = recentJobs.status === 'fulfilled'
          ? (recentJobs.value.data || []).slice(0, 10) : [];

        const applicationsData = applications.status === 'fulfilled'
          ? (applications.value.data || []) : [];

        const interactionsData = interactions.status === 'fulfilled'
          ? (interactions.value.data?.data || []) : [];

        const profileData = profile.status === 'fulfilled'
          ? (profile.value.data?.user || null) : null;

        const savedCount = interactionsData.filter(i => i.interactionType === 2).length;
        const viewedCount = interactionsData.filter(i => i.interactionType === 1).length;

        setData({
          recentJobs: recentJobsData,
          applicationsCount: applicationsData.length,
          savedJobsCount: savedCount,
          viewedCount,
          profile: profileData,
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return { loading, data };
};
