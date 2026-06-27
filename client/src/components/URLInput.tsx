import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLink, FiX, FiSearch, FiClipboard } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
}

const platformIcons: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
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

const detectPlatform = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) return 'facebook';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('vimeo.com')) return 'vimeo';
    if (hostname.includes('reddit.com')) return 'reddit';
    if (hostname.includes('soundcloud.com')) return 'soundcloud';
    if (hostname.includes('twitch.tv')) return 'twitch';
    if (hostname.includes('pinterest.com')) return 'pinterest';
    if (hostname.includes('linkedin.com')) return 'linkedin';
  } catch {
    // Not a valid URL yet
  }
  return null;
};

const URLInput: React.FC<URLInputProps> = ({ onAnalyze, isLoading = false }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const platform = detectPlatform(url);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // Clipboard access denied
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze(url.trim());
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '42rem', margin: '0 auto' }}>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(99, 102, 241, 0.2), 0 0 30px rgba(99, 102, 241, 0.15)'
            : '0 0 0 1px var(--color-border)',
        }}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--color-bg-card)',
          border: `2px solid ${isFocused ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
          transition: 'border-color 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
          {/* Platform Icon or Link Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            color: platform ? platformIcons[platform]?.color : 'var(--color-text-muted)',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}>
            {platform ? platformIcons[platform].icon : <FiLink />}
          </div>

          {/* Input */}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste a video URL from YouTube, Facebook, Instagram, or TikTok..."
            style={{
              flex: 1,
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
            disabled={isLoading}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingRight: '0.25rem' }}>
            {url && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={handleClear}
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <FiX />
              </motion.button>
            )}

            {!url && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePaste}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                <FiClipboard /> Paste
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!url.trim() || isLoading}
              className="btn-primary"
              style={{
                padding: '0.625rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '1rem', height: '1rem', border: '2px solid transparent', borderTopColor: 'white', borderRadius: '50%' }}
                />
              ) : (
                <FiSearch />
              )}
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </motion.button>
          </div>
        </div>

        {/* Platform Badge */}
        {platform && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0.375rem 1rem 0.625rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.8rem',
            }}
          >
            <span
              className={`platform-badge-${platform}`}
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {platformIcons[platform].icon} {platformIcons[platform].label} detected
            </span>
          </motion.div>
        )}
      </motion.div>
    </form>
  );
};

export default URLInput;
