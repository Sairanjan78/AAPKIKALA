import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';

const Checkout = () => {
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=address, 2=review, 3=confirmed
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');

    const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0] || user?.location || {};

    const [address, setAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: defaultAddr.street || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        pincode: defaultAddr.pincode || defaultAddr.postcode || '',
        country: 'India'
    });

    const shipping = 100;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    if (!user) {
        return (
            <div className="checkout-page">
                <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3B2A1A' }}>Please log in to checkout</h2>
                    <p style={{ color: '#888', margin: '1rem 0 2rem' }}>You need an account to place orders.</p>
                    <Link to="/login" className="cart-checkout-btn" style={{ display: 'inline-flex' }}>Go to Login</Link>
                </div>
            </div>
        );
    }

    if (items.length === 0 && step !== 3) {
        navigate('/cart');
        return null;
    }

    const handleAddressChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
            setError('Please fill all required fields');
            return;
        }
        setError('');
        setStep(2);
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
                    
                    setAddress(prev => ({
                        ...prev,
                        street: street || prev.street,
                        city: city || prev.city,
                        state: addr.state || prev.state,
                        pincode: addr.postcode || prev.pincode
                    }));
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

    const placeOrder = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/orders', {
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                shippingAddress: address,
                paymentMethod: 'cod'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrderId(res.data.data.orderId);
            clearCart();
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Order Confirmed
    if (step === 3) {
        return (
            <div className="checkout-page">
                <div className="container checkout-confirmed">
                    <div className="confirmed-card">
                        <div className="confirmed-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1>Order Placed!</h1>
                        <p className="confirmed-order-id">Order ID: <strong>{orderId}</strong></p>
                        <p>Thank you for your purchase! Your order has been placed successfully. Our artisans will start preparing your items.</p>
                        <div className="confirmed-actions">
                            <Link to="/my-account" className="cart-checkout-btn">View My Orders</Link>
                            <Link to="/products" className="cart-back-link" style={{ justifyContent: 'center' }}>Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="cart-hero">
                <div className="container">
                    <span className="section-tag" style={{ color: '#D4A017' }}>Checkout</span>
                    <h1>Complete Your Order</h1>
                </div>
            </div>

            <div className="container checkout-layout">
                {/* Progress Steps */}
                <div className="checkout-progress">
                    <div className={`checkout-step-ind ${step >= 1 ? 'active' : ''}`}>
                        <MapPin size={18} /> <span>Address</span>
                    </div>
                    <div className="checkout-step-line"></div>
                    <div className={`checkout-step-ind ${step >= 2 ? 'active' : ''}`}>
                        <CreditCard size={18} /> <span>Review & Pay</span>
                    </div>
                    <div className="checkout-step-line"></div>
                    <div className={`checkout-step-ind ${step >= 3 ? 'active' : ''}`}>
                        <Truck size={18} /> <span>Confirmed</span>
                    </div>
                </div>

                <div className="checkout-body">
                    {/* Left: Form */}
                    <div className="checkout-form-section">
                        {step === 1 && (
                            <form onSubmit={handleAddressSubmit} className="checkout-form">
                                <div className="checkout-form-header">
                                    <h3>Shipping Address</h3>
                                    <button type="button" onClick={handleUseCurrentLocation} disabled={locating} className="checkout-location-btn">
                                        <MapPin size={14} /> {locating ? 'Locating...' : 'Use Current Location'}
                                    </button>
                                </div>
                                {error && <p className="checkout-error">{error}</p>}
                                
                                {user?.addresses?.length > 0 && (
                                    <div className="checkout-field" style={{ marginBottom: '1.5rem', padding: '1.2rem', background: '#faf9f5', borderRadius: '12px', border: '1px solid #e8e0d4' }}>
                                        <label style={{ color: '#3B2A1A', fontWeight: 'bold', fontSize: '0.95rem' }}>Quick Select Saved Address</label>
                                        <select 
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const selected = user.addresses[e.target.value];
                                                setAddress(prev => ({
                                                    ...prev,
                                                    street: selected.street || '',
                                                    city: selected.city || '',
                                                    state: selected.state || '',
                                                    pincode: selected.pincode || selected.postcode || ''
                                                }));
                                            }}
                                            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', marginTop: '0.5rem', outline: 'none' }}
                                        >
                                            <option value="">-- Choose an Address --</option>
                                            {user.addresses.map((a, i) => (
                                                <option key={i} value={i}>{a.label} - {a.street}, {a.city}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="checkout-form-grid">
                                    <div className="checkout-field">
                                        <label>Full Name *</label>
                                        <input name="name" value={address.name} onChange={handleAddressChange} placeholder="Enter your full name" required />
                                    </div>
                                    <div className="checkout-field">
                                        <label>Phone *</label>
                                        <input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="10-digit mobile number" required />
                                    </div>
                                </div>
                                <div className="checkout-field">
                                    <label>Street Address *</label>
                                    <input 
                                        name="street" 
                                        value={address.street} 
                                        onChange={handleAddressChange} 
                                        placeholder="House no., building, street" 
                                        required 
                                        pattern=".*[0-9].*"
                                        title="Please include your house or building number"
                                    />
                                </div>
                                <div className="checkout-form-grid">
                                    <div className="checkout-field">
                                        <label>City *</label>
                                        <input name="city" value={address.city} onChange={handleAddressChange} placeholder="City" required />
                                    </div>
                                    <div className="checkout-field">
                                        <label>State *</label>
                                        <input name="state" value={address.state} onChange={handleAddressChange} placeholder="State" required />
                                    </div>
                                </div>
                                <div className="checkout-form-grid">
                                    <div className="checkout-field">
                                        <label>Pincode *</label>
                                        <input 
                                            name="pincode" 
                                            value={address.pincode} 
                                            onChange={handleAddressChange} 
                                            placeholder="6-digit pincode" 
                                            required 
                                            pattern="\d{6}"
                                            title="Please enter a valid 6-digit Pincode"
                                        />
                                    </div>
                                    <div className="checkout-field">
                                        <label>Country</label>
                                        <input name="country" value={address.country} disabled />
                                    </div>
                                </div>
                                <button type="submit" className="cart-checkout-btn" style={{ marginTop: '0.5rem' }}>
                                    Continue to Review <span style={{ marginLeft: '0.5rem' }}>→</span>
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <div className="checkout-review">
                                <h3>Review Your Order</h3>
                                {error && <p className="checkout-error">{error}</p>}

                                <div className="checkout-address-card">
                                    <div className="checkout-address-head">
                                        <MapPin size={16} /> Shipping to:
                                        <button onClick={() => setStep(1)} className="checkout-edit-btn">Edit</button>
                                    </div>
                                    <p><strong>{address.name}</strong></p>
                                    <p>{address.street}, {address.city}, {address.state} — {address.pincode}</p>
                                    <p>📞 {address.phone}</p>
                                </div>

                                <div className="checkout-items-mini">
                                    {items.map(item => (
                                        <div key={item.productId} className="checkout-mini-item">
                                            <div className="checkout-mini-img">
                                                {item.image ? <img src={item.image} alt="" /> : <ShoppingBagIcon />}
                                            </div>
                                            <div className="checkout-mini-info">
                                                <span>{item.title}</span>
                                                <span className="checkout-mini-qty">Qty: {item.quantity}</span>
                                            </div>
                                            <span className="checkout-mini-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="checkout-pay-section">
                                    <h4>Payment Method</h4>
                                    <div className="checkout-pay-option active">
                                        <input type="radio" checked readOnly /> Cash on Delivery
                                    </div>
                                </div>

                                <button onClick={placeOrder} disabled={loading} className="cart-checkout-btn" style={{ marginTop: '1rem' }}>
                                    {loading ? <><Loader2 size={18} className="spin-icon" /> Placing Order...</> : 'Place Order'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        <div className="cart-summary-row">
                            <span>Subtotal ({items.length} items)</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Shipping</span>
                            <span>₹{shipping}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>GST (18%)</span>
                            <span>₹{tax.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="cart-summary-divider"></div>
                        <div className="cart-summary-row cart-summary-total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShoppingBagIcon = () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0ebe2', borderRadius: 8 }}>
        <CreditCard size={16} color="#999" />
    </div>
);

export default Checkout;
