import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, LogOut, Search, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { useSearch } from '../contexts/SearchContext';
import { useTheme } from '../contexts/ThemeContext';
import API_BASE from '../config.js';

export default function Navbar() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { globalSearch, setGlobalSearch } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const username = localStorage.getItem('username') || 'Guest';
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!username || username === 'Guest') return;

    const fetchNotifs = () => {
      Promise.all([
        axios.get(`${API_BASE}/api/bids`),
        axios.get(`${API_BASE}/api/cars`),
      ])
        .then(([bidsRes, carsRes]) => {
          const now = new Date();
          const allCars = carsRes.data;

          const myActiveBids = bidsRes.data.filter(b => {
            if (b.bidderName !== username) return false;
            const car = allCars.find(c => String(c.id) === String(b.carId));
            if (!car) return false;
            return new Date(car.endTime) > now;
          });

          const enriched = myActiveBids.map(bid => {
            const car = allCars.find(c => String(c.id) === String(bid.carId)) || {};
            return { ...bid, car };
          });

          setNotifCount(enriched.length);
          setNotifs(enriched);
        })
        .catch(console.error);
    };

    fetchNotifs(); // run immediately on mount
    const interval = setInterval(fetchNotifs, 30000); // then every 30s
    return () => clearInterval(interval); // cleanup on unmount
  }, [username]);



  const scrollToSection = (id) => {
    if (window.location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        backgroundColor: 'rgba(5, 10, 21, 0.8)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h2 className="text-gold" style={{ margin: 0, letterSpacing: '1px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          AUTOmax
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => scrollToSection('live-auctions')} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}>Live Auctions</span>
          <span style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => scrollToSection('upcoming-auctions')} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}>Upcoming</span>
          <span style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => navigate('/garage')} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}>My Garage</span>
          <span style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => navigate('/about')} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}>About Us</span>
          <span style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => navigate('/sell')} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8}>Sell Car</span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '10px', 
        background: 'rgba(255,255,255,0.05)', 
        border: '1px solid var(--glass-border)',
        borderRadius: '25px', 
        padding: '8px 20px',
        width: '350px',
        maxWidth: '40vw',
        margin: '0 2rem'
      }}>
        <Search size={18} className="text-silver" />
        <input 
          type="text" 
          placeholder="Search by Make or Model..." 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-light)',
            width: '100%',
            fontSize: '0.95rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Premium Theme Toggle */}
        <div 
          onClick={toggleTheme}
          style={{ 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
        >
          {theme === 'carbon' ? <Sun size={18} className="text-gold" /> : <Moon size={18} className="text-silver" />}
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={20} className="text-silver" />
            {notifCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--color-primary)',
                color: 'var(--color-bg)',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>{notifCount}</span>
            )}
          </div>
          
          {showNotifs && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '40px',
                right: '-80px',
                width: '320px',
                padding: '1rem',
                backgroundColor: 'rgba(5, 10, 21, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--color-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                zIndex: 200,
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
              }}
            >
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>Active Notifications</h3>
              {notifs.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>No active notifications right now.</p>
              ) : (
                notifs.map((n, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} 
                       onClick={() => { setShowNotifs(false); navigate(`/car/${n.carId}`); }}
                       onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                       onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>You hold the active bid on a <strong>{n.car.make} {n.car.model}</strong>.</p>
                    <span className="text-gold" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Bid ₹{n.bidAmount?.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
        
        {username !== 'Guest' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem' }} onClick={() => navigate('/garage')}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <User size={18} color="white" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ color: 'var(--color-text)', fontWeight: 500, lineHeight: 1 }}>{username}</span>
                <span onClick={(e) => { e.stopPropagation(); navigate('/profile'); }} style={{ color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer', lineHeight: 1 }}>My Profile →</span>
              </div>
            </div>
            <button onClick={() => {
              localStorage.removeItem('username');
              localStorage.removeItem('token');
              localStorage.removeItem('balance');
              navigate('/login');
              window.location.reload();
            }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8} title="Logout">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <button 
            className="glow-btn"
            style={{ padding: '8px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}
            onClick={() => navigate('/login')}
          >
            <User size={16} />
            Login / Register
          </button>
        )}
      </div>
    </motion.nav>
  );
}
