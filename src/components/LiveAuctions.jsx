import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';

import { CARS } from '../data/cars.js';

const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function LiveAuctions() {
  const [timers, setTimers] = useState({});
  const { globalSearch } = useSearch();
  const [filterType, setFilterType] = useState('All');
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Guest';

  useEffect(() => {
    // 1. Fetch Cars
    const fetchCarsAndBids = async () => {
      try {
        const [carsRes, bidsRes, winnersRes] = await Promise.all([
          fetch('http://localhost:5000/api/cars'),
          fetch('http://localhost:5000/api/bids'),
          fetch('http://localhost:5000/api/winners')
        ]);
        
        if (!carsRes.ok) return;
        
        const carsData = await carsRes.json();
        const bidsData = bidsRes.ok ? await bidsRes.json() : [];
        const winnersData = winnersRes.ok ? await winnersRes.json() : { winners: [] };

        const newTimers = {};
        const enrichedAuctions = carsData.map(car => {
          newTimers[car.id] = car.endsIn;

          const carBids = bidsData.filter(b => b.items.includes(car.id.toString()));
          let maxBid = 0;
          if (carBids.length > 0) {
            maxBid = Math.max(...carBids.map(b => b.bidAmount));
          }
          const isWinning = winnersData.winners?.some(w => w.bidderName === username && w.items.includes(car.id.toString()));

          return {
            ...car,
            currentBid: maxBid > 0 ? `₹${maxBid.toLocaleString()}` : `₹${car.startingBid.toLocaleString()}`,
            activeBid: isWinning || false
          };
        });

        setTimers(prevTimers => ({ ...prevTimers, ...newTimers }));
        setAuctions(enrichedAuctions);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    
    fetchCarsAndBids();
    const dataInterval = setInterval(fetchCarsAndBids, 3000);

    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(id => {
          if (newTimers[id] > 0) newTimers[id] -= 1;
        });
        return newTimers;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(dataInterval);
    };
  }, [username]);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '12px', height: '12px', background: 'red', borderRadius: '50%', boxShadow: '0 0 10px red' }} />
            <motion.div 
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', background: 'red', borderRadius: '50%' }}
            />
          </div>
          <h2 style={{ fontSize: '1.8rem', m: 0 }}>Live Auctions</h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Sort By:</span>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', 
              padding: '8px 12px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}
          >
            <option value="All" style={{ color: 'black' }}>Ending Soonest</option>
            <option value="PriceLow" style={{ color: 'black' }}>Current Bid: Low to High</option>
            <option value="PriceHigh" style={{ color: 'black' }}>Current Bid: High to Low</option>
          </select>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem' 
      }}>
        {auctions
          .filter(auction => timers[auction.id] > 0)
          .filter(auction => 
            !globalSearch || 
            auction.make.toLowerCase().includes(globalSearch.toLowerCase()) || 
            auction.model.toLowerCase().includes(globalSearch.toLowerCase())
          )
          .sort((a, b) => {
            if (filterType === 'PriceLow') {
              return parseInt(a.currentBid.replace(/[^0-9]/g, '')) - parseInt(b.currentBid.replace(/[^0-9]/g, ''));
            }
            if (filterType === 'PriceHigh') {
              return parseInt(b.currentBid.replace(/[^0-9]/g, '')) - parseInt(a.currentBid.replace(/[^0-9]/g, ''));
            }
            return timers[a.id] - timers[b.id];
          })
          .map((auction) => (
          <motion.div
            key={auction.id}
            whileHover={{ x: 10 }}
            className="glass-panel"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              height: '260px',
              border: auction.activeBid ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)',
              boxShadow: auction.activeBid ? 'var(--glow-primary)' : 'var(--glass-shadow)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/car/${auction.id}`)}
          >
            {/* Image Section - Left */}
            <div style={{ width: '400px', height: '100%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              <img 
                src={auction.images[0]} 
                alt={auction.model} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease', filter: 'brightness(1.15) contrast(1.1)' }} 
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(1.25) contrast(1.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1.15) contrast(1.1)'; }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, boxShadow: 'inset -15px 0 30px rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(5,10,21,0.7)',
                padding: '6px 14px',
                borderRadius: '20px',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--color-text-light)',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Clock size={16} className={timers[auction.id] < 3600 ? 'text-primary' : ''} color={timers[auction.id] < 3600 ? 'red' : 'white'} />
                <span style={{ color: timers[auction.id] < 3600 ? '#ff4d4d' : 'white', letterSpacing: '1px' }}>
                  {formatTime(timers[auction.id] || 0)}
                </span>
              </div>
            </div>

            {/* Content Section - Middle */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.9rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{auction.make} <span className="text-gold">{auction.model}</span></h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '1rem', maxWidth: '500px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {auction.description || `A masterpiece of engineering featuring a ${auction.engine} producing ${auction.horsepower}.`}
              </p>
              
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Engine</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500, margin: '0.25rem 0 0 0' }}>{auction.engine}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Speed</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500, margin: '0.25rem 0 0 0' }}>{auction.topSpeed}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Power</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500, margin: '0.25rem 0 0 0' }}>{auction.horsepower}</p>
                </div>
              </div>
            </div>

            {/* Bidding Section - Right */}
            <div style={{ 
              width: '290px', 
              padding: '1.75rem', 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03))',
              borderLeft: '1px solid var(--glass-border)',
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Current Bid</span>
              <span className="text-gold" style={{ fontSize: '1.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', textShadow: '0 0 15px rgba(212,175,55,0.4)' }}>
                {auction.currentBid}
              </span>
              
              {auction.activeBid ? (
                <span style={{ fontSize: '0.8rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--color-primary)', padding: '6px 10px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.4)', marginBottom: '1.25rem', fontWeight: 600 }}>
                  Your Bid Leading
                </span>
              ) : (
                <div style={{ height: '28px', marginBottom: '1.25rem' }} />
              )}

              <button 
                className="glow-btn" 
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
                onClick={(e) => { e.stopPropagation(); navigate(`/car/${auction.id}`); }}
              >
                Place Bid
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
