import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="gradient-text">SkillSwap</span>
          </div>
          <div className="landing-nav-btns">
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">The Future of Learning is Here</div>
          <h1 className="hero-title">
            Exchange Skills,<br />
            <span className="gradient-text">Grow Together</span>
          </h1>
          <p className="hero-subtitle">
            Connect with passionate learners and experts. Teach what you know, learn what you love.
            SkillSwap makes peer-to-peer learning effortless.
          </p>
          <div className="hero-btns">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In →
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">10K+</span><span>Users</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">500+</span><span>Skills</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">50K+</span><span>Sessions</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-inner">
          <h2 className="section-title">Everything You Need to <span className="gradient-text">Thrive</span></h2>
          <div className="features-grid">
            {[
              { icon: 'Exchange', title: 'Skill Exchange', desc: 'Find people to exchange skills with. Teach what you know, learn what you want.' },
              { icon: 'Chat', title: 'Real-time Chat', desc: 'Chat, discuss, and schedule meetings. Generate Google Meet links instantly.' },
              { icon: 'Community', title: 'Community', desc: 'Share stories, articles, and achievements. Get inspired by others.' },
              { icon: 'Resources', title: 'Resource Sharing', desc: 'Upload and access learning materials, video lectures, and documents.' },
              { icon: 'Target', title: 'Learning Hub', desc: 'Track your learning journey and revisit your skill-exchange partners.' },
              { icon: 'Security', title: 'Secure & Private', desc: 'OTP-verified accounts with JWT authentication keep your data safe.' },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="features-inner">
          <h2 className="section-title">How <span className="gradient-text">SkillSwap</span> Works</h2>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your Gmail, verify with OTP, and wait for activation.' },
              { step: '02', title: 'Build Your Profile', desc: 'Add your skills to teach and skills you want to learn.' },
              { step: '03', title: 'Discover People', desc: 'Browse user cards and find your perfect skill-exchange partner.' },
              { step: '04', title: 'Connect & Learn', desc: 'Chat, schedule meetings, and start your learning journey!' },
            ].map((s) => (
              <div key={s.step} className="step-card">
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Start Your Learning Journey?</h2>
        <Link to="/register" className="btn btn-primary btn-lg">
          Join SkillSwap Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <span className="gradient-text">SkillSwap</span>
        </div>
        <p>© 2026 SkillSwap. Connect. Learn. Grow.</p>
      </footer>
    </div>
  );
};

export default Landing;
