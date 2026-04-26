import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FALLBACK_WINNERS = [
  {
    id: 1,
    car: 'McLaren P1',
    price: '₹25,00,00,000',
    date: 'Today, 10:30 AM',
    winner: 'Aarav Patel',
    location: 'Mumbai, India',
    img: '/cars/mclaren_p1_main.jpg'
  },
  {
    id: 5,
    car: 'Lamborghini Aventador SVJ',
    price: '₹8,50,00,000',
    date: 'Yesterday, 8:45 PM',
    winner: 'James Carter',
    location: 'London, UK',
    img: '/cars/svj_main.jpg'
  },
  {
    id: 3,
    car: 'Porsche 911 GT3 RS',
    price: '₹2,80,00,000',
    date: 'Mar 25, 4:15 PM',
    winner: 'Yuki Tanaka',
    location: 'Tokyo, Japan',
    img: '/cars/porsche_gt3_main.jpg'
  },
  {
    id: 2,
    car: 'Ferrari LaFerrari',
    price: '₹35,00,00,000',
    date: 'Mar 24, 7:00 PM',
    winner: 'Sheikh Al-Maktoum',
    location: 'Dubai, UAE',
    img: '/cars/ferrari_laferrari_main.jpg'
  }
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [pastAuctions, setPastAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastAuctions = async () => {
      try {
        const [carsRes, winnersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/cars'),
          axios.get('http://localhost:5000/api/winners')
        ]);
        
        const cars = carsRes.data;
        const winners = winnersRes.data.winners || [];
        
        const expired = cars.filter(c => new Date(c.endTime).getTime() <= Date.now());
        
        const formattedExpired = expired.map(car => {
          const winnerObj = winners.find(w => w.items.includes(car.id.toString()));
          return {
            id: car.id,
            car: `${car.make} ${car.model}`,
            price: winnerObj ? `₹${winnerObj.bidAmount.toLocaleString()}` : `₹${car.startingBid.toLocaleString()}`,
            date: new Date(car.endTime).toLocaleDateString() + ' ' + new Date(car.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            winner: winnerObj ? winnerObj.bidderName : 'No Bids',
            location: 'Global',
            img: car.images[0]
          };
        });

        // Combine dynamically expired cars with fallback cars for variety
        const combined = [...formattedExpired, ...FALLBACK_WINNERS];
        
        // Duplicate for seamless infinite scroll
        setPastAuctions([...combined, ...combined]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPastAuctions();
    const interval = setInterval(fetchPastAuctions, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || pastAuctions.length === 0) return null;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Trophy className="text-gold" size={24} />
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Past Auctions</h2>
      </div>

      <div style={{ 
        overflow: 'hidden', 
        width: '100%', 
        position: 'relative',
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
      }}>
        <motion.div 
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          style={{ display: 'flex', gap: '2rem', width: 'max-content' }}
        >
          {pastAuctions.map((winner, idx) => (
            <div 
              key={`${winner.id}-${idx}`}
              className="glass-panel"
              style={{
                width: '480px',
                height: '280px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                flexShrink: 0,
                borderRadius: '16px',
                padding: '1.5rem',
                backgroundImage: `linear-gradient(to top, rgba(5,10,21,0.95), rgba(5,10,21,0.1)), url(${winner.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--glass-border)'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <h3 style={{ fontSize: '1.4rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                    {winner.car}
                  </h3>
                  <span className="text-gold" style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
                    {winner.price}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> {winner.date}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }} className="text-gold">
                      {winner.winner}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{winner.location}</span>
                  </div>
                </div>
                
                <button 
                  className="glow-btn"
                  style={{ marginTop: '1rem', padding: '12px', fontSize: '1rem', fontWeight: 600 }}
                  onClick={() => navigate(`/car/${winner.id}`, { state: { isPast: true, winner: winner.winner, location: winner.location, price: winner.price, date: winner.date } })}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
