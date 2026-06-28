import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      padding: '3rem 0 2rem',
      marginTop: 'auto',
      background: 'var(--color-bg-secondary)',
    }}>
      <div className="container-wide">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '2rem', height: '2rem',
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '0.875rem',
              }}>
                ⬇
              </div>
              <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.125rem' }}>MediaDL</span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Download videos and audio from your favorite platforms quickly and easily.
            </p>
            {/* Download App Button */}
            {(() => {
              const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
              const hostUrl = apiBase.replace(/\/api\/?$/, '');
              const apkUrl = `${hostUrl}/public/mediadl.apk`;
              return (
                <a
                  href={apkUrl}
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--gradient-primary)',
                    borderRadius: 'var(--radius-full)',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  📱 Download App
                </a>
              );
            })()}
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/history', label: 'History' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Supported Platforms */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Supported Platforms</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { name: 'YouTube',   url: 'https://youtube.com' },
                { name: 'Facebook',  url: 'https://facebook.com' },
                { name: 'Instagram', url: 'https://instagram.com' },
                { name: 'TikTok',   url: 'https://tiktok.com' },
              ].map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  {platform.name}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Privacy Policy
              </Link>
              <Link to="/about" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            © {currentYear} MediaDL from The Alpha 7. All rights reserved.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <p style={{
          marginTop: '1rem',
          color: 'var(--color-text-muted)',
          fontSize: '0.7rem',
          lineHeight: 1.5,
          opacity: 0.7,
        }}>
          Disclaimer: This application is designed for downloading content that users own or have permission to access. 
          Users are responsible for complying with copyright laws and platform terms of service.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
