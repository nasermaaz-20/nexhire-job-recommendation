import { useAuthStore } from '../store/authStore';
import { USER_ROLES } from '../utils/constants';

export const useAuth = () => {
  const authStore = useAuthStore();
  
  return {
    ...authStore,
    isJobSeeker: authStore.user?.role === USER_ROLES.JOB_SEEKER,
    isCompany: authStore.user?.role === USER_ROLES.COMPANY,
    isAdmin: authStore.user?.role === USER_ROLES.ADMIN,
  };
};
