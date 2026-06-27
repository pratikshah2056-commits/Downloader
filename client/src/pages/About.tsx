import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiZap, FiGlobe, FiHeart } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';

const About: React.FC = () => {
  return (
    <div className="container-narrow section-spacing">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              width: '4rem', height: '4rem',
              background: 'var(--gradient-primary)', borderRadius: 'var(--radius-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', color: 'white', fontSize: '1.75rem',
            }}
          >
            <FiDownload />
          </motion.div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            About <span className="gradient-text">MediaDL</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '32rem', margin: '0 auto' }}>
            MediaDL is a modern media download platform that lets you save videos and audio from your favorite social platforms quickly and securely.
          </p>
        </div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiHeart style={{ color: 'var(--color-accent-tertiary)' }} /> Our Mission
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            We believe in making media accessible. Whether you need to save a tutorial for offline viewing, 
            keep a backup of your own content, or extract audio from a video — MediaDL makes it effortless 
            while respecting copyright and platform terms of service.
          </p>
        </motion.div>

        {/* Supported Platforms */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiGlobe style={{ color: 'var(--color-accent-primary)' }} /> Supported Platforms
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'YouTube', icon: <FaYoutube size={28} />, color: '#ff0000', url: 'https://youtube.com' },
              { name: 'Facebook', icon: <FaFacebook size={28} />, color: '#1877f2', url: 'https://facebook.com' },
              { name: 'Instagram', icon: <FaInstagram size={28} />, color: '#e4405f', url: 'https://instagram.com' },
              { name: 'TikTok', icon: <FaTiktok size={28} />, color: '#00f2ea', url: 'https://tiktok.com' },
              { name: 'Twitter/X', icon: <FaTwitter size={28} />, color: '#1da1f2', url: 'https://x.com' },
              { name: 'Vimeo', icon: <FaVimeo size={28} />, color: '#1ab7ea', url: 'https://vimeo.com' },
              { name: 'Reddit', icon: <FaReddit size={28} />, color: '#ff4500', url: 'https://reddit.com' },
              { name: 'SoundCloud', icon: <FaSoundcloud size={28} />, color: '#ff5500', url: 'https://soundcloud.com' },
              { name: 'Twitch', icon: <FaTwitch size={28} />, color: '#9146ff', url: 'https://twitch.tv' },
              { name: 'Pinterest', icon: <FaPinterest size={28} />, color: '#bd081c', url: 'https://pinterest.com' },
              { name: 'LinkedIn', icon: <FaLinkedin size={28} />, color: '#0a66c2', url: 'https://linkedin.com' },
            ].map((p) => (
              <motion.a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  textAlign: 'center', padding: '1.25rem',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  display: 'block',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ color: p.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{p.icon}</div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>{p.name}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiZap style={{ color: '#f59e0b' }} /> Key Features
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              'Download videos in MP4 and WEBM formats',
              'Extract audio in MP3 and M4A',
              'Quality options from 144p to 1080p',
              'Secure JWT authentication',
              'Full download history tracking',
              'Dark and light mode support',
              'Mobile responsive design',
              'Rate limiting and input sanitization',
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gradient-primary)', flexShrink: 0 }} />
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
