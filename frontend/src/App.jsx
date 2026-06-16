import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, ShieldCheck, LayoutDashboard, Search, Menu, X, Home as HomeIcon, Palette, Briefcase, Info, Phone, ChevronRight, Globe, Mail, MessageCircle, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtistDashboard from './pages/ArtistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import Services from './pages/Services';
import ArtistProfilePage from './pages/ArtistProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyAccount from './pages/MyAccount';
import './App.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        
        // Handle hash scrolling
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                // If it's a home page hash link, let Home.jsx handle it after products load to avoid layout shifts
                if (location.pathname !== '/' || (id !== 'about' && id !== 'contact')) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        } else {
            window.scrollTo(0, 0); // Reset scroll on route change if no hash
        }

        setIsMenuOpen(false); // Close menu on route change
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    // Role-based dashboard link
    const getDashboardLink = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'artist') return '/dashboard';
        return '/my-account';
    };

    const getDashboardLabel = () => {
        if (user?.role === 'admin') return 'Admin Panel';
        if (user?.role === 'artist') return 'Artist Dashboard';
        return 'My Account';
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="logo">AAPKIKALA<span>.</span></Link>

                <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    {/* Mobile Only Header */}
                    <div className="mobile-menu-header">
                        <div className="mobile-logo-wrap">
                            <span className="mobile-logo-text">AAPKIKALA<span className="ochre-dot">.</span></span>
                            <span className="mobile-logo-subtitle">Heritage & Artistry</span>
                        </div>
                        <button className="mobile-close-btn" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Mobile Profile Card */}
                    <div className="mobile-menu-profile">
                        {user ? (
                            <div className="mobile-profile-card">
                                <div className="mobile-avatar">
                                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                                </div>
                                <div className="mobile-profile-info">
                                    <span className="mobile-greeting">Namaste,</span>
                                    <span className="mobile-username">{user.name || 'Artisan'}</span>
                                    <span className="mobile-role">{user.role}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mobile-cta-card">
                                <span className="mobile-cta-title">Join Our Community</span>
                                <span className="mobile-cta-text">Discover & support local Indian artisans.</span>
                                <Link to="/login" className="mobile-cta-btn" onClick={() => setIsMenuOpen(false)}>
                                    <LogIn size={15} /> Login / Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Nav Links */}
                    <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        <HomeIcon size={20} className="nav-link-icon" />
                        <span>Home</span>
                        <ChevronRight size={18} className="nav-link-chevron" />
                    </Link>
                    <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        <Palette size={20} className="nav-link-icon" />
                        <span>Products</span>
                        <ChevronRight size={18} className="nav-link-chevron" />
                    </Link>
                    <Link to="/services" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        <Briefcase size={20} className="nav-link-icon" />
                        <span>Services</span>
                        <ChevronRight size={18} className="nav-link-chevron" />
                    </Link>
                    <Link to="/#about" className="nav-link" onClick={() => {
                        setIsMenuOpen(false);
                        if (isHome) {
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}>
                        <Info size={20} className="nav-link-icon" />
                        <span>About Us</span>
                        <ChevronRight size={18} className="nav-link-chevron" />
                    </Link>
                    <Link to="/#contact" className="nav-link" onClick={() => {
                        setIsMenuOpen(false);
                        if (isHome) {
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}>
                        <Phone size={20} className="nav-link-icon" />
                        <span>Contact</span>
                        <ChevronRight size={18} className="nav-link-chevron" />
                    </Link>

                    {/* Mobile Only Dashboard / Logout actions */}
                    {user && (
                        <div className="mobile-profile-actions">
                            <Link to={getDashboardLink()} className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                {user.role === 'admin' ? <ShieldCheck size={20} className="nav-link-icon" /> :
                                 user.role === 'artist' ? <LayoutDashboard size={20} className="nav-link-icon" /> :
                                 <User size={20} className="nav-link-icon" />}
                                <span>{getDashboardLabel()}</span>
                                <ChevronRight size={18} className="nav-link-chevron" />
                            </Link>
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="nav-link logout-text-btn">
                                <LogOut size={20} className="nav-link-icon" />
                                <span>Logout</span>
                                <ChevronRight size={18} className="nav-link-chevron" />
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Footer */}
                    <div className="mobile-menu-footer">
                        <div className="mobile-socials">
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                                <Globe size={20} />
                            </a>
                            <a href="mailto:contact@aapkikala.com" className="social-icon" aria-label="Mail">
                                <Mail size={20} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
                                <MessageCircle size={20} />
                            </a>
                        </div>
                        <span className="mobile-footer-tagline">Handmade with ♥ in India</span>
                    </div>
                </div>

                <div className="nav-actions">
                    {(!user || user.role === 'customer') && (
                        <Link to="/cart" className="nav-icon-link cart-icon-wrap">
                            <ShoppingBag size={22} />
                            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        </Link>
                    )}

                    {user ? (
                        <div className="user-menu desktop-only">
                            <Link to={getDashboardLink()} className="nav-icon-link">
                                {user.role === 'admin' ? <ShieldCheck size={22} /> :
                                 user.role === 'artist' ? <LayoutDashboard size={22} /> :
                                 <User size={22} />}
                            </Link>
                            <button onClick={logout} className="logout-btn">
                                <LogOut size={22} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-link desktop-only">Login</Link>
                    )}

                    <button className="menu-toggle" aria-label="Toggle menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
            {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)}></div>}
        </nav>
    );
};

function App() {
    const location = useLocation();
    const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

    return (
        <div className="app">
            {!isDashboardRoute && <Navbar />}
            
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/services" element={<Services />} />
                <Route path="/artist/:id" element={<ArtistProfilePage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ArtistDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>

            {!isDashboardRoute && (
                <footer className="footer">
                    <div className="container">
                        <p>© 2026 AAPKIKALA — Built for Indian Culture Preservation</p>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default App;
