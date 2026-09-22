// Application constants for NexHire

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const USER_ROLES = {
  JOB_SEEKER: 'jobseeker',
  COMPANY: 'company',
  ADMIN: 'admin',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};
