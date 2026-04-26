import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Timer } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const UPCOMING_AUCTIONS = [
  {
    id: 11,
    car: 'Rolls-Royce Phantom Series II',
    startTime: '2026-03-28T10:00:00Z',
    endTime: '2026-03-30T10:00:00Z',
    img: '/rollsroyce.png'
  },
  {
    id: 12,
    car: 'Bugatti Chiron Pur Sport',
    startTime: '2026-03-29T15:00:00Z',
    endTime: '2026-03-31T15:00:00Z',
    img: '/bugatti.png'
  },
  {
    id: 13,
    car: 'Lamborghini Aventador SVJ',
    startTime: '2026-03-30T12:00:00Z',
    endTime: '2026-04-01T12:00:00Z',
    img: '/lambo.png'
  }
];

const formatTimeUntil = (targetDateString) => {
  const target = new Date(targetDateString).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  
  if (diff <= 0) return 'Started';

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${d}d ${h}h ${m}m`;
};

const formatDateRange = (start, end) => {
  const s = new Date(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  const e = new Date(end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  return `${s} - ${e}`;
};

export default function UpcomingAuctions() {
  const { showToast } = useToast();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <CalendarDays className="text-silver" size={24} />
        <h2 style={{ fontSize: '1.8rem', m: 0 }}>Future Acquisitions</h2>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '1rem'
      }}>
        {UPCOMING_AUCTIONS.map((auction) => (
          <motion.div
            key={auction.id}
            whileHover={{ x: 10, boxShadow: 'var(--glow-accent)' }}
            className="glass-panel"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              height: '180px',
              border: '1px solid var(--glass-border)'
            }}
          >
            {/* Image Section - Left */}
            <div style={{ width: '350px', height: '100%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              <img 
                src={auction.img} 
                alt={auction.car} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease', filter: 'brightness(1.15) contrast(1.1)' }} 
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(1.25) contrast(1.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1.15) contrast(1.1)'; }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, boxShadow: 'inset -15px 0 30px rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
            </div>

            {/* Content Section - Middle */}
            <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.8rem', margin: 0, marginBottom: '1rem' }}>{auction.car}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarDays size={18} className="text-silver" /> 
                  {formatDateRange(auction.startTime, auction.endTime)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px' }}>
                  <Timer size={18} className="text-gold" /> 
                  <span>Starts in: <strong className="text-gold">{formatTimeUntil(auction.startTime)}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Section - Right */}
            <div style={{ 
              width: '240px', 
              padding: '2rem', 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02))',
              borderLeft: '1px solid var(--glass-border)',
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <button 
                className="glow-btn"
                style={{ padding: '14px', fontSize: '1rem', width: '100%', fontWeight: 600 }}
                onClick={() => showToast(`Reminder successfully set for ${auction.car}!`, 'success')}
              >
                Set Reminder
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
