import api from './api';

export interface MediaInfo {
  title: string;
  thumbnail: string;
  duration: number;
  platform: string;
  uploader: string;
  viewCount: number;
  uploadDate: string;
  description: string;
  videoQualities: string[];
  availableVideoFormats: string[];
  availableAudioFormats: string[];
  formats: FormatInfo[];
}

export interface FormatInfo {
  formatId: string;
  ext: string;
  quality: string;
  height: number;
  filesize: number;
  hasVideo: boolean;
  hasAudio: boolean;
  vcodec: string;
  acodec: string;
}

export interface DownloadHistoryItem {
  _id: string;
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

export interface DownloadStats {
  totalDownloads: number;
  platformStats: { platform: string; count: number }[];
  recentDownloads: DownloadHistoryItem[];
}

export const downloadService = {
  getMediaInfo: async (url: string): Promise<MediaInfo> => {
    const response = await api.post('/download/info', { url });
    return response.data.data;
  },

  downloadVideo: async (url: string, format: string = 'mp4', quality: string = 'best') => {
    const response = await api.post(
      '/download/video',
      { url, format, quality },
      { responseType: 'blob' }
    );
    return response;
  },

  downloadAudio: async (url: string, format: string = 'mp3', quality: string = 'best') => {
    const response = await api.post(
      '/download/audio',
      { url, format, quality },
      { responseType: 'blob' }
    );
    return response;
  },

  getHistory: async (page: number = 1, limit: number = 20, platform?: string, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (platform && platform !== 'all') params.append('platform', platform);
    if (search) params.append('search', search);

    const response = await api.get(`/download/history?${params}`);
    return response.data.data;
  },

  deleteHistoryItem: async (id: string) => {
    const response = await api.delete(`/download/history/${id}`);
    return response.data;
  },

  getStats: async (): Promise<DownloadStats> => {
    const response = await api.get('/download/stats');
    return response.data.data;
  },
};

/**
 * Trigger browser download from blob response
 */
export const triggerBlobDownload = (response: { data: Blob; headers: Record<string, string> }, fallbackName: string) => {
  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'] || '';
  const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : fallbackName;

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};
