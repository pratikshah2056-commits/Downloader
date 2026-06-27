import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiMusic, FiVideo, FiClock, FiUser, FiEye } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';
import QualitySelector from './QualitySelector';
import { type MediaInfo, formatDuration } from '../services/downloadService';

interface MediaPreviewProps {
  mediaInfo: MediaInfo;
  onDownloadVideo: (format: string, quality: string) => void;
  onDownloadAudio: (format: string, quality: string) => void;
  isDownloading?: boolean;
}

const platformConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  youtube: { icon: <FaYoutube />, color: '#ff0000', label: 'YouTube' },
  facebook: { icon: <FaFacebook />, color: '#1877f2', label: 'Facebook' },
  instagram: { icon: <FaInstagram />, color: '#e4405f', label: 'Instagram' },
  tiktok: { icon: <FaTiktok />, color: '#00f2ea', label: 'TikTok' },
  twitter: { icon: <FaTwitter />, color: '#1da1f2', label: 'Twitter/X' },
  vimeo: { icon: <FaVimeo />, color: '#1ab7ea', label: 'Vimeo' },
  reddit: { icon: <FaReddit />, color: '#ff4500', label: 'Reddit' },
  soundcloud: { icon: <FaSoundcloud />, color: '#ff5500', label: 'SoundCloud' },
  twitch: { icon: <FaTwitch />, color: '#9146ff', label: 'Twitch' },
  pinterest: { icon: <FaPinterest />, color: '#bd081c', label: 'Pinterest' },
  linkedin: { icon: <FaLinkedin />, color: '#0a66c2', label: 'LinkedIn' },
};

const MediaPreview: React.FC<MediaPreviewProps> = ({ mediaInfo, onDownloadVideo, onDownloadAudio, isDownloading = false }) => {
  const [selectedQuality, setSelectedQuality] = useState('best');
  const [selectedVideoFormat, setSelectedVideoFormat] = useState('mp4');
  const [selectedAudioFormat, setSelectedAudioFormat] = useState('mp3');
  const [selectedAudioQuality, setSelectedAudioQuality] = useState('320');
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  const platform = platformConfig[mediaInfo.platform] || { icon: <FiVideo />, color: 'var(--color-accent-primary)', label: 'Unknown' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card"
      style={{ overflow: 'hidden', maxWidth: '42rem', margin: '1.5rem auto 0' }}
    >
      {/* Thumbnail + Info */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0', flexWrap: 'wrap' }}>
        {/* Thumbnail */}
        {mediaInfo.thumbnail && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '280px',
            minHeight: '160px',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <img
              src={mediaInfo.thumbnail}
              alt={mediaInfo.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Duration overlay */}
            {mediaInfo.duration > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}>
                {formatDuration(mediaInfo.duration)}
              </div>
            )}
            {/* Platform badge */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              left: '0.5rem',
              background: 'rgba(0,0,0,0.7)',
              color: platform.color,
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}>
              {platform.icon} {platform.label}
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{ flex: 1, padding: '1.25rem', minWidth: '240px' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.4,
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {mediaInfo.title}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {mediaInfo.uploader && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiUser /> {mediaInfo.uploader}
              </span>
            )}
            {mediaInfo.duration > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiClock /> {formatDuration(mediaInfo.duration)}
              </span>
            )}
            {mediaInfo.viewCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiEye /> {mediaInfo.viewCount.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {[
          { id: 'video' as const, label: 'Video', icon: <FiVideo /> },
          { id: 'audio' as const, label: 'Audio Only', icon: <FiMusic /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Download Options */}
      <div style={{ padding: '1.25rem' }}>
        {activeTab === 'video' ? (
          <>
            {/* Quality Selection */}
            {mediaInfo.videoQualities.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                  Quality
                </label>
                <QualitySelector
                  qualities={mediaInfo.videoQualities}
                  selectedQuality={selectedQuality}
                  onSelect={setSelectedQuality}
                />
              </div>
            )}

            {/* Format Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                Format
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(mediaInfo.availableVideoFormats || ['mp4', 'webm']).map((fmt) => (
                  <motion.button
                    key={fmt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVideoFormat(fmt)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${selectedVideoFormat === fmt ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                      background: selectedVideoFormat === fmt ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: selectedVideoFormat === fmt ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {fmt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDownloadVideo(selectedVideoFormat, selectedQuality)}
              disabled={isDownloading}
              className="btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem',
                fontSize: '1rem',
              }}
            >
              <FiDownload /> {isDownloading ? 'Downloading...' : 'Download Video'}
            </motion.button>
          </>
        ) : (
          <>
            {/* Audio Format */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                Audio Format
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(mediaInfo.availableAudioFormats || ['mp3', 'm4a']).map((fmt) => (
                  <motion.button
                    key={fmt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAudioFormat(fmt)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${selectedAudioFormat === fmt ? 'var(--color-accent-secondary)' : 'var(--color-border)'}`,
                      background: selectedAudioFormat === fmt ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      color: selectedAudioFormat === fmt ? 'var(--color-accent-secondary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {fmt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Audio Quality */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                Audio Quality (Bitrate)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { value: '320', label: '320 kbps' },
                  { value: '240', label: '240 kbps' },
                  { value: '192', label: '192 kbps' },
                  { value: '128', label: '128 kbps' },
                  { value: 'best', label: '✨ Best' },
                ].map((q) => (
                  <motion.button
                    key={q.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAudioQuality(q.value)}
                    type="button"
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${selectedAudioQuality === q.value ? 'var(--color-accent-secondary)' : 'var(--color-border)'}`,
                      background: selectedAudioQuality === q.value ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      color: selectedAudioQuality === q.value ? 'var(--color-accent-secondary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {q.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Download Audio Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDownloadAudio(selectedAudioFormat, selectedAudioQuality)}
              disabled={isDownloading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                opacity: isDownloading ? 0.5 : 1,
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.2s',
              }}
            >
              <FiMusic /> {isDownloading ? 'Extracting...' : 'Download Audio'}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MediaPreview;
