import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Paintbrush, Package, GraduationCap, Truck, Sparkles, Users,
    ArrowRight, CheckCircle, Star, Phone, Mail, ChevronDown, ChevronUp
} from 'lucide-react';

const services = [
    {
        id: 'commissions',
        icon: <Paintbrush size={32} />,
        title: 'Custom Art Commissions',
        tagline: 'Your Vision, Their Mastery',
        description: 'Work directly with master artisans to create one-of-a-kind pieces tailored to your taste. From Madhubani murals for your living room to personalized Pattachitra scrolls — bring your imagination to life through centuries-old techniques.',
        features: [
            'One-on-one consultation with the artist',
            'Choice of art form, size, and color palette',
            'Progress updates with photos at every stage',
            'Certificate of authenticity included',
            'Delivery within 3–6 weeks'
        ],
        price: 'Starting from ₹5,000',
        color: '#C4622D'
    },
    {
        id: 'restoration',
        icon: <Sparkles size={32} />,
        title: 'Art Restoration',
        tagline: 'Revive Timeless Treasures',
        description: 'Breathe new life into faded or damaged traditional artworks. Our restoration experts specialize in Tanjore paintings, Mughal miniatures, vintage textiles, and heritage sculptures — preserving India\'s cultural legacy with care.',
        features: [
            'Free damage assessment via photo/video',
            'Color matching with traditional pigments',
            'Structural repair for frames and canvases',
            'UV-protective coating for longevity',
            'Insured handling and return shipping'
        ],
        price: 'Starting from ₹3,000',
        color: '#8B6914'
    },
    {
        id: 'corporate',
        icon: <Package size={32} />,
        title: 'Corporate & Bulk Gifting',
        tagline: 'Culture Meets Elegance',
        description: 'Impress clients and reward teams with handcrafted Indian art. We curate bespoke gift sets — Warli coasters, hand-painted diaries, brass figurines, and more — beautifully packaged and delivered across India.',
        features: [
            'Curated collections for any budget',
            'Custom branding and packaging available',
            'Bulk discounts for 50+ units',
            'Pan-India delivery with tracking',
            'Dedicated account manager for orders'
        ],
        price: 'Starting from ₹500/piece',
        color: '#2D6B4F'
    },
    {
        id: 'workshops',
        icon: <GraduationCap size={32} />,
        title: 'Art Workshops & Classes',
        tagline: 'Learn from the Masters',
        description: 'Dive into the world of Indian folk art with hands-on workshops led by practicing artisans. Available online and in-person — perfect for individuals, schools, and corporate team-building events.',
        features: [
            'Madhubani, Warli, Gond, Kalamkari & more',
            'All materials included (shipped for online)',
            '2–4 hour sessions, beginner-friendly',
            'Group discounts and private sessions',
            'Certificate of completion provided'
        ],
        price: 'Starting from ₹1,500/person',
        color: '#6B3FA0'
    },
    {
        id: 'framing',
        icon: <Truck size={32} />,
        title: 'Premium Framing & Delivery',
        tagline: 'Gallery-Grade Presentation',
        description: 'Elevate your artwork with museum-quality framing. Choose from handcrafted wooden frames, floating mounts, or traditional border styles — all fitted by professionals and delivered safely to your doorstep.',
        features: [
            'Solid wood and metal frame options',
            'Anti-glare, UV-protective glass',
            'Acid-free matting to prevent yellowing',
            'Earthquake-proof hanging hardware',
            'White-glove delivery and installation'
        ],
        price: 'Starting from ₹2,000',
        color: '#4A6741'
    },
    {
        id: 'consultation',
        icon: <Users size={32} />,
        title: 'Art Consultation & Interior Styling',
        tagline: 'Art That Belongs in Your Space',
        description: 'Not sure what art fits your home or office? Our art consultants help you choose the right pieces, sizes, and placements — blending traditional Indian aesthetics with modern interiors for a space that tells a story.',
        features: [
            'Virtual or on-site space assessment',
            'Mood boards and art recommendations',
            'Budget-friendly to luxury options',
            'Coordination with interior designers',
            'Seasonal refresh plans available'
        ],
        price: 'Free initial consultation',
        color: '#A0522D'
    }
];

const steps = [
    { num: '01', title: 'Browse & Choose', desc: 'Explore our services and pick what suits your needs.' },
    { num: '02', title: 'Connect With Us', desc: 'Reach out via the form below or call us to discuss details.' },
    { num: '03', title: 'We Craft It', desc: 'Our artisans get to work, keeping you updated at every step.' },
    { num: '04', title: 'Delivered to You', desc: 'Your art arrives safely, beautifully packaged and ready to cherish.' }
];

const ServiceCard = ({ service, isExpanded, onToggle }) => {
    return (
        <div className={`svc-card ${isExpanded ? 'svc-card-expanded' : ''}`} id={service.id}>
            <div className="svc-card-header" onClick={onToggle}>
                <div className="svc-icon-wrap" style={{ background: `${service.color}15`, color: service.color }}>
                    {service.icon}
                </div>
                <div className="svc-card-title-area">
                    <h3>{service.title}</h3>
                    <p className="svc-tagline">{service.tagline}</p>
                </div>
                <button className="svc-toggle-btn" aria-label="Toggle details">
                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </button>
            </div>

            <div className={`svc-card-body ${isExpanded ? 'svc-body-open' : ''}`}>
                <p className="svc-description">{service.description}</p>
                <ul className="svc-features">
                    {service.features.map((f, i) => (
                        <li key={i}><CheckCircle size={16} style={{ color: service.color, flexShrink: 0 }} /> {f}</li>
                    ))}
                </ul>
                <div className="svc-card-footer">
                    <span className="svc-price" style={{ color: '#888', fontStyle: 'italic' }}>Coming Soon</span>
                    <button className="svc-cta-btn" style={{ background: '#e0e0e0', color: '#888', cursor: 'not-allowed', border: 'none' }} disabled>
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
};

const Services = () => {
    const [expandedId, setExpandedId] = useState('commissions');

    const handleToggle = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="services-page">
            {/* Hero */}
            <div className="svc-hero">
                <div className="svc-hero-overlay"></div>
                <div className="container svc-hero-content">
                    <span className="section-tag" style={{ color: '#D4A017' }}>What We Offer</span>
                    <h1>Our Services</h1>
                    <p>Beyond a marketplace — we bring India's art traditions to your doorstep through personalized experiences.</p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container svc-main-section">
                <div className="svc-grid">
                    {services.map(service => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            isExpanded={expandedId === service.id}
                            onToggle={() => handleToggle(service.id)}
                        />
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="svc-process-section">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-tag">Simple Process</span>
                        <h2>How It Works</h2>
                        <p>From inquiry to delivery — four simple steps</p>
                    </div>

                    <div className="svc-steps-grid">
                        {steps.map((step, i) => (
                            <div key={i} className="svc-step-card">
                                <span className="svc-step-num">{step.num}</span>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                                {i < steps.length - 1 && <div className="svc-step-connector"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial / Trust (Hidden while in Coming Soon state) 
            <div className="container svc-trust-section">
                <div className="svc-trust-card">
                    <div className="svc-trust-stars">
                        {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#D4A017" color="#D4A017" />)}
                    </div>
                    <blockquote>
                        "AAPKIKALA turned my vague idea into a stunning 4-foot Madhubani mural for our office lobby. 
                        The process was transparent, and the artist's skill was phenomenal."
                    </blockquote>
                    <div className="svc-trust-author">
                        <strong>Priya Sharma</strong>
                        <span>Interior Designer, Mumbai</span>
                    </div>
                </div>
            </div>
            */}

            {/* CTA */}
            <div className="svc-cta-section">
                <div className="container">
                    <div className="svc-cta-card">
                        <h2>Have a Project in Mind?</h2>
                        <p>Tell us what you're looking for and we'll connect you with the right artisan.</p>
                        <div className="svc-cta-actions">
                            <Link to="/#contact" className="svc-cta-primary">
                                <Mail size={18} /> Send Us a Message
                            </Link>
                            <a href="tel:+917077501102" className="svc-cta-secondary">
                                <Phone size={18} /> Call Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;
