import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiDownload, FiTrash2, FiVideo, FiActivity } from 'react-icons/fi';
import { 
  FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter, 
  FaVimeo, FaReddit, FaSoundcloud, FaTwitch, FaPinterest, FaLinkedin 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminService, type AdminStats, type AdminUser, type AdminDownload } from '../services/adminService';
import { formatFileSize } from '../services/downloadService';

const platformIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  youtube: { icon: <FaYoutube />, color: '#ff0000' },
  facebook: { icon: <FaFacebook />, color: '#1877f2' },
  instagram: { icon: <FaInstagram />, color: '#e4405f' },
  tiktok: { icon: <FaTiktok />, color: '#00f2ea' },
  twitter: { icon: <FaTwitter />, color: '#1da1f2' },
  vimeo: { icon: <FaVimeo />, color: '#1ab7ea' },
  reddit: { icon: <FaReddit />, color: '#ff4500' },
  soundcloud: { icon: <FaSoundcloud />, color: '#ff5500' },
  twitch: { icon: <FaTwitch />, color: '#9146ff' },
  pinterest: { icon: <FaPinterest />, color: '#bd081c' },
  linkedin: { icon: <FaLinkedin />, color: '#0a66c2' },
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [downloads, setDownloads] = useState<AdminDownload[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'downloads'>('users');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [downloadPage, setDownloadPage] = useState(1);
  const [downloadTotalPages, setDownloadTotalPages] = useState(1);

  // Deletion locks
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingDownloadId, setDeletingDownloadId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadDownloads();
    }
  }, [activeTab, userPage, downloadPage]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, downloadsData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(userPage),
        adminService.getDownloads(downloadPage),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setUserTotalPages(usersData.pagination.pages);
      setDownloads(downloadsData.downloads);
      setDownloadTotalPages(downloadsData.pagination.pages);
    } catch {
      toast.error('Failed to load administrative records');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers(userPage);
      setUsers(data.users);
      setUserTotalPages(data.pagination.pages);
    } catch {
      toast.error('Failed to refresh user list');
    }
  };

  const loadDownloads = async () => {
    try {
      const data = await adminService.getDownloads(downloadPage);
      setDownloads(data.downloads);
      setDownloadTotalPages(data.pagination.pages);
    } catch {
      toast.error('Failed to refresh download logs');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user and all their download history? This action is permanent.')) return;

    setDeletingUserId(id);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User and associated records deleted');
      // Refresh stats
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteDownload = async (id: string) => {
    if (!window.confirm('Delete this download log record?')) return;

    setDeletingDownloadId(id);
    try {
      await adminService.deleteDownload(id);
      setDownloads((prev) => prev.filter((d) => d._id !== id));
      toast.success('Download record removed');
      // Refresh stats
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch {
      toast.error('Failed to delete download record');
    } finally {
      setDeletingDownloadId(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner size="lg" message="Loading administrative portal..." />
      </div>
    );
  }

  return (
    <div className="container-wide section-spacing" style={{ paddingTop: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Admin <span className="gradient-text">Portal</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
          System diagnostics and database records management
        </p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '3.25rem', height: '3.25rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-accent-primary)', fontSize: '1.5rem',
            }}>
              <FiUsers />
            </div>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalUsers}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Total Users</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '3.25rem', height: '3.25rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-accent-secondary)', fontSize: '1.5rem',
            }}>
              <FiDownload />
            </div>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalDownloads}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Total Download Logs</p>
            </div>
          </div>

          {stats.platformDistribution.slice(0, 2).map((pd) => {
            const platform = platformIcons[pd.platform] || { icon: <FiActivity />, color: 'var(--color-text-muted)' };
            return (
              <div key={pd.platform} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '3.25rem', height: '3.25rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', color: platform.color,
                }}>
                  {platform.icon}
                </div>
                <div>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{pd.count}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                    {pd.platform} downloads
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '2rem',
      }}>
        {[
          { id: 'users' as const, label: 'Registered Users', count: stats?.totalUsers },
          { id: 'downloads' as const, label: 'Global Download Log', count: stats?.totalDownloads },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Grid lists */}
      <div>
        {activeTab === 'users' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence mode="popLayout">
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{user.username}</span>
                      <span style={{
                        padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-sm)',
                        background: user.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-secondary)',
                        color: user.role === 'admin' ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                      }}>
                        {user.role}
                      </span>
                      {user.isVerified ? (
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>● Verified</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>● Unverified</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {user.email} · Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={deletingUserId === user._id}
                    style={{
                      width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(239, 68, 68, 0.2)', background: 'transparent',
                      color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', opacity: deletingUserId === user._id ? 0.5 : 1,
                    }}
                  >
                    <FiTrash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Users Pagination */}
            {userTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Prev</button>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>{userPage} / {userTotalPages}</span>
                <button disabled={userPage === userTotalPages} onClick={() => setUserPage(p => p + 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence mode="popLayout">
              {downloads.map((item) => {
                const platform = platformIcons[item.platform] || { icon: <FiVideo />, color: 'var(--color-text-muted)' };
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                    }}
                  >
                    {/* Platform Badge */}
                    <div style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', color: platform.color, flexShrink: 0,
                    }}>
                      {platform.icon}
                    </div>

                    {/* Metadata */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        User: <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{item.userId?.username || 'Deleted User'}</span> ({item.userId?.email || 'N/A'})
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        <span>Format: <strong style={{ textTransform: 'uppercase' }}>{item.format}</strong></span>
                        {item.quality && <span>Quality: {item.quality}</span>}
                        {item.fileSize > 0 && <span>Size: {formatFileSize(item.fileSize)}</span>}
                        <span>Date: {new Date(item.downloadDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteDownload(item._id)}
                      disabled={deletingDownloadId === item._id}
                      style={{
                        width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(239, 68, 68, 0.2)', background: 'transparent',
                        color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', opacity: deletingDownloadId === item._id ? 0.5 : 1,
                        flexShrink: 0,
                      }}
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Downloads Pagination */}
            {downloadTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button disabled={downloadPage === 1} onClick={() => setDownloadPage(p => p - 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Prev</button>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>{downloadPage} / {downloadTotalPages}</span>
                <button disabled={downloadPage === downloadTotalPages} onClick={() => setDownloadPage(p => p + 1)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
