import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Package, User, MapPin, Clock, ChevronRight, LogOut,
    ShoppingBag, Settings, ArrowLeft, CheckCircle, Truck, XCircle, Loader2, Camera
} from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#f39c12', icon: <Clock size={14} /> },
    confirmed: { label: 'Confirmed', color: '#3498db', icon: <CheckCircle size={14} /> },
    processing: { label: 'Processing', color: '#9b59b6', icon: <Loader2 size={14} /> },
    shipped: { label: 'Shipped', color: '#2ecc71', icon: <Truck size={14} /> },
    delivered: { label: 'Delivered', color: '#27ae60', icon: <CheckCircle size={14} /> },
    cancelled: { label: 'Cancelled', color: '#e74c3c', icon: <XCircle size={14} /> },
};

const MyAccount = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [profileForm, setProfileForm] = useState({
        name: '', phone: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [addressForm, setAddressForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        setProfileForm({
            name: user.name || '',
            phone: user.phone || ''
        });
        
        // Migrate legacy location to addresses if needed
        let initialAddresses = user.addresses || [];
        if (initialAddresses.length === 0 && user.location && user.location.city) {
            initialAddresses = [{
                ...user.location,
                label: 'Home',
                isDefault: true,
                _id: 'legacy'
            }];
        }
        setAddresses(initialAddresses);
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'orders' && user) fetchOrders();
    }, [activeTab, user]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.data?.orders || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('/api/auth/profile', {
                name: profileForm.name,
                phone: profileForm.phone,
                addresses: addresses
            }, { headers: { Authorization: `Bearer ${token}` } });

            updateUser(res.data.data);
            setSaveMsg('Profile updated successfully!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (err) {
            setSaveMsg('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

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
            const uploadRes = await axios.post('/api/upload/profile-photo', fd, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadRes.data.data.url;

            await axios.put('/api/auth/profile', { profileImage: imageUrl }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateUser({ profileImage: imageUrl });
        } catch (err) {
            console.error('Profile photo upload failed:', err);
            alert('Failed to update profile photo');
        } finally {
            setProfilePhotoUploading(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (res.data && res.data.address) {
                    const addr = res.data.address;
                    const street = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(', ');
                    const city = addr.city || addr.town || addr.county || '';
                    
                    setAddressForm(prev => prev ? {
                        ...prev,
                        street: street || prev.street,
                        city: city || prev.city,
                        state: addr.state || prev.state,
                        pincode: addr.postcode || prev.pincode
                    } : null);
                }
            } catch (err) {
                console.error('Error fetching location', err);
                alert('Failed to get address from current location');
            } finally {
                setLocating(false);
            }
        }, (err) => {
            setLocating(false);
            alert('Unable to retrieve your location');
        });
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/orders/${orderId}/cancel`, { reason: 'Customer requested' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    if (!user) return null;

    const tabs = [
        { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className="myaccount-page">
            <div className="cart-hero">
                <div className="container">
                    <span className="section-tag" style={{ color: '#D4A017' }}>My Account</span>
                    <h1>Welcome, {user.name?.split(' ')[0]}</h1>
                </div>
            </div>

            <div className="container myaccount-layout">
                {/* Sidebar */}
                <div className="myaccount-sidebar">
                    <div className="myaccount-user-card">
                        <div className="profile-avatar-wrapper" onClick={() => document.getElementById('profile-photo-input').click()} style={{ width: '60px', height: '60px', fontSize: '1.5rem', marginBottom: 0 }}>
                            <input id="profile-photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePhotoChange} />
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="" className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-fallback">
                                    {user.name?.[0] || '?'}
                                </div>
                            )}
                            <div className="profile-avatar-overlay">
                                {profilePhotoUploading ? (
                                    <div className="profile-avatar-spinner"></div>
                                ) : (
                                    <Camera size={16} />
                                )}
                            </div>
                        </div>
                        <div>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <nav className="myaccount-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`myaccount-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon} {tab.label} <ChevronRight size={14} className="nav-chevron" />
                            </button>
                        ))}
                        <button className="myaccount-nav-btn logout-nav" onClick={logout}>
                            <LogOut size={18} /> Logout
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="myaccount-content">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="myaccount-orders">
                            <h2>My Orders</h2>
                            {loadingOrders ? (
                                <div className="myaccount-loading">
                                    <Loader2 size={32} className="spin-icon" />
                                    <p>Loading orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="myaccount-empty">
                                    <ShoppingBag size={48} strokeWidth={1} />
                                    <h3>No orders yet</h3>
                                    <p>Your order history will appear here after your first purchase.</p>
                                    <Link to="/products" className="myaccount-btn myaccount-btn-primary">Start Shopping</Link>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map(order => {
                                        const st = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                                        return (
                                            <div key={order._id} className="order-card">
                                                <div className="order-card-top">
                                                    <div>
                                                        <span className="order-id">#{order.orderId}</span>
                                                        <span className="order-date">
                                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <span className="order-status-badge" style={{ background: `${st.color}15`, color: st.color }}>
                                                        {st.icon} {st.label}
                                                    </span>
                                                </div>

                                                <div className="order-items-preview">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="order-item-mini">
                                                            {item.image ? (
                                                                <img src={item.image} alt="" />
                                                            ) : (
                                                                <div className="order-item-mini-ph"><Package size={14} /></div>
                                                            )}
                                                            <div>
                                                                <span>{item.title}</span>
                                                                <span className="order-item-qty">×{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="order-card-bottom">
                                                    <span className="order-total">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                                    {['pending', 'confirmed'].includes(order.orderStatus) && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order._id)}
                                                            className="myaccount-btn myaccount-btn-danger order-cancel-btn"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="myaccount-profile">
                            <div className="myaccount-profile-header">
                                <h2>Edit Profile</h2>
                            </div>
                            {saveMsg && (
                                <p className={`profile-msg ${saveMsg.includes('success') ? 'success' : 'error'}`}>
                                    {saveMsg}
                                </p>
                            )}
                            <form onSubmit={handleProfileSave} className="profile-form">
                                <div className="checkout-form-grid">
                                    <div className="checkout-field">
                                        <label>Full Name</label>
                                        <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div className="checkout-field">
                                        <label>Phone</label>
                                        <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                                    </div>
                                </div>
                                <button type="submit" disabled={saving} className="myaccount-btn myaccount-btn-primary profile-save-btn">
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>

                            <div className="address-book-section">
                                <div className="address-book-header">
                                    <h2>Address Book</h2>
                                    {!addressForm && (
                                        <button onClick={() => setAddressForm({ street: '', city: '', state: '', pincode: '', label: 'Home', isDefault: addresses.length === 0 })} className="myaccount-btn myaccount-btn-primary add-address-btn">
                                            + Add New Address
                                        </button>
                                    )}
                                </div>

                                {addressForm ? (
                                    <div className="address-form-card">
                                        <div className="address-form-header">
                                            <h4>{addressForm.index !== undefined ? 'Edit Address' : 'Add New Address'}</h4>
                                            <button type="button" onClick={handleUseCurrentLocation} disabled={locating} className="myaccount-btn myaccount-btn-secondary address-gps-btn">
                                                <MapPin size={16} /> {locating ? 'Locating...' : 'Use GPS'}
                                            </button>
                                        </div>
                                        <div className="checkout-form-grid">
                                            <div className="checkout-field">
                                                <label>Label</label>
                                                <select value={addressForm.label} onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))} className="address-select">
                                                    <option value="Home">Home</option>
                                                    <option value="Work">Work</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="checkout-field">
                                                <label>Pincode (6 digits)</label>
                                                <input pattern="\d{6}" title="Please enter exactly 6 digits" required value={addressForm.pincode} onChange={e => setAddressForm(p => ({ ...p, pincode: e.target.value }))} placeholder="e.g. 756032" className="address-input" />
                                            </div>
                                        </div>
                                        <div className="checkout-field">
                                            <label>Street Address (Must include House/Building No.)</label>
                                            <input 
                                                required 
                                                pattern=".*[0-9].*" 
                                                title="Address must contain a house or building number"
                                                value={addressForm.street} 
                                                onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))} 
                                                placeholder="e.g. Plot No 42, Main Street" 
                                                className="address-input"
                                            />
                                        </div>
                                        <div className="checkout-form-grid">
                                            <div className="checkout-field">
                                                <label>City</label>
                                                <input required value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} className="address-input" />
                                            </div>
                                            <div className="checkout-field">
                                                <label>State</label>
                                                <input required value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} className="address-input" />
                                            </div>
                                        </div>
                                        <div className="address-default-checkbox-wrapper">
                                            <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))} className="address-checkbox" />
                                            <label htmlFor="isDefault">Set as my Default Address</label>
                                        </div>
                                        <div className="address-form-actions">
                                            <button 
                                                onClick={() => {
                                                    let newAddresses = [...addresses];
                                                    if (addressForm.isDefault) {
                                                        newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
                                                    }
                                                    if (addressForm.index !== undefined) {
                                                        newAddresses[addressForm.index] = addressForm;
                                                    } else {
                                                        newAddresses.push(addressForm);
                                                    }
                                                    setAddresses(newAddresses);
                                                    setAddressForm(null);
                                                }}
                                                className="myaccount-btn myaccount-btn-primary address-save-btn"
                                            >
                                                Save Address
                                            </button>
                                            <button onClick={() => setAddressForm(null)} className="myaccount-btn myaccount-btn-outline address-cancel-btn">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="addresses-list">
                                        {addresses.map((addr, idx) => (
                                            <div key={idx} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                                                {addr.isDefault && <span className="address-badge-default">Default</span>}
                                                <span className="address-label">{addr.label}</span>
                                                <p className="address-street"><strong>{addr.street}</strong></p>
                                                <p className="address-details">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                <div className="address-card-actions">
                                                    <button onClick={() => setAddressForm({ ...addr, index: idx })} className="address-btn-edit">Edit</button>
                                                    <button onClick={() => setAddresses(addresses.filter((_, i) => i !== idx))} className="address-btn-delete">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                        {addresses.length === 0 && <p>No addresses saved yet.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="myaccount-settings">
                            <h2>Settings</h2>
                            <div className="settings-card">
                                <h4>Account Type</h4>
                                <p>You are logged in as a <strong>{user.role === 'artist' ? 'Artist' : 'Customer'}</strong>.</p>
                                {user.role === 'artist' && (
                                    <Link to="/dashboard" className="myaccount-btn myaccount-btn-primary" style={{ marginTop: '1rem' }}>
                                        Go to Artist Dashboard
                                    </Link>
                                )}
                            </div>
                            <div className="settings-card danger-zone">
                                <h4>Danger Zone</h4>
                                <p>Logging out will clear your session. Your cart items will be preserved.</p>
                                <button onClick={logout} className="myaccount-btn myaccount-btn-danger settings-logout-btn">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAccount;
