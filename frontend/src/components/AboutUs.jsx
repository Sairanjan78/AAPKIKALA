import React from 'react';
import { Users, Palette, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <section className="about-us-section" id="about">
      <div className="section-header-centered">
        <span className="section-tag">Our Mission</span>
        <h2>Our Heritage, Your Home</h2>
        <p>A new platform preserving the soul of Indian craftsmanship</p>
      </div>

      <div className="about-grid">
        <div className="about-image-story">
          <img src="/pic/pottery.png" alt="Artisan at work" />
          <div className="experience-badge">
            <span className="years">100%</span>
            <span className="text">Authentic <br/>Craft</span>
          </div>
        </div>

        <div className="about-content">
          <h3>Bringing Ancient Wisdom to Modern Life</h3>
          <p>
            AAPKIKALAA is embarking on a mission to ensure the stories of our ancestors, 
            told through their hands, continue to thrive. We are building a platform to connect 
            the guardians of these traditions across Bharat directly with art lovers.
          </p>
          <p>
            As a newly launched marketplace, we are actively inviting artisans and art enthusiasts 
            to join our growing community. Every purchase and every new artist helps us build a 
            global stage for dying traditions and a sustainable legacy for the future.
          </p>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon"><Users size={24} /></div>
              <div className="stat-info">
                <h4>Community</h4>
                <p>Growing Together</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><Palette size={24} /></div>
              <div className="stat-info">
                <h4>Authentic</h4>
                <p>Art Forms</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><Heart size={24} /></div>
              <div className="stat-info">
                <h4>Passion</h4>
                <p>For Craft</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
