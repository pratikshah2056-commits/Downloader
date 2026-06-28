import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import URLInput from '../components/URLInput';
import MediaPreview from '../components/MediaPreview';
import DownloadProgress from '../components/DownloadProgress';
import HistoryTable from '../components/HistoryTable';
import { useAuth } from '../contexts/AuthContext';
import { downloadService, type MediaInfo, type DownloadStats, triggerBlobDownload } from '../services/downloadService';

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <FaYoutube />,
  facebook: <FaFacebook />,
  instagram: <FaInstagram />,
  tiktok: <FaTiktok />,
  twitter: <FaTwitter />,
  vimeo: <FaVimeo />,
  reddit: <FaReddit />,
  soundcloud: <FaSoundcloud />,
  twitch: <FaTwitch />,
  pinterest: <FaPinterest />,
  linkedin: <FaLinkedin />,
};

const platformsList = [
  { icon: <FaYoutube size={20} />, name: 'YouTube', color: '#ff0000', bg: 'rgba(255, 0, 0, 0.1)', url: 'https://youtube.com' },
  { icon: <FaFacebook size={20} />, name: 'Facebook', color: '#1877f2', bg: 'rgba(24, 119, 242, 0.1)', url: 'https://facebook.com' },
  { icon: <FaInstagram size={20} />, name: 'Instagram', color: '#e4405f', bg: 'rgba(228, 64, 95, 0.1)', url: 'https://instagram.com' },
  { icon: <FaTiktok size={20} />, name: 'TikTok', color: '#00f2ea', bg: 'rgba(0, 242, 234, 0.1)', url: 'https://tiktok.com' },
  { icon: <FaTwitter size={20} />, name: 'Twitter/X', color: '#1da1f2', bg: 'rgba(29, 161, 242, 0.1)', url: 'https://x.com' },
  { icon: <FaVimeo size={20} />, name: 'Vimeo', color: '#1ab7ea', bg: 'rgba(26, 183, 234, 0.1)', url: 'https://vimeo.com' },
  { icon: <FaReddit size={20} />, name: 'Reddit', color: '#ff4500', bg: 'rgba(255, 69, 0, 0.1)', url: 'https://reddit.com' },
  { icon: <FaSoundcloud size={20} />, name: 'SoundCloud', color: '#ff5500', bg: 'rgba(255, 85, 0, 0.1)', url: 'https://soundcloud.com' },
  { icon: <FaTwitch size={20} />, name: 'Twitch', color: '#9146ff', bg: 'rgba(145, 70, 255, 0.1)', url: 'https://twitch.tv' },
  { icon: <FaPinterest size={20} />, name: 'Pinterest', color: '#bd081c', bg: 'rgba(189, 8, 28, 0.1)', url: 'https://pinterest.com' },
  { icon: <FaLinkedin size={20} />, name: 'LinkedIn', color: '#0a66c2', bg: 'rgba(10, 102, 194, 0.1)', url: 'https://linkedin.com' },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await downloadService.getStats();
      setStats(data);
    } catch {
      // Stats are optional, silently fail
    }
  };

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setMediaInfo(null);
    setCurrentUrl(url);

    try {
      const info = await downloadService.getMediaInfo(url);
      setMediaInfo(info);
      toast.success('Media info loaded!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to analyze URL');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadVideo = async (format: string, quality: string) => {
    if (!currentUrl) return;
    setIsDownloading(true);
    setDownloadProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => Math.min(prev + Math.random() * 15, 90));
      }, 1000);

      const response = await downloadService.downloadVideo(currentUrl, format, quality);
      clearInterval(progressInterval);
      setDownloadProgress(100);

      const safeName = (mediaInfo?.title || 'download').replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 80);
      triggerBlobDownload(response as any, `${safeName}.${format}`);

      toast.success('Download complete!');
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Download failed');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  const handleDownloadAudio = async (format: string, quality: string) => {
    if (!currentUrl) return;
    setIsDownloading(true);
    setDownloadProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => Math.min(prev + Math.random() * 15, 90));
      }, 1000);

      const response = await downloadService.downloadAudio(currentUrl, format, quality);
      clearInterval(progressInterval);
      setDownloadProgress(100);

      const safeName = (mediaInfo?.title || 'download').replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 80);
      triggerBlobDownload(response as any, `${safeName}.${format}`);

      toast.success('Audio download complete!');
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Audio download failed');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  const handleDeleteRecent = async (id: string) => {
    try {
      await downloadService.deleteHistoryItem(id);
      loadStats();
      toast.success('Removed from history');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="container-wide section-spacing" style={{ paddingTop: '2rem' }}>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Welcome back, <span className="gradient-text">{user?.username}</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Paste a URL to get started</p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-accent-primary)', fontSize: '1.25rem',
            }}>
              <FiDownload />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalDownloads}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Downloads</p>
            </div>
          </div>

          {stats.platformStats.slice(0, 3).map((ps) => (
            <div key={ps.platform} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
              }}>
                {platformIcons[ps.platform] || <FiTrendingUp />}
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{ps.count}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{ps.platform}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <URLInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
      </motion.div>

      {/* Platform Quick Links */}
      {!mediaInfo && !isDownloading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginTop: '2.5rem', textAlign: 'center' }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Supported Platforms (Click to open, find a video, and paste its URL above)
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
            maxWidth: '48rem',
            margin: '0 auto',
          }}>
            {platformsList.map((p) => (
              <motion.a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ color: p.color, display: 'flex', alignItems: 'center' }}>{p.icon}</span>
                {p.name}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <DownloadProgress
          progress={downloadProgress}
          message={downloadProgress >= 90 ? 'Preparing file...' : 'Downloading media...'}
        />
      )}

      {/* Media Preview */}
      {mediaInfo && !isDownloading && (
        <MediaPreview
          mediaInfo={mediaInfo}
          onDownloadVideo={handleDownloadVideo}
          onDownloadAudio={handleDownloadAudio}
          isDownloading={isDownloading}
        />
      )}

      {/* Recent Downloads */}
      {stats && stats.recentDownloads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '3rem' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Recent Downloads
          </h2>
          <HistoryTable
            downloads={stats.recentDownloads}
            onDelete={handleDeleteRecent}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
