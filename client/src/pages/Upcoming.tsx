import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiStar, FiMonitor, FiCompass } from 'react-icons/fi';

const Upcoming: React.FC = () => {
  const upcomingFeatures = [
    {
      category: 'Premium Features',
      icon: <FiStar style={{ fontSize: '1.5rem', color: '#fbbf24' }} />,
      color: '#fbbf24',
      items: [
        {
          title: 'Ad-Free Premium Downloader',
          description: 'Unlock maximum speed limits and fully ad-free workspace for premium subscribers.',
          status: 'In Development',
        },
        {
          title: 'Batch & Playlist Downloads',
          description: 'Download entire video playlists, albums, or user channels in one click.',
          status: 'Planning',
        },
        {
          title: 'Direct Cloud Sync',
          description: 'Save downloads directly to Google Drive, Dropbox, or OneDrive without using your local bandwidth.',
          status: 'Designing',
        },
      ],
    },
    {
      category: 'Windows Desktop App',
      icon: <FiMonitor style={{ fontSize: '1.5rem', color: '#3b82f6' }} />,
      color: '#3b82f6',
      items: [
        {
          title: 'Native Windows Client',
          description: 'A lightning-fast native application built for Windows 10 & 11 with system tray minimization.',
          status: 'Prototype Ready',
        },
        {
          title: 'Clipboard Auto-Monitoring',
          description: 'Automatically detects copied links in the background and prompts to download.',
          status: 'In Development',
        },
        {
          title: 'Background Scheduler',
          description: 'Queue downloads to start automatically during off-peak network hours.',
          status: 'Planning',
        },
      ],
    },
    {
      category: 'Browser Extensions & Customizations',
      icon: <FiCompass style={{ fontSize: '1.5rem', color: '#10b981' }} />,
      color: '#10b981',
      items: [
        {
          title: 'Chrome / Firefox Extension',
          description: 'Add a download button directly below videos on YouTube, Facebook, and Instagram.',
          status: 'Designing',
        },
        {
          title: 'Smart Audio Tag Editor',
          description: 'Edit ID3 tags, album art, and customize audio metadata before downloading.',
          status: 'In Development',
        },
        {
          title: 'Subtitles & Closed Captions',
          description: 'Extract and download subtitles in SRT or VTT formats in multiple languages.',
          status: 'Planning',
        },
      ],
    },
  ];

  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '85vh', padding: '4rem 1.5rem' }}>
      <div className="container-wide" style={{ maxWidth: '64rem' }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '1.5rem',
            color: '#a5b4fc',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <FiClock /> Coming Soon
        </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Upcoming <span className="gradient-text">Features</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '32rem', margin: '0 auto' }}>
            Check out what we are building next to make MediaDL the best downloading tool on the web.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {upcomingFeatures.map((sec, idx) => (
            <motion.div
              key={sec.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="glass-card"
              style={{ padding: '2rem', border: `1px solid var(--color-border)` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '12px',
                  background: `${sec.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {sec.icon}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {sec.category}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {sec.items.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '140px',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    </div>
                    
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        background: item.status === 'In Development' ? 'rgba(16, 185, 129, 0.15)' : item.status === 'Prototype Ready' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                        color: item.status === 'In Development' ? '#10b981' : item.status === 'Prototype Ready' ? '#3b82f6' : '#94a3b8',
                        border: `1px solid ${item.status === 'In Development' ? 'rgba(16, 185, 129, 0.3)' : item.status === 'Prototype Ready' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Upcoming;
