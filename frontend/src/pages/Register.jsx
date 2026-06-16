import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, User, Palette } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        phone: '',
        city: '',
        state: '',
        category: '',
        experience: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-card artist-auth-card">
                    <h2>Join AAPKIKALA</h2>
                    <p>Start your journey with Indian Art</p>
                    
                    <div className="role-selector">
                        <button 
                            type="button"
                            className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, role: 'customer'})}
                        >
                            <User size={20} />
                            Customer
                        </button>
                        <button 
                            type="button"
                            className={`role-btn ${formData.role === 'artist' ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, role: 'artist'})}
                        >
                            <Palette size={20} />
                            Artist
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                name="name"
                                required 
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                required 
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    required 
                                    minLength="6"
                                    placeholder="Min. 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {formData.role === 'artist' && (
                            <div className="artist-fields animate-fade-in">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            required 
                                            placeholder="+91"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Years of Experience</label>
                                        <input 
                                            type="number" 
                                            name="experience"
                                            required 
                                            min="0"
                                            placeholder="e.g. 5"
                                            value={formData.experience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            name="city"
                                            required 
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input 
                                            type="text" 
                                            name="state"
                                            required 
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Primary Art Form</label>
                                    <select 
                                        name="category" 
                                        required 
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select your specialty</option>
                                        <option value="Madhubani">Madhubani</option>
                                        <option value="Warli">Warli</option>
                                        <option value="Pattachitra">Pattachitra</option>
                                        <option value="Terracotta">Terracotta</option>
                                        <option value="Pottery">Pottery</option>
                                        <option value="Textile">Textile / Handloom</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {error && <div className="error-msg">{error}</div>}
                        
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : (formData.role === 'artist' ? 'Register as Artist' : 'Create Account')}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign In here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

