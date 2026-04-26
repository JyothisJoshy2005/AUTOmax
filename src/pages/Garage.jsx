import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Activity, ArrowLeft, TrendingUp, Medal, IndianRupee, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';
import WinCelebrationModal from '../components/WinCelebrationModal';

export default function Garage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  
  const [listedCars, setListedCars] = useState([]);
  const [wonCars, setWonCars] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWins, setNewWins] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!token) {
      showToast('Please login to view your Garage', 'error');
      navigate('/login');
      return;
    }

    const fetchGarage = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/garage', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setListedCars(data.listedCars || []);
        setActiveBids(data.activeBids || []);
        setWonCars(data.wonCars || []);

        // ── Win detection: compare against previously seen wins ──────────
        const won = data.wonCars || [];
        if (won.length > 0) {
          const seenKey = `seen_wins_${username}`;
          const seenWinIds = JSON.parse(localStorage.getItem(seenKey) || '[]');
          const freshWins = won.filter(w => !seenWinIds.includes(w._id?.toString() || w.carId));
          
          if (freshWins.length > 0) {
            setNewWins(freshWins);
            setShowCelebration(true);
            // Mark all current wins as seen
            const allIds = won.map(w => w._id?.toString() || w.carId);
            localStorage.setItem(seenKey, JSON.stringify(allIds));
          }
        }
        // ─────────────────────────────────────────────────────────────────

      } catch (err) {
        console.error("Error fetching Garage data:", err);
        showToast('Failed to load garage data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGarage();
  }, [token, navigate, showToast]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2 className="text-gold">Opening Garage Doors...</h2></div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 🏆 Victory Modal — fires automatically on new wins */}
      {showCelebration && newWins.length > 0 && (
        <WinCelebrationModal
          wins={newWins}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <Navbar />
      
      <main style={{ padding: '3rem 2rem', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              color: 'var(--color-primary)', background: 'rgba(212, 175, 55, 0.1)', 
              padding: '8px 16px', borderRadius: '25px', border: '1px solid rgba(212, 175, 55, 0.3)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            My Garage
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
            The private collection of <span className="text-gold" style={{fontWeight: 600}}>{username}</span>.
          </p>
        </motion.div>

        {/* Analytics Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={18} className="text-silver" /> Capital Committed
            </span>
            <span className="text-gold" style={{ fontSize: '2.5rem', fontWeight: 600 }}>
              ₹{activeBids.reduce((sum, bid) => sum + (bid.bidAmount || 0), 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Across {activeBids.length} active auctions</span>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <IndianRupee size={18} className="text-silver" /> Collection Value
            </span>
            <span className="text-gold" style={{ fontSize: '2.5rem', fontWeight: 600 }}>
              ₹{wonCars.reduce((sum, win) => sum + (win.bidAmount || 0), 0).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Aggregated market value</span>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-primary)', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(5,10,21,1) 100%)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Medal size={18} className="text-gold" /> Collector Status
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: 600, color: 'white' }}>
              {wonCars.length === 0 ? "Novice" : wonCars.length < 3 ? "Silver Tier" : "VIP Gold"}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
              {wonCars.length === 0 ? "Win 1 auction to rank up" : "Exclusive privileges unlocked"}
            </span>
          </motion.div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Left Column: Active Bidding & Selling */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Active Bids */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <Activity size={24} className="text-silver" />
                <h2 style={{ fontSize: '1.5rem', m: 0 }}>Active Bids</h2>
              </div>
              
              {activeBids.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No active bids running at the moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeBids.map((bid, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="glass-panel"
                      style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => navigate(`/car/${bid.car.id}`)}
                    >
                      <img src={bid.car?.images?.[0] || ''} alt="car" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{bid.car?.make} {bid.car?.model}</h4>
                        <span className="text-gold" style={{ fontSize: '1.2rem', fontWeight: 600 }}>₹{bid.bidAmount?.toLocaleString() || '0'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* My Showroom (Cars Listed by User) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <Key size={24} className="text-silver" />
                <h2 style={{ fontSize: '1.5rem', m: 0 }}>My Showroom</h2>
              </div>
              
              {listedCars.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No cars listed for sale yet — start selling to fill your showroom!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {listedCars.map((car, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="glass-panel"
                      style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', borderLeft: '3px solid var(--color-primary)' }}
                      onClick={() => navigate(`/car/${car.id}`)}
                    >
                      <img src={car.images[0]} alt="car" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{car.make} {car.model}</h4>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Current Bid: </span>
                        <span className="text-gold" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          ₹{car.currentBid > 0 ? car.currentBid.toLocaleString() : car.startingBid.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Owned Collection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <Trophy size={24} className="text-gold" />
              <h2 style={{ fontSize: '1.5rem', m: 0 }}>Purchased Collection</h2>
            </div>
            
            {wonCars.length === 0 ? (
              <div style={{ 
                padding: '4rem', textAlign: 'center', border: '1px dashed var(--glass-border)', 
                borderRadius: '16px', background: 'rgba(255,255,255,0.02)' 
              }}>
                <h3 style={{ color: 'var(--color-text-muted)', margin: 0 }}>Your garage is empty</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Win an auction to park a vehicle here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {wonCars.map((win, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-panel"
                    style={{ overflow: 'hidden', border: '1px solid var(--color-primary)' }}
                  >
                    <div style={{ height: '200px', width: '100%' }}>
                      <img src={win.car?.images?.[0] || ''} alt="Won Car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{win.car?.make} {win.car?.model}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Winning Bid</span>
                        <span className="text-gold" style={{ fontWeight: 600, fontSize: '1.2rem' }}>₹{win.bidAmount?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
