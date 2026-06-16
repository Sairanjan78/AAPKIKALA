import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, Plus, Edit, Trash2, LayoutDashboard, LogOut, Home, Menu, X, Upload, Image, Camera } from 'lucide-react';

const ArtistDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('inventory');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [profileEdit, setProfileEdit] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
    const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '', stock: 1 });
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);

    const handleProfilePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }

        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('photo', file);
        setProfilePhotoUploading(true);
        try {
            // 1. Upload the file
            const uploadRes = await axios.post('/api/upload/profile-photo', fd, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadRes.data.data.url;

            // 2. Update user profile with the new image URL
            await axios.put('/api/auth/profile', { profileImage: imageUrl }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Update local state
            updateUser({ profileImage: imageUrl });
        } catch (err) {
            console.error('Profile photo upload failed:', err);
            alert('Failed to update profile photo');
        } finally {
            setProfilePhotoUploading(false);
        }
    };

    const CATEGORIES = ['Painting','Sculpture','Pottery','Textile','Jewelry','Woodwork','Metalwork','Paper Art','Mixed Media','Digital Art','Traditional Craft','Home Decor','Fashion','Other'];

    useEffect(() => { fetchMyProducts(); }, []);

    const fetchMyProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data.data.products || res.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleMediaSelect = (files) => {
        const fileArr = Array.from(files).slice(0, 6 - mediaFiles.length);
        const newPreviews = fileArr.map(file => ({ file, url: URL.createObjectURL(file), type: file.type.startsWith('video') ? 'video' : 'image' }));
        setMediaFiles(prev => [...prev, ...fileArr]);
        setMediaPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeMedia = (idx) => {
        URL.revokeObjectURL(mediaPreviews[idx].url);
        setMediaFiles(prev => prev.filter((_, i) => i !== idx));
        setMediaPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const uploadMedia = async () => {
        if (mediaFiles.length === 0) return [];
        const token = localStorage.getItem('token');
        const fd = new FormData();
        mediaFiles.forEach(f => fd.append('media', f));
        setUploading(true);
        try {
            const res = await axios.post('/api/upload', fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
            return res.data.data.map(f => ({ url: f.url, altText: '' }));
        } catch (err) { 
            console.error('Upload Error:', err);
            alert(err.response?.data?.message || err.message || 'Media upload failed'); 
            return []; 
        }
        finally { setUploading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            let images = [];
            if (mediaFiles.length > 0) images = await uploadMedia();
            const payload = { ...formData };
            if (images.length > 0) payload.images = images;
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post('/api/products', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ title: '', description: '', price: '', category: '', stock: 1 });
            setMediaFiles([]);
            setMediaPreviews([]);
            fetchMyProducts();
        } catch { alert('Failed to save product'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this product?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchMyProducts();
        } catch { alert('Failed to delete'); }
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setFormData({ title: p.title, description: p.description, price: p.price, category: p.category, stock: p.stock });
        setShowModal(true);
    };

    const handleLogout = () => { logout(); };

    // ── Guards ─────────────────────────────────────────────────
    if (user?.role !== 'artist' && user?.role !== 'admin') {
        return <div className="container" style={{ paddingTop: 120 }}>Access Denied</div>;
    }

    if (user?.role === 'artist' && user?.artistStatus !== 'approved') {
        const isRejected = user.artistStatus === 'rejected';
        return (
            <div style={{ minHeight: '100vh', background: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '32px', padding: '4rem 3rem', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: isRejected ? 'rgba(231,76,60,0.1)' : 'rgba(241,196,15,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
                        {isRejected ? '✗' : '⏳'}
                    </div>
                    <span style={{ display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: isRejected ? 'rgba(231,76,60,0.1)' : 'rgba(241,196,15,0.15)', color: isRejected ? '#e74c3c' : '#d68910', marginBottom: '1.5rem' }}>
                        {isRejected ? 'Application Rejected' : 'Registration Pending'}
                    </span>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: '#3B2A1A', margin: '0 0 1rem', fontWeight: 700 }}>Welcome, {user.name}</h1>
                    {isRejected ? (
                        <div style={{ textAlign: 'left', lineHeight: 1.6, marginBottom: '2rem' }}>
                            <p>Dear {user.name},</p>
                            <p>Thank you for submitting your profile and work to AAPKIKALA.</p>
                            <p>After careful review, we have decided not to approve your application at this time.</p>
                            <p>We appreciate the effort you put into your submission and wish you success in all your future artistic endeavors.</p>
                            <p style={{ marginTop: '1.5rem', fontWeight: 600 }}>The Kalamandar Team</p>
                        </div>
                    ) : (
                        "Your profile is under review. You'll be able to list artworks once approved."
                    )}
                    <Link to="/" style={{ display: 'inline-block', background: '#C4622D', color: 'white', textDecoration: 'none', padding: '0.9rem 2.5rem', borderRadius: '50px', fontWeight: 700 }}>Back to Home</Link>
                </div>
            </div>
        );
    }

    // ── Tab renderers ──────────────────────────────────────────
    const renderOverview = () => (
        <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', color: '#3B2A1A', marginBottom: '1.5rem' }}>Welcome back, {user.name} 👋</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Products', value: products.length, color: '#C4622D' },
                    { label: 'In Stock', value: products.filter(p => p.stock > 0).length, color: '#27ae60' },
                    { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: '#e74c3c' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.3rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ color: '#3B2A1A', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { setActiveTab('inventory'); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#C4622D', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', cursor: 'pointer', fontWeight: 600 }}>
                        <Plus size={16} /> Add New Product
                    </button>
                    <button onClick={() => setActiveTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5efe0', color: '#3B2A1A', border: '1px solid #ddd', borderRadius: '10px', padding: '0.7rem 1.4rem', cursor: 'pointer', fontWeight: 600 }}>
                        <User size={16} /> Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', color: '#3B2A1A', margin: 0 }}>My Profile</h2>
                <button onClick={() => setProfileEdit(!profileEdit)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: profileEdit ? '#27ae60' : '#C4622D', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600 }}>
                    <Edit size={15} /> {profileEdit ? 'Save' : 'Edit Profile'}
                </button>
            </div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div className="profile-avatar-wrapper" onClick={() => document.getElementById('profile-photo-input').click()}>
                        <input id="profile-photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePhotoChange} />
                        {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-fallback">
                                {user.name[0]}
                            </div>
                        )}
                        <div className="profile-avatar-overlay">
                            {profilePhotoUploading ? (
                                <div className="profile-avatar-spinner"></div>
                            ) : (
                                <Camera size={20} />
                            )}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3B2A1A' }}>{user.name}</div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>{user.email}</div>
                        <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.2rem 0.8rem', borderRadius: '50px', background: 'rgba(39,174,96,0.1)', color: '#27ae60', fontSize: '0.75rem', fontWeight: 700 }}>APPROVED ARTIST</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {[
                        { label: 'Full Name', key: 'name', value: profileForm.name },
                        { label: 'Phone', key: 'phone', value: profileForm.phone },
                        { label: 'Bio', key: 'bio', value: profileForm.bio, textarea: true },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#888', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                            {profileEdit ? (
                                f.textarea
                                    ? <textarea rows={3} value={f.value} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #e0d5c5', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                    : <input value={f.value} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #e0d5c5', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                            ) : (
                                <div style={{ padding: '0.7rem', background: '#faf8f4', borderRadius: '10px', color: f.value ? '#3B2A1A' : '#bbb', fontSize: '0.95rem' }}>{f.value || 'Not set'}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderInventory = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', color: '#3B2A1A', margin: 0 }}>My Products</h2>
                <button onClick={() => { setEditingProduct(null); setFormData({ title: '', description: '', price: '', category: '', stock: 1 }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#C4622D', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <Plus size={16} /> Add Product
                </button>
            </div>
            {loading ? <p style={{ color: '#888' }}>Loading...</p> : (
                <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ background: '#faf8f4' }}>
                                    {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '1rem 1.2rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#bbb' }}>No products yet. Add your first artwork!</td></tr>
                                ) : products.map((p, i) => (
                                    <tr key={p._id} style={{ borderTop: '1px solid #f0ebe2', background: i % 2 === 0 ? 'white' : '#fdfaf6' }}>
                                        <td style={{ padding: '1rem 1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#f0ebe2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} color="#C4622D" /></div>}
                                                <span style={{ fontWeight: 600, color: '#3B2A1A' }}>{p.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.2rem', color: '#666' }}>{p.category}</td>
                                        <td style={{ padding: '1rem 1.2rem', color: '#C4622D', fontWeight: 700 }}>₹{p.price}</td>
                                        <td style={{ padding: '1rem 1.2rem' }}>
                                            <span style={{ padding: '0.25rem 0.7rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, background: p.stock > 0 ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)', color: p.stock > 0 ? '#27ae60' : '#e74c3c' }}>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
                                        </td>
                                        <td style={{ padding: '1rem 1.2rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => openEdit(p)} style={{ background: '#f0ebe2', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#C4622D' }}><Edit size={15} /></button>
                                                <button onClick={() => handleDelete(p._id)} style={{ background: 'rgba(231,76,60,0.08)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    // ── Layout (matches AdminDashboard structure) ──────────────
    return (
        <div className={`admin-layout ${!isSidebarOpen ? 'collapsed' : ''}`}>
            {isSidebarOpen && window.innerWidth <= 1024 && <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2>Artist Studio</h2>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="admin-sidebar-nav">
                    {[
                        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
                        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
                        { id: 'inventory', label: 'My Products', icon: <Package size={20} /> },
                    ].map(item => (
                        <button key={item.id} className={`nav-btn ${activeTab === item.id ? 'active' : ''}`} onClick={() => { setActiveTab(item.id); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <div style={{ marginTop: 'auto', padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
                                {activeTab === 'overview' ? 'Dashboard' : activeTab === 'profile' ? 'My Profile' : 'My Products'}
                            </h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(39,174,96,0.08)', padding: '0.5rem 1rem', borderRadius: '50px', color: '#27ae60', fontWeight: 700, fontSize: '0.85rem' }}>
                        <User size={16} />
                        <span>Approved Artist</span>
                    </div>
                </header>

                <div className="admin-content-inner">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'inventory' && renderInventory()}
                </div>
            </div>

            {/* Add / Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="modal-content">
                        <h3>{editingProduct ? 'Edit Product' : 'Add New Artwork'}</h3>
                        <form onSubmit={handleCreate}>
                            <div>
                                <label>Artwork Title</label>
                                <input type="text" placeholder="e.g. Madhubani Lotus Canvas" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label>Description</label>
                                <textarea placeholder="Describe your artwork, materials used, story behind it..." required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div>
                                    <label>Price (₹)</label>
                                    <input type="number" placeholder="2500" required min="1" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label>Category</label>
                                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="" disabled>Select category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label>Stock Quantity</label>
                                <input type="number" placeholder="1" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                            </div>

                            {/* Media Upload */}
                            <div>
                                <label>Photos & Videos (up to 6)</label>
                                <div
                                    className={`media-dropzone ${dragging ? 'dragging' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={e => { e.preventDefault(); setDragging(false); handleMediaSelect(e.dataTransfer.files); }}
                                    onClick={() => document.getElementById('media-input').click()}
                                >
                                    <input id="media-input" type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e.target.files)} />
                                    <Upload size={28} style={{ color: '#C4622D', marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Drag & drop or <span style={{ color: '#C4622D', fontWeight: 600 }}>browse files</span></p>
                                    <p style={{ margin: '0.3rem 0 0', color: '#bbb', fontSize: '0.78rem' }}>JPG, PNG, GIF, WEBP, MP4 — max 50 MB each</p>
                                </div>
                                {mediaPreviews.length > 0 && (
                                    <div className="media-preview-grid">
                                        {mediaPreviews.map((m, i) => (
                                            <div key={i} className="media-preview-item">
                                                {m.type === 'video' ? <video src={m.url} muted /> : <img src={m.url} alt="" />}
                                                <button type="button" className="remove-media" onClick={() => removeMedia(i)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => { setShowModal(false); setMediaFiles([]); setMediaPreviews([]); }} className="cancel-btn">Cancel</button>
                                <button type="submit" className="add-btn" disabled={uploading}>{uploading ? 'Uploading...' : editingProduct ? 'Save Changes' : 'Publish Artwork'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistDashboard;
