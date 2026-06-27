import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import HistoryTable from '../components/HistoryTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadService, type DownloadHistoryItem } from '../services/downloadService';

const History: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [platform, setPlatform] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await downloadService.getHistory(page, 20, platform, search);
      setDownloads(data.downloads);
      setTotalPages(data.pagination.pages);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [page, platform, search]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await downloadService.deleteHistoryItem(id);
      setDownloads((prev) => prev.filter((d) => d._id !== id));
      toast.success('Deleted from history');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const platforms = ['all', 'youtube', 'facebook', 'instagram', 'tiktok'];

  return (
    <div className="container-wide section-spacing" style={{ paddingTop: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Download <span className="gradient-text">History</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Browse and manage your download history
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'center',
        }}
      >
        {/* Platform Filter */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => { setPlatform(p); setPage(1); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${platform === p ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                background: platform === p ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: platform === p ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px', maxWidth: '320px', marginLeft: 'auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search downloads..."
              className="input-field"
              style={{ paddingLeft: '2.25rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.85rem' }}
            />
          </div>
        </form>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <LoadingSpinner size="lg" message="Loading history..." />
        </div>
      ) : (
        <>
          <HistoryTable downloads={downloads} onDelete={handleDelete} isDeleting={deletingId} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem',
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                  color: page === 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500,
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <FiChevronLeft /> Previous
              </motion.button>

              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {page} / {totalPages}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
                  color: page === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500,
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                Next <FiChevronRight />
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;
