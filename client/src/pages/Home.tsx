import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiZap, FiShield, FiClock, FiMonitor, FiMusic } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';
import URLInput from '../components/URLInput';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: <FiZap />, title: 'Lightning Fast', description: 'Analyze and download media in seconds with our optimized backend.' },
    { icon: <FiMonitor />, title: 'Multiple Qualities', description: 'Choose from 144p to 1080p — download in the quality you need.' },
    { icon: <FiMusic />, title: 'Audio Extraction', description: 'Extract audio in MP3 or M4A format from any video.' },
    { icon: <FiShield />, title: 'Secure & Private', description: 'Your data is protected with enterprise-grade security.' },
    { icon: <FiClock />, title: 'Download History', description: 'Keep track of all your downloads with full history.' },
    { icon: <FiDownload />, title: 'Multiple Formats', description: 'Download in MP4, WEBM, MP3, or M4A formats.' },
  ];

  const platforms = [
    { icon: <FaYoutube size={40} />, name: 'YouTube', color: '#ff0000', bg: 'rgba(255, 0, 0, 0.1)', url: 'https://youtube.com' },
    { icon: <FaFacebook size={40} />, name: 'Facebook', color: '#1877f2', bg: 'rgba(24, 119, 242, 0.1)', url: 'https://facebook.com' },
    { icon: <FaInstagram size={40} />, name: 'Instagram', color: '#e4405f', bg: 'rgba(228, 64, 95, 0.1)', url: 'https://instagram.com' },
    { icon: <FaTiktok size={40} />, name: 'TikTok', color: '#00f2ea', bg: 'rgba(0, 242, 234, 0.1)', url: 'https://tiktok.com' },
    { icon: <FaTwitter size={40} />, name: 'Twitter/X', color: '#1da1f2', bg: 'rgba(29, 161, 242, 0.1)', url: 'https://x.com' },
    { icon: <FaVimeo size={40} />, name: 'Vimeo', color: '#1ab7ea', bg: 'rgba(26, 183, 234, 0.1)', url: 'https://vimeo.com' },
    { icon: <FaReddit size={40} />, name: 'Reddit', color: '#ff4500', bg: 'rgba(255, 69, 0, 0.1)', url: 'https://reddit.com' },
    { icon: <FaSoundcloud size={40} />, name: 'SoundCloud', color: '#ff5500', bg: 'rgba(255, 85, 0, 0.1)', url: 'https://soundcloud.com' },
    { icon: <FaTwitch size={40} />, name: 'Twitch', color: '#9146ff', bg: 'rgba(145, 70, 255, 0.1)', url: 'https://twitch.tv' },
    { icon: <FaPinterest size={40} />, name: 'Pinterest', color: '#bd081c', bg: 'rgba(189, 8, 28, 0.1)', url: 'https://pinterest.com' },
    { icon: <FaLinkedin size={40} />, name: 'LinkedIn', color: '#0a66c2', bg: 'rgba(10, 102, 194, 0.1)', url: 'https://linkedin.com' },
  ];

  const steps = [
    { step: '01', title: 'Paste URL', description: 'Copy the video URL from any supported platform and paste it here.' },
    { step: '02', title: 'Choose Quality', description: 'Select your preferred video quality and output format.' },
    { step: '03', title: 'Download', description: 'Click download and get your media file instantly.' },
  ];

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section style={{
        position: 'relative',
        padding: '6rem 1.5rem 5rem',
        overflow: 'hidden',
        background: 'var(--gradient-hero)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '10%', left: '10%',
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent)',
              filter: 'blur(60px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: '10%', right: '10%',
              width: '400px', height: '400px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent)',
              filter: 'blur(80px)',
            }}
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '250px', height: '250px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1), transparent)',
              filter: 'blur(60px)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="container-wide" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                marginBottom: '2rem',
                color: '#a5b4fc',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <FiZap /> Free & Fast Media Downloader
            </motion.div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: 'white',
              letterSpacing: '-0.03em',
            }}>
              Download Videos &{' '}
              <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Audio
              </span>
              <br />
              From Anywhere
            </h1>

            <p style={{
              fontSize: '1.125rem',
              color: '#94a3b8',
              maxWidth: '36rem',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
            }}>
              Paste a link from YouTube, Facebook, Instagram, or TikTok and download in your preferred quality and format — instantly.
            </p>
          </motion.div>

          {/* URL Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {isAuthenticated ? (
              <URLInput onAnalyze={() => {}} />
            ) : (
              <div>
                <URLInput onAnalyze={() => {}} />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem' }}
                >
                  <Link to="/register" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
                    Create a free account
                  </Link>{' '}
                  to start downloading
                </motion.p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Supported Platforms ─── */}
      <section className="section-spacing" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="container-wide" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Supported <span className="gradient-text">Platforms</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem', fontSize: '1.05rem' }}>
              Download from the world's most popular video platforms
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            maxWidth: '68rem',
            margin: '0 auto',
          }}>
            {platforms.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card"
                style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'block',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: 'var(--radius-lg)',
                  background: p.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: p.color,
                }}>
                  {p.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.name}</h3>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="section-spacing" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Why Choose <span className="gradient-text">MediaDL</span>?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
              Packed with features designed for the best download experience
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-card"
                style={{ padding: '2rem' }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent-primary)',
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section-spacing" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
              Download media in three simple steps
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: '56rem',
            margin: '0 auto',
          }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '3rem',
                  fontWeight: 900,
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '1rem',
                  opacity: 0.6,
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'var(--gradient-hero)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container-narrow"
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Ready to Start Downloading?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Create a free account and start downloading media from your favorite platforms.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.875rem 2.5rem' }}>
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary" style={{ fontSize: '1.05rem', padding: '0.875rem 2.5rem' }}>
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
