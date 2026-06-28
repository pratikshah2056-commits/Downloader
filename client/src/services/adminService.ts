import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalDownloads: number;
  platformDistribution: { platform: string; count: number }[];
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface AdminDownload {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  } | null;
  platform: string;
  url: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  fileSize: number;
  duration: number;
  downloadDate: string;
}

export interface DomainDiagnostic {
  domain: string;
  validCount: number;
  expiredCount: number;
}

export interface CookieDiagnostics {
  valid: boolean;
  reason?: string;
  validCount?: number;
  expiredCount?: number;
  domains?: DomainDiagnostic[];
  error?: string;
}

export interface CookieConfigData {
  exists: boolean;
  path: string;
  content: string;
  diagnostics: CookieDiagnostics | null;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  getUsers: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getDownloads: async (page: number = 1, limit: number = 15) => {
    const response = await api.get(`/admin/downloads?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  deleteDownload: async (id: string) => {
    const response = await api.delete(`/admin/downloads/${id}`);
    return response.data;
  },

  getCookies: async (): Promise<CookieConfigData> => {
    const response = await api.get('/admin/cookies');
    return response.data.data;
  },

  updateCookies: async (content: string): Promise<CookieConfigData> => {
    const response = await api.post('/admin/cookies', { content });
    return response.data.data;
  },
};
