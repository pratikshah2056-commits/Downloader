import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface DownloadProgressProps {
  progress: number; // 0-100
  message?: string;
  onCancel?: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({ progress, message, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '1.5rem', marginTop: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '1.25rem',
              height: '1.25rem',
              border: '2px solid transparent',
              borderTopColor: 'var(--color-accent-primary)',
              borderRightColor: 'var(--color-accent-secondary)',
              borderRadius: '50%',
            }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {message || 'Processing download...'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent-primary)' }}>
            {progress}%
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '6px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-bg-secondary)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%',
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-full)',
            position: 'relative',
          }}
        >
          <div
            className="animate-shimmer"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-full)',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DownloadProgress;
