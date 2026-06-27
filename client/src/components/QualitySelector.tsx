import React from 'react';
import { motion } from 'framer-motion';

interface QualitySelectorProps {
  qualities: string[];
  selectedQuality: string;
  onSelect: (quality: string) => void;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({ qualities, selectedQuality, onSelect }) => {
  const allQualities = [...qualities, 'best'];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {allQualities.map((quality) => (
        <motion.button
          key={quality}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(quality)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: `2px solid ${selectedQuality === quality ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
            background: selectedQuality === quality
              ? 'rgba(99, 102, 241, 0.15)'
              : 'var(--color-bg-card)',
            color: selectedQuality === quality
              ? 'var(--color-accent-primary)'
              : 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            transition: 'all 0.2s',
          }}
        >
          {quality === 'best' ? '✨ Best' : quality}
        </motion.button>
      ))}
    </div>
  );
};

export default QualitySelector;
