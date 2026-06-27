import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiExternalLink, FiVideo, FiMusic } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';
import { type DownloadHistoryItem, formatFileSize } from '../services/downloadService';

interface HistoryTableProps {
  downloads: DownloadHistoryItem[];
  onDelete: (id: string) => void;
  isDeleting?: string | null;
}

const platformIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  youtube: { icon: <FaYoutube />, color: '#ff0000' },
  facebook: { icon: <FaFacebook />, color: '#1877f2' },
  instagram: { icon: <FaInstagram />, color: '#e4405f' },
  tiktok: { icon: <FaTiktok />, color: '#00f2ea' },
  twitter: { icon: <FaTwitter />, color: '#1da1f2' },
  vimeo: { icon: <FaVimeo />, color: '#1ab7ea' },
  reddit: { icon: <FaReddit />, color: '#ff4500' },
  soundcloud: { icon: <FaSoundcloud />, color: '#ff5500' },
  twitch: { icon: <FaTwitch />, color: '#9146ff' },
  pinterest: { icon: <FaPinterest />, color: '#bd081c' },
  linkedin: { icon: <FaLinkedin />, color: '#0a66c2' },
};

const HistoryTable: React.FC<HistoryTableProps> = ({ downloads, onDelete, isDeleting }) => {
  if (downloads.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'var(--color-text-muted)',
      }}>
        <FiVideo size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No downloads yet</p>
        <p style={{ fontSize: '0.875rem' }}>Your download history will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <AnimatePresence>
        {downloads.map((item, index) => {
          const platform = platformIcons[item.platform] || { icon: <FiVideo />, color: 'var(--color-text-muted)' };
          const isAudio = ['mp3', 'm4a'].includes(item.format);

          return (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                cursor: 'default',
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: '5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--color-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '1.25rem' }}>
                    {isAudio ? <FiMusic /> : <FiVideo />}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '0.25rem',
                }}>
                  {item.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: platform.color }}>
                    {platform.icon} {item.platform}
                  </span>
                  <span style={{
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-bg-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                  }}>
                    {item.format}
                  </span>
                  {item.quality && item.quality !== 'audio' && (
                    <span>{item.quality}</span>
                  )}
                  {item.fileSize > 0 && (
                    <span>{formatFileSize(item.fileSize)}</span>
                  )}
                  <span>{new Date(item.downloadDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                  }}
                  title="Open original URL"
                >
                  <FiExternalLink />
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(item._id)}
                  disabled={isDeleting === item._id}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    background: 'transparent',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    opacity: isDeleting === item._id ? 0.5 : 1,
                  }}
                  title="Delete from history"
                >
                  <FiTrash2 />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default HistoryTable;
