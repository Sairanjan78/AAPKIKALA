import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Users, 
    IndianRupee, 
    TrendingUp, 
    ShieldCheck, 
    Package,
    Search,
    Menu,
    X,
    LayoutDashboard,
    Settings,
    LogOut,
    Home,
    MessageSquare,
    Trash2,
    Eye,
    Mail,
    Plus,
    Edit3,
    Download,
    Megaphone
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        activeArtists: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({ price: 0, stock: 0 });
    const [allMessages, setAllMessages] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', id: null });
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!authLoading && user?.role === 'admin') {
            if (activeTab === 'dashboard') fetchAdminData();
            if (activeTab === 'users') fetchAllUsers();
            if (activeTab === 'products') fetchAllProducts();
            fetchAllMessages(); // Always fetch to keep the sidebar badge updated
        }
    }, [authLoading, user, activeTab]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const dashboardData = res.data.data;
            
            setStats({
                totalUsers: dashboardData.stats.totalUsers,
                totalProducts: dashboardData.stats.totalProducts,
                totalRevenue: dashboardData.stats.totalRevenue,
                activeArtists: dashboardData.stats.activeArtists
            });

            const formattedUsers = dashboardData.recentUsers.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
                joined: new Date(u.createdAt).toLocaleDateString()
            }));

            setRecentUsers(formattedUsers);
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllUsers(res.data.data);
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllProducts(res.data.data || []);
        } catch (err) {
            console.error('Fetch products error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/messages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllMessages(res.data.data || []);
        } catch (err) {
            console.error('Fetch messages error:', err);
        }
    };

    const handleExportReport = () => {
        const reportData = [
            ["Metric", "Value"],
            ["Total Users", stats.totalUsers],
            ["Artworks Listed", stats.totalProducts],
            ["Total Revenue", `INR ${stats.totalRevenue}`],
            ["Active Artists", stats.activeArtists],
            ["Generated At", new Date().toLocaleString()]
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + reportData.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AAPKIKALA_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBroadcast = () => {
        setIsBroadcastModalOpen(true);
    };

    const sendBroadcast = () => {
        if (!broadcastMsg.trim()) return;
        // Mock send logic
        alert("Broadcast sent successfully to all users!");
        setIsBroadcastModalOpen(false);
        setBroadcastMsg('');
    };

    const handleUpdateMessageStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/messages/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllMessages();
        } catch (err) {
            alert('Failed to update message status');
        }
    };

    const handleDeleteMessage = (id) => {
        setDeleteModal({ isOpen: true, type: 'message', id });
    };

    const handleUpdateStatus = async (userId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/admin/update-status', { userId, status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllUsers(); // Refresh list
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDeleteUser = (userId) => {
        setDeleteModal({ isOpen: true, type: 'user', id: userId });
    };

    const executeDelete = async () => {
        const { type, id } = deleteModal;
        if (!id) return;
        
        try {
            const token = localStorage.getItem('token');
            if (type === 'message') {
                await axios.delete(`/api/messages/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchAllMessages();
            } else if (type === 'user') {
                await axios.delete(`/api/admin/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchAllUsers();
            }
            setDeleteModal({ isOpen: false, type: '', id: null });
        } catch (err) {
            alert(`Failed to delete ${type}`);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setEditForm({ price: product.price, stock: product.stock });
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/product/${editingProduct._id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingProduct(null);
            fetchAllProducts();
        } catch (err) {
            alert('Failed to update product');
        }
    };

    if (authLoading) {
        return (
            <div className="container" style={{padding: '150px 0', textAlign: 'center'}}>
                <div className="loading-spinner" style={{margin: '0 auto'}}></div>
                <p style={{marginTop: '1rem'}}>Verifying admin credentials...</p>
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
                <ShieldCheck size={64} color="#e74c3c" />
                <h2>Access Denied</h2>
                <p>Administrative privileges required.</p>
            </div>
        );
    }

    const renderDashboard = () => (
        <>
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-icon-w users"><Users size={24} /></div>
                    <div className="stat-info-w">
                        <span className="label">Total Users</span>
                        <h3>{stats.totalUsers}</h3>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon-w products"><Package size={24} /></div>
                    <div className="stat-info-w">
                        <span className="label">Artworks Listed</span>
                        <h3>{stats.totalProducts}</h3>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon-w revenue"><IndianRupee size={24} /></div>
                    <div className="stat-info-w">
                        <span className="label">Total Revenue</span>
                        <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon-w growth"><TrendingUp size={24} /></div>
                    <div className="stat-info-w">
                        <span className="label">Active Artists</span>
                        <h3>{stats.activeArtists}</h3>
                    </div>
                </div>
            </div>

            <div className="admin-content-layout">
                <section className="recent-activity-section">
                    <div className="section-header">
                        <h2>Recent Registrations</h2>
                        <button className="view-all-admin" onClick={() => setActiveTab('users')}>View All</button>
                    </div>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="avatar-small">{u.name[0]}</div>
                                                <div>
                                                    <strong>{u.name}</strong>
                                                    <br/>
                                                    <small>{u.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                                        <td><span className="status-dot active">Active</span></td>
                                        <td>{u.joined}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <aside className="admin-sidebar-info">
                    <div className="info-card">
                        <h3>System Health</h3>
                        <div className="health-stat">
                            <span>Server Status</span>
                            <span className="health-good">Excellent</span>
                        </div>
                        <div className="health-stat">
                            <span>DB Connection</span>
                            <span className="health-good">Stable</span>
                        </div>
                        <div className="health-stat">
                            <span>Cloudinary Sync</span>
                            <span className="health-good">Up to date</span>
                        </div>
                    </div>
                    
                    <div className="action-card" style={{background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'}}>
                        <h3 style={{fontSize: '1.1rem', color: '#2c3e50', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <TrendingUp size={18} color="var(--clay)" /> System Quick Actions
                        </h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <button 
                                onClick={handleExportReport}
                                style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.8rem', 
                                    width: '100%', 
                                    padding: '1rem', 
                                    background: '#f8f9fa', 
                                    border: '1px solid #eee', 
                                    borderRadius: '12px', 
                                    color: '#2c3e50', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#fdf5f0'; e.currentTarget.style.borderColor = 'var(--clay)'; e.currentTarget.style.color = 'var(--clay)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.color = '#2c3e50'; }}
                            >
                                <div style={{background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}><Download size={18} /></div>
                                Export Data Report
                            </button>
                            
                            <button 
                                onClick={handleBroadcast}
                                style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.8rem', 
                                    width: '100%', 
                                    padding: '1rem', 
                                    background: 'linear-gradient(135deg, var(--clay), #8b5a33)', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    color: 'white', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(166, 123, 91, 0.2)'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(166, 123, 91, 0.3)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(166, 123, 91, 0.2)'; }}
                            >
                                <div style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px'}}><Megaphone size={18} /></div>
                                Broadcast Message
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );

    const renderUsers = () => (
        <section className="recent-activity-section" style={{maxWidth: '100%'}}>
            <div className="section-header">
                <h2>User Management</h2>
                <div className="search-bar-inline" style={{display: 'flex', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '10px', gap: '0.8rem'}}>
                    <Search size={18} color="#888" />
                    <input type="text" placeholder="Search by name or email..." style={{border: 'none', background: 'transparent', outline: 'none', width: '250px'}} />
                </div>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map(u => (
                            <tr key={u._id}>
                                <td>
                                    <div className="admin-user-cell">
                                        <div className="avatar-small" style={{background: u.role === 'admin' ? '#aa3bff' : u.role === 'artist' ? '#C4622D' : '#3B2A1A'}}>{u.name[0]}</div>
                                        <div>
                                            <strong>{u.name}</strong>
                                            <br/>
                                            <small>{u.email}</small>
                                        </div>
                                    </div>
                                </td>
                                <td><span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span></td>
                                <td>
                                    {u.role === 'artist' ? (
                                        <span className={`status-pill ${u.artistStatus}`}>
                                            {u.artistStatus.toUpperCase()}
                                        </span>
                                    ) : (
                                        <span className="status-pill none">N/A</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                        {/* Pending artist: show Approve + Reject */}
                                        {u.role === 'artist' && u.artistStatus === 'pending' && (
                                            <>
                                                <button
                                                    className="view-all-admin"
                                                    style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#27ae60', color: 'white', borderColor: '#27ae60'}}
                                                    onClick={() => handleUpdateStatus(u._id, 'approved')}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    className="view-all-admin"
                                                    style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#e74c3c', color: 'white', borderColor: '#e74c3c'}}
                                                    onClick={() => handleUpdateStatus(u._id, 'rejected')}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </>
                                        )}
                                        {/* Approved artist: show Remove only */}
                                        {u.role === 'artist' && u.artistStatus === 'approved' && (
                                            <button
                                                className="view-all-admin"
                                                style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#e74c3c', color: 'white', borderColor: '#e74c3c'}}
                                                onClick={() => handleDeleteUser(u._id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                        {/* Customer: show Remove */}
                                        {u.role === 'customer' && (
                                            <button
                                                className="view-all-admin"
                                                style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#e74c3c', color: 'white', borderColor: '#e74c3c'}}
                                                onClick={() => handleDeleteUser(u._id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                        {/* Admin: no actions */}
                                        {u.role === 'admin' && (
                                            <span style={{fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic'}}>Protected</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    const renderProducts = () => (
        <section className="recent-activity-section" style={{maxWidth: '100%', background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)'}}>
            <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.3rem'}}>
                    <h2 style={{margin: 0, fontSize: '1.6rem', color: '#2c3e50'}}>Product Inventory</h2>
                    <span style={{color: '#7f8c8d', fontSize: '0.9rem'}}>Manage your marketplace catalog</span>
                </div>
                <button 
                    className="admin-action-btn" 
                    style={{
                        padding: '0.8rem 1.5rem', 
                        background: 'linear-gradient(135deg, var(--clay), #8b5a33)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontWeight: '600', 
                        boxShadow: '0 4px 15px rgba(166, 123, 91, 0.3)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(166, 123, 91, 0.4)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(166, 123, 91, 0.3)'; }}
                >
                    <Plus size={18} /> Add New Product
                </button>
            </div>
            <div className="admin-table-container" style={{overflowX: 'auto'}}>
                <table className="admin-table" style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem'}}>
                    <thead>
                        <tr>
                            <th style={{padding: '1rem', color: '#95a5a6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f0f0f0', textAlign: 'left'}}>Artwork</th>
                            <th style={{padding: '1rem', color: '#95a5a6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f0f0f0', textAlign: 'left'}}>Category</th>
                            <th style={{padding: '1rem', color: '#95a5a6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f0f0f0', textAlign: 'left'}}>Price</th>
                            <th style={{padding: '1rem', color: '#95a5a6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f0f0f0', textAlign: 'left'}}>Stock Status</th>
                            <th style={{padding: '1rem', color: '#95a5a6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f0f0f0', textAlign: 'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allProducts.map(p => (
                            <tr key={p._id} style={{background: '#fff', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'}}>
                                <td style={{padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', borderTop: '1px solid #f8f9fa', borderBottom: '1px solid #f8f9fa', borderLeft: '1px solid #f8f9fa'}}>
                                    <div className="admin-user-cell" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                        <img src={p.images?.[0]?.url || ''} alt="" style={{width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}} />
                                        <strong style={{color: '#2c3e50', fontSize: '0.95rem'}}>{p.title}</strong>
                                    </div>
                                </td>
                                <td style={{padding: '1rem', color: '#555', borderTop: '1px solid #f8f9fa', borderBottom: '1px solid #f8f9fa'}}>
                                    <span style={{background: '#f8f9fa', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', color: '#666', border: '1px solid #eee'}}>{p.category}</span>
                                </td>
                                <td style={{padding: '1rem', fontWeight: '600', color: '#2c3e50', borderTop: '1px solid #f8f9fa', borderBottom: '1px solid #f8f9fa'}}>₹{p.price.toLocaleString()}</td>
                                <td style={{padding: '1rem', borderTop: '1px solid #f8f9fa', borderBottom: '1px solid #f8f9fa'}}>
                                    {p.stock > 10 ? (
                                        <span style={{display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '20px', background: '#e8f8f5', color: '#1abc9c', fontSize: '0.8rem', fontWeight: '600'}}>In Stock ({p.stock})</span>
                                    ) : p.stock > 0 ? (
                                        <span style={{display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '20px', background: '#fef5e7', color: '#f39c12', fontSize: '0.8rem', fontWeight: '600'}}>Low Stock ({p.stock})</span>
                                    ) : (
                                        <span style={{display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '20px', background: '#fdedec', color: '#e74c3c', fontSize: '0.8rem', fontWeight: '600'}}>Out of Stock</span>
                                    )}
                                </td>
                                <td style={{padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', borderTop: '1px solid #f8f9fa', borderBottom: '1px solid #f8f9fa', borderRight: '1px solid #f8f9fa', textAlign: 'right'}}>
                                    <button 
                                        className="view-all-admin" 
                                        style={{padding: '0.5rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', color: '#2c3e50', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'}} 
                                        onClick={() => handleEditClick(p)}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--clay)'; e.currentTarget.style.color = 'white'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#2c3e50'; }}
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '400px'}}>
                        <div className="modal-header">
                            <h3>Edit: {editingProduct.title}</h3>
                            <button className="close-btn" onClick={() => setEditingProduct(null)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdateProduct} style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
                            <div>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>Price (₹)</label>
                                <input 
                                    type="number" 
                                    value={editForm.price} 
                                    onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} 
                                    style={{width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px'}}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>Stock</label>
                                <input 
                                    type="number" 
                                    value={editForm.stock} 
                                    onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})} 
                                    style={{width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px'}}
                                />
                            </div>
                            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                                <button type="button" onClick={() => setEditingProduct(null)} style={{flex: 1, padding: '0.8rem', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>Cancel</button>
                                <button type="submit" style={{flex: 1, padding: '0.8rem', background: 'var(--clay)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );

    const renderMessages = () => (
        <div className="admin-table-container">
            <div className="section-header">
                <h2>Customer Inquiries</h2>
                <button className="view-all-admin" onClick={fetchAllMessages}>Refresh</button>
            </div>
            <div className="messages-grid" style={{display: 'grid', gap: '1.5rem', marginTop: '1.5rem'}}>
                {allMessages.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '12px'}}>
                        <p style={{color: '#666'}}>No messages found.</p>
                    </div>
                ) : (
                    allMessages.map(msg => (
                        <div key={msg._id} className={`message-card ${msg.status}`} style={{
                            background: 'white', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            borderLeft: msg.status === 'new' ? '4px solid var(--clay)' : '4px solid #ddd',
                            position: 'relative'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                                <div>
                                    <h4 style={{margin: 0, fontSize: '1.1rem'}}>{msg.name}</h4>
                                    <p style={{margin: '0.2rem 0', color: '#666', fontSize: '0.9rem'}}>{msg.email}</p>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{
                                        fontSize: '0.75rem', 
                                        padding: '0.3rem 0.6rem', 
                                        borderRadius: '20px',
                                        background: msg.status === 'new' ? '#fff4ed' : '#f0f0f0',
                                        color: msg.status === 'new' ? 'var(--clay)' : '#666',
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>
                                        {msg.status}
                                    </span>
                                    <p style={{margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#999'}}>
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                background: '#f9f9f9', 
                                padding: '1rem', 
                                borderRadius: '12px', 
                                fontSize: '0.95rem',
                                lineHeight: 1.6,
                                marginBottom: '1rem'
                            }}>
                                {msg.message}
                            </div>
                            <div style={{display: 'flex', gap: '0.8rem', justifyContent: 'flex-end'}}>
                                {msg.status === 'new' && (
                                    <button 
                                        onClick={() => handleUpdateMessageStatus(msg._id, 'read')}
                                        style={{padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'}}
                                    >
                                        <Eye size={16} /> Mark as Read
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDeleteMessage(msg._id)}
                                    style={{padding: '0.5rem 1rem', border: '1px solid #ffeded', borderRadius: '8px', background: '#fff5f5', color: '#e74c3c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'}}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                                <a 
                                    href={`mailto:${msg.email}?subject=Reply from AAPKIKALA`}
                                    style={{padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', background: 'var(--clay)', color: 'white', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}
                                >
                                    <Mail size={16} /> Reply
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderSettings = () => (
        <section className="recent-activity-section" style={{maxWidth: '800px', margin: '0 auto', background: 'transparent', boxShadow: 'none'}}>
            <div className="section-header" style={{marginBottom: '2rem'}}>
                <h2 style={{margin: 0, fontSize: '1.8rem', color: '#2c3e50', letterSpacing: '-0.5px'}}>Platform Settings</h2>
                <p style={{color: '#7f8c8d', fontSize: '0.95rem', margin: '0.5rem 0 0'}}>Manage your store configurations and admin profile</p>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                {/* Profile Settings Card */}
                <div style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0'}}>
                    <h3 style={{margin: '0 0 1.5rem', fontSize: '1.2rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{width: '32px', height: '32px', borderRadius: '8px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Settings size={18} color="var(--clay)"/></div>
                        Admin Profile
                    </h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem'}}>
                        <div>
                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#7f8c8d', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Full Name</label>
                            <input type="text" defaultValue={user?.name || "System Admin"} style={{width: '100%', boxSizing: 'border-box', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '1rem', background: '#fcfcfc', color: '#2c3e50', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'}} />
                        </div>
                        <div>
                            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#7f8c8d', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email Address</label>
                            <input type="email" defaultValue={user?.email || "admin@aapkikala.com"} style={{width: '100%', boxSizing: 'border-box', padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '1rem', background: '#fcfcfc', color: '#2c3e50', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'}} />
                        </div>
                    </div>
                </div>

                {/* Store Preferences Card */}
                <div style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0'}}>
                    <h3 style={{margin: '0 0 1.5rem', fontSize: '1.2rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{width: '32px', height: '32px', borderRadius: '8px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Package size={18} color="var(--clay)"/></div>
                        Store Preferences
                    </h3>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0'}}>
                            <div>
                                <h4 style={{margin: '0 0 0.3rem', color: '#2c3e50', fontSize: '1.05rem'}}>Artist Registrations</h4>
                                <p style={{margin: 0, color: '#7f8c8d', fontSize: '0.85rem'}}>Allow new artists to apply to sell on the platform</p>
                            </div>
                            <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '28px'}}>
                                <input type="checkbox" defaultChecked style={{opacity: 0, width: 0, height: 0}} />
                                <span style={{position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#2ecc71', transition: '.4s', borderRadius: '34px'}} className="slider-toggle"></span>
                                <span style={{position: 'absolute', content: '""', height: '20px', width: '20px', left: '26px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'}}></span>
                            </label>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <h4 style={{margin: '0 0 0.3rem', color: '#2c3e50', fontSize: '1.05rem'}}>Maintenance Mode</h4>
                                <p style={{margin: 0, color: '#7f8c8d', fontSize: '0.85rem'}}>Temporarily disable the storefront for updates</p>
                            </div>
                            <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '28px'}}>
                                <input type="checkbox" style={{opacity: 0, width: 0, height: 0}} />
                                <span style={{position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ccc', transition: '.4s', borderRadius: '34px'}} className="slider-toggle"></span>
                                <span style={{position: 'absolute', content: '""', height: '20px', width: '20px', left: '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'}}></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                    <button 
                        style={{
                            padding: '1rem 2.5rem', 
                            background: 'linear-gradient(135deg, var(--clay), #8b5a33)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontSize: '1rem',
                            fontWeight: '600', 
                            boxShadow: '0 8px 20px rgba(166, 123, 91, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(166, 123, 91, 0.4)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(166, 123, 91, 0.3)'; }}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </section>
    );

    const renderBroadcastModal = () => (
        <div className="modal-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)'}}>
            <div className="modal-content" style={{background: 'white', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                        <div style={{width: '40px', height: '40px', borderRadius: '10px', background: '#fff4ed', color: 'var(--clay)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Megaphone size={20} />
                        </div>
                        <div>
                            <h3 style={{margin: 0, fontSize: '1.2rem', color: '#2c3e50'}}>Broadcast Message</h3>
                            <p style={{margin: 0, fontSize: '0.8rem', color: '#95a5a6'}}>Send a notification to all marketplace users</p>
                        </div>
                    </div>
                    <button onClick={() => setIsBroadcastModalOpen(false)} style={{background: 'none', border: 'none', color: '#bdc3c7', cursor: 'pointer'}}><X size={24} /></button>
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Message Content</label>
                    <textarea 
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        placeholder="Type your announcement here..." 
                        style={{
                            width: '100%', 
                            height: '150px', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            border: '1.5px solid #eee', 
                            fontSize: '1rem', 
                            fontFamily: 'inherit', 
                            resize: 'none',
                            boxSizing: 'border-box'
                        }}
                    ></textarea>
                    <div style={{textAlign: 'right', marginTop: '0.5rem', fontSize: '0.8rem', color: '#bdc3c7'}}>
                        {broadcastMsg.length} characters
                    </div>
                </div>

                <div style={{display: 'flex', gap: '1rem'}}>
                    <button 
                        onClick={() => setIsBroadcastModalOpen(false)} 
                        style={{flex: 1, padding: '0.8rem', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={sendBroadcast}
                        disabled={!broadcastMsg.trim()}
                        style={{
                            flex: 1.5, 
                            padding: '0.8rem', 
                            background: broadcastMsg.trim() ? 'linear-gradient(135deg, var(--clay), #8b5a33)' : '#ccc', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: broadcastMsg.trim() ? 'pointer' : 'not-allowed', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Send Broadcast <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`admin-layout ${!isSidebarOpen ? 'collapsed' : ''}`}>
            {isSidebarOpen && window.innerWidth <= 1024 && <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2>Admin Panel</h2>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="admin-sidebar-nav">
                    <button 
                        className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} /> Manage Users
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={20} /> Products
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        <MessageSquare size={20} /> Messages
                        {allMessages.filter(m => m.status === 'new').length > 0 && (
                            <span className="badge-new">{allMessages.filter(m => m.status === 'new').length}</span>
                        )}
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Settings
                    </button>
                </nav>
                <div className="admin-sidebar-footer" style={{ marginTop: 'auto', padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <Link to="/" className="nav-btn" style={{ textDecoration: 'none' }}><Home size={20} /> Storefront</Link>
                    <button className="nav-btn" onClick={handleLogout} style={{ color: '#e74c3c' }}><LogOut size={20} /> Logout</button>
                </div>
            </aside>

            <div className="admin-main-content">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu size={28} />
                        </button>
                        <div>
                            <h1 className="topbar-title">
                                {activeTab === 'dashboard' ? 'Command Center' : 
                                 activeTab === 'users' ? 'User Management' : 
                                 activeTab === 'products' ? 'Inventory' : 
                                 activeTab === 'settings' ? 'Platform Settings' : 'Inquiries'}
                            </h1>
                        </div>
                    </div>
                    <div className="admin-badge">
                        <ShieldCheck size={18} />
                        <span>Admin Verified</span>
                    </div>
                </header>

                <div className="admin-content-inner">
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '100px 0'}}>
                            <div className="loading-spinner" style={{margin: '0 auto'}}></div>
                            <p>Loading {activeTab}...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'products' && renderProducts()}
                            {activeTab === 'messages' && renderMessages()}
                            {activeTab === 'settings' && renderSettings()}
                        </>
                    )}
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="modal-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)'}}>
                    <div className="modal-content" style={{background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center'}}>
                        <div style={{width: '60px', height: '60px', borderRadius: '50%', background: '#fff5f5', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
                            <Trash2 size={30} />
                        </div>
                        <h3 style={{margin: '0 0 0.5rem', color: '#333', fontSize: '1.4rem'}}>Confirm Deletion</h3>
                        <p style={{margin: '0 0 2rem', color: '#666', fontSize: '0.95rem'}}>
                            Are you sure you want to delete this {deleteModal.type}? This action cannot be undone.
                        </p>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button 
                                onClick={() => setDeleteModal({ isOpen: false, type: '', id: null })} 
                                style={{flex: 1, padding: '0.8rem', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeDelete} 
                                style={{flex: 1, padding: '0.8rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                            >
                                Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Broadcast Modal */}
            {isBroadcastModalOpen && renderBroadcastModal()}
        </div>
    );
};

export default AdminDashboard;
