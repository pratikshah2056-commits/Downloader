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
};
