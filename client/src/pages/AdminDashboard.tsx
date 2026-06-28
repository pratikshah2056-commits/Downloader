import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiDownload, FiTrash2, FiVideo, FiActivity, FiKey, FiSave, FiInfo, FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState<'users' | 'downloads' | 'cookies'>('users');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [downloadPage, setDownloadPage] = useState(1);
  const [downloadTotalPages, setDownloadTotalPages] = useState(1);

  // Deletion locks
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingDownloadId, setDeletingDownloadId] = useState<string | null>(null);

  // Cookie states
  const [cookieConfig, setCookieConfig] = useState<any>(null);
  const [cookiesText, setCookiesText] = useState('');
  const [isSavingCookies, setIsSavingCookies] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'downloads') {
      loadDownloads();
    } else if (activeTab === 'cookies') {
      loadCookies();
    }
  }, [activeTab, userPage, downloadPage]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, downloadsData, cookiesData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(userPage),
        adminService.getDownloads(downloadPage),
        adminService.getCookies().catch(() => null),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setUserTotalPages(usersData.pagination.pages);
      setDownloads(downloadsData.downloads);
      setDownloadTotalPages(downloadsData.pagination.pages);
      if (cookiesData) {
        setCookieConfig(cookiesData);
        setCookiesText(cookiesData.content || '');
      }
    } catch {
      toast.error('Failed to load administrative records');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCookies = async () => {
    try {
      const data = await adminService.getCookies();
      setCookieConfig(data);
      setCookiesText(data.content || '');
    } catch {
      toast.error('Failed to refresh cookie settings');
    }
  };

  const handleSaveCookies = async () => {
    setIsSavingCookies(true);
    try {
      const data = await adminService.updateCookies(cookiesText);
      setCookieConfig(data);
      setCookiesText(data.content || '');
      toast.success('Cookies configuration updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cookies');
    } finally {
      setIsSavingCookies(false);
    }
  };

  const handleCopyEnvValue = () => {
    if (!cookiesText) {
      toast.error('No cookies content to copy');
      return;
    }
    navigator.clipboard.writeText(cookiesText);
    toast.success('Cookies text copied! You can paste this as your COOKIES_CONTENT env var.');
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
          { id: 'cookies' as const, label: 'Cookie Manager', count: undefined },
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
        ) : activeTab === 'downloads' ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Header/Status Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
              {/* Card 1: Configuration Status */}
              <div className="glass-card" style={{ flex: '1 1 300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Configuration Status</h3>
                    <FiKey style={{ color: 'var(--color-accent-primary)', fontSize: '1.25rem' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {cookieConfig?.exists ? (
                      cookieConfig.diagnostics?.valid ? (
                        <>
                          <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          <span style={{ fontWeight: 600, color: '#10b981' }}>Active & Valid</span>
                        </>
                      ) : cookieConfig.diagnostics?.reason === 'expired' ? (
                        <>
                          <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          <span style={{ fontWeight: 600, color: '#ef4444' }}>Expired</span>
                        </>
                      ) : (
                        <>
                          <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                          <span style={{ fontWeight: 600, color: '#f59e0b' }}>Invalid Format</span>
                        </>
                      )
                    ) : (
                      <>
                        <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Not Configured</span>
                      </>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
                    {cookieConfig?.exists ? `Source: ${cookieConfig.path}` : 'Server is making anonymous requests. Cloud IPs/VPS are often blocked.'}
                  </p>
                </div>
              </div>

              {/* Card 2: Cookie Diagnostics */}
              <div className="glass-card" style={{ flex: '1 1 300px', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Token Analytics</h3>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                        {cookieConfig?.diagnostics?.validCount || 0}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Valid Tokens</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>
                        {cookieConfig?.diagnostics?.expiredCount || 0}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Expired Tokens</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Badges (Detected Domains) */}
            {cookieConfig?.diagnostics?.domains && cookieConfig.diagnostics.domains.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                  Authenticated Platforms (Detected Domains)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {cookieConfig.diagnostics.domains.map((d: any) => {
                    const matchedPlatform = platformIcons[d.domain.split('.')[0]];
                    const color = matchedPlatform ? matchedPlatform.color : 'var(--color-accent-primary)';
                    return (
                      <div
                        key={d.domain}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: d.validCount > 0 ? '#10b981' : '#ef4444' }} />
                        <strong style={{ color }}>{d.domain}</strong>
                        <span style={{ color: 'var(--color-text-muted)' }}>({d.validCount} / {d.validCount + d.expiredCount})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Cookies Editor Panel */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cookies Editor</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Paste your Netscape format cookies text content below.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleCopyEnvValue}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <FiCopy /> Copy Text
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete the cookies file? Server will fall back to anonymous mode.')) {
                        setCookiesText('');
                        adminService.updateCookies('').then((data) => {
                          setCookieConfig(data);
                          toast.success('Cookies file removed successfully');
                        }).catch(() => toast.error('Failed to clear cookies'));
                      }
                    }}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <FiTrash2 /> Clear File
                  </button>
                </div>
              </div>

              <textarea
                value={cookiesText}
                onChange={(e) => setCookiesText(e.target.value)}
                placeholder="# Netscape HTTP Cookie File&#10;# http://curl.haxx.se/rfc/cookie_spec.html&#10;# This file is generated by libcurl! Edit at your own risk.&#10;.youtube.com	TRUE	/	TRUE	2147483647	SID	..."
                rows={12}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: '1.4',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  onClick={handleSaveCookies}
                  disabled={isSavingCookies}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <FiSave />
                  {isSavingCookies ? 'Saving Changes...' : 'Save Cookie Configuration'}
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions Panel */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  padding: '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiInfo style={{ color: 'var(--color-accent-primary)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>How to Get Cookies for All Platforms</h3>
                </div>
                {showInstructions ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              <AnimatePresence>
                {showInstructions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', marginTop: '1.25rem' }}
                  >
                    <div style={{
                      fontSize: '0.825rem',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '1rem'
                    }}>
                      <div>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                          Step 1: Install Browser Extension
                        </strong>
                        Install the **Get cookies.txt LOCALLY** extension in your browser:
                        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', listStyleType: 'disc' }}>
                          <li><a href="https://chromewebstore.google.com/detail/get-cookiestxt-locally/ccolpediomjjoihjpdfaeoegidofihcf" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)', textDecoration: 'underline' }}>Chrome Extension</a></li>
                          <li><a href="https://addons.mozilla.org/en-US/firefox/addon/get-cookies-txt/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)', textDecoration: 'underline' }}>Firefox Add-on</a></li>
                        </ul>
                      </div>

                      <div>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                          Step 2: Log into Platforms & Export
                        </strong>
                        Open the desired platforms in separate tabs, make sure you are logged in (you can use secondary/throwaway accounts for privacy), and export their cookies using the extension:
                        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', listStyleType: 'disc' }}>
                          <li><strong>YouTube:</strong> Open youtube.com, click the extension icon, and export.</li>
                          <li><strong>Facebook:</strong> Open facebook.com, click the extension icon, and export.</li>
                          <li><strong>Instagram:</strong> Open instagram.com, click the extension icon, and export.</li>
                          <li><strong>TikTok:</strong> Open tiktok.com, click the extension icon, and export.</li>
                        </ul>
                      </div>

                      <div>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                          Step 3: Combine Cookie Files
                        </strong>
                        Open the exported cookie files in a text editor (like Notepad or VS Code) and concatenate their contents. 
                        Simply copy all lines from each file and paste them together into one single editor pane, making sure comments (lines starting with `#`) or blank lines are skipped or properly aligned.
                        Finally, paste the merged text into the **Cookies Editor** above and click **Save Cookie Configuration**.
                      </div>

                      <div style={{
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '1px dashed var(--color-border)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        marginTop: '0.5rem'
                      }}>
                        <strong style={{ color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          💡 VPS & Production Hosting Tips
                        </strong>
                        <ul style={{ paddingLeft: '1.25rem', listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <li><strong>Persistent Servers (VPS / Docker):</strong> Saving cookies directly from this panel stores them to <code>server/cookies.txt</code> on the disk. They will persist between restarts.</li>
                          <li><strong>Ephemeral Servers (Render / Vercel):</strong> Ephemeral hosts wipe files when they redeploy. To keep them persistent, click **Copy Text** to copy the full merged Netscape text, then go to your Render service dash, navigate to **Environment**, and save it as the value of the environment variable: <code>COOKIES_CONTENT</code>.</li>
                          <li><strong>Cookie Expiration:</strong> Platform cookies periodically expire. When you receive downloading errors (e.g. "Bot challenge detected" or "Sign in required"), export fresh cookies and paste them here.</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
