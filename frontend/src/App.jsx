import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, ShieldCheck, LayoutDashboard, Search, Menu, X } from 'lucide-react';
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
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
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
                <Link to="/" className="logo">AAPKIKALAA<span>.</span></Link>

                <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/products" className="nav-link">Products</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/#about" className="nav-link" onClick={() => {
                        if (isHome) {
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}>About Us</Link>
                    <Link to="/#contact" className="nav-link" onClick={() => {
                        if (isHome) {
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}>Contact</Link>
                    <div className="mobile-only-actions">
                        {user ? (
                            <>
                                <Link to={getDashboardLink()} className="nav-link">
                                    {getDashboardLabel()}
                                </Link>
                                <button onClick={logout} className="nav-link logout-text-btn">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="nav-link highlight">Login</Link>
                        )}
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
                        <p>© 2026 AAPKIKALAA — Built for Indian Culture Preservation</p>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default App;
