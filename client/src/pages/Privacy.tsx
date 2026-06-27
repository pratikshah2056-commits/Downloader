import React from 'react';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

const Privacy: React.FC = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: `When you create an account, we collect your username, email address, and a securely hashed version of your password. We also store metadata about your downloads (URLs, titles, formats, timestamps) to provide download history functionality. We do not store the actual downloaded media files permanently — they are temporarily cached and automatically deleted.`,
    },
    {
      title: 'How We Use Your Information',
      content: `Your information is used solely to provide and improve our services. This includes authenticating your account, displaying your download history, and generating usage statistics visible only to you. We do not sell, share, or distribute your personal information to third parties.`,
    },
    {
      title: 'Data Security',
      content: `We implement industry-standard security measures including password hashing with bcrypt, JWT-based authentication, rate limiting, input sanitization, and HTTPS encryption. While no system is 100% secure, we take reasonable precautions to protect your data.`,
    },
    {
      title: 'Cookies and Local Storage',
      content: `We use browser local storage to persist your authentication token and theme preference. We do not use tracking cookies or third-party analytics.`,
    },
    {
      title: 'Data Retention',
      content: `Your account information is retained as long as your account is active. Download history is kept indefinitely unless you manually delete entries. Downloaded media files are automatically purged from our servers within one hour.`,
    },
    {
      title: 'Your Rights',
      content: `You have the right to access, modify, or delete your personal data at any time through your profile settings. You may also request complete account deletion by contacting us.`,
    },
    {
      title: 'Copyright and Legal Use',
      content: `This service is intended for downloading content that you own, have created, or have explicit permission to download. Users are solely responsible for ensuring their use complies with applicable copyright laws and the terms of service of the platforms from which they download content. We do not encourage or support copyright infringement.`,
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page with an updated revision date.`,
    },
  ];

  return (
    <div className="container-narrow section-spacing">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
            <FiShield />
          </motion.div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{ padding: '1.75rem' }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                {section.title}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
