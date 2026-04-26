import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useSpring, useMotionTemplate } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Zap, Gauge, IndianRupee, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { CARS } from '../data/cars.js';

const socket = io('http://localhost:5000');

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const isPast = location.state?.isPast;
  const pastData = location.state;
  
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const zoomLevel = useMotionValue(1); // dynamic optical zoom scalar
  const [imgBounds, setImgBounds] = useState({ w: 0, h: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleImageMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = (e) => {
    setIsHovering(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setImgBounds({ w: rect.width, h: rect.height });
  };

  const handleWheel = (e) => {
    const currentZoom = zoomLevel.get();
    const newZoom = Math.min(Math.max(1, currentZoom + e.deltaY * -0.002), 4);
    zoomLevel.set(newZoom);
  };

  const frameX = useTransform(mouseX, x => x - 110);
  const frameY = useTransform(mouseY, y => y - 50);
  
  const bgW = useTransform(() => imgBounds.w * zoomLevel.get());
  const bgH = useTransform(() => imgBounds.h * zoomLevel.get());
  const bgSizeStr = useMotionTemplate`${bgW}px ${bgH}px`;

  const bgXLeft = useTransform(() => 50 - (mouseX.get() - 60) * zoomLevel.get());
  const bgYCombined = useTransform(() => 50 - mouseY.get() * zoomLevel.get());
  const bgXRight = useTransform(() => 50 - (mouseX.get() + 60) * zoomLevel.get());

  const bgPosLeft = useMotionTemplate`${bgXLeft}px ${bgYCombined}px`;
  const bgPosRight = useMotionTemplate`${bgXRight}px ${bgYCombined}px`;

  const [car, setCar] = useState(null);
  const [featuredImage, setFeaturedImage] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [liveBid, setLiveBid] = useState('0');
  const [liveBidder, setLiveBidder] = useState('No Bids Yet');
  const [liveHistory, setLiveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch car details
    axios.get('http://localhost:5000/api/cars')
      .then(res => {
        const foundCar = res.data.find(c => c.id.toString() === id.toString());
        if (foundCar) {
          setCar(foundCar);
          setFeaturedImage(foundCar.images[0]);
          // Use currentBid from DB if it exists, otherwise fall back to startingBid
          const displayBid = foundCar.currentBid > 0 ? foundCar.currentBid : foundCar.startingBid;
          setLiveBid(displayBid.toLocaleString());
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Fetch Bids — sort by highest amount to always show the true winning bid
    axios.get('http://localhost:5000/api/bids')
      .then(res => {
        const carBids = res.data
          .filter(b => b.items && b.items.includes(id))
          .sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount)); // highest first
        if (carBids.length > 0) {
          setLiveHistory(carBids.map(b => ({ user: b.bidderName, amount: Number(b.bidAmount).toLocaleString() })).slice(0, 5));
          setLiveBid(Number(carBids[0].bidAmount).toLocaleString()); // always the highest bid
          setLiveBidder(carBids[0].bidderName);
        }
      })
      .catch(console.error);

    socket.emit('join_auction', id);

    socket.on('auction_update', (data) => {
      setLiveBid(Number(data.currentBid).toLocaleString());
      setLiveBidder(data.username);
      setLiveHistory(prev => [{ user: data.username, amount: Number(data.currentBid).toLocaleString() }, ...prev].slice(0, 5));
    });

    return () => {
      socket.off('auction_update');
    };
  }, [id]);

  const handleBid = async () => {
    if (bidAmount) {
      const cleanAmount = bidAmount.replace(/,/g, '').replace(/₹/g, '').trim();
      if (isNaN(cleanAmount) || Number(cleanAmount) <= 0) return showToast('Enter a valid numerical amount!', 'error');
      
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (!token || !username) {
          showToast('Please login to place a bid', 'error');
          return navigate('/login');
        }

        const response = await axios.post('http://localhost:5000/api/bids', {
          bidAmount: Number(cleanAmount),
          items: [id]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update the live bid display immediately
        setLiveBid(Number(cleanAmount).toLocaleString());
        setLiveBidder(username);
        setLiveHistory(prev => [{ user: username, amount: Number(cleanAmount).toLocaleString() }, ...prev].slice(0, 5));
        
        socket.emit('place_bid', { auctionId: id, bidAmount: cleanAmount, username });
        showToast(`🏆 Bid of ₹${Number(cleanAmount).toLocaleString()} placed! You are now the highest bidder!`, 'success');
        setBidAmount('');
      } catch (err) {
        const errData = err.response?.data;
        if (errData?.currentHighest) {
          // Greedy rejection — show exactly what the minimum must be
          const minRequired = errData.currentHighest + 1;
          showToast(errData.message, 'error');
          setBidAmount((errData.currentHighest + 100000).toString()); // pre-fill with a helpful next bid
        } else {
          showToast(errData?.message || 'Failed to place bid! Is the backend running?', 'error');
        }
      }
    } else {
      showToast('Please enter a bid amount!', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '5rem', textAlign: 'center' }}><h2>Loading Car Details...</h2></div>;
  }

  if (!car) {
    return <div style={{ color: 'white', padding: '5rem', textAlign: 'center' }}><h2>Car Not Found</h2></div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main 
        style={{ flex: 1, position: 'relative', display: 'flex', padding: '2rem' }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, rgba(5,10,21,1) 60%)`,
            zIndex: 0, pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: '3rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', width: 'fit-content' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '0.5rem' }}
              >
                {car.make} <br/><span className="text-gold">{car.model}</span>
              </motion.h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
                {car.description}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: 'auto' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} className="text-silver" /> Engine</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{car.engine}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Gauge size={16} className="text-silver" /> Top Speed</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{car.topSpeed}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} className="text-silver" /> Horsepower</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{car.horsepower}</p>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IndianRupee size={16} className="text-silver" /> Est. Value</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.25rem' }}>{car.estValue}</p>
              </div>
            </div>
          </div>

          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }}
              onMouseMove={handleImageMouse}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setIsHovering(false)}
              onWheel={handleWheel}
            >
              <img 
                src={featuredImage} 
                alt="Car" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '50vh', 
                  width: 'auto',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.8))' 
                }} 
              />
              
              <AnimatePresence>
                {isHovering && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    style={{
                      position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
                      x: frameX, y: frameY, // perfectly tracks the mouse without fighting Framer's animate loop
                      width: '220px', height: '100px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      zIndex: 10
                    }}
                  >
                    {/* Proper Left SVG Temple/Leg */}
                    <svg width="80" height="40" viewBox="0 0 80 40" style={{ position: 'absolute', left: '-75px', top: '30px', zIndex: -1 }}>
                      <path d="M 80 15 C 60 15, 30 15, 10 15 C 5 15, 0 20, 0 40" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" style={{ filter: 'drop-shadow(-5px 5px 5px rgba(0,0,0,0.7))' }} />
                    </svg>

                    {/* Left Lens */}
                    <motion.div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      border: '6px solid #111', boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.1)',
                      backgroundImage: `url('${featuredImage}')`, backgroundRepeat: 'no-repeat',
                      backgroundSize: bgSizeStr, 
                      backgroundPosition: bgPosLeft,
                      filter: 'sepia(0.15) hue-rotate(180deg) brightness(0.7) contrast(1.15)',
                      position: 'relative', overflow: 'hidden'
                    }}>
                      {/* Fixed Fake Glare with explicit border-radius to prevent bad shading on edges */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)' }} />
                    </motion.div>

                    {/* Sunglasses Bridge */}
                    <div style={{ width: '20px', height: '6px', background: '#111', borderRadius: '4px', boxShadow: '0 5px 10px rgba(0,0,0,0.5)' }} />

                    {/* Right Lens */}
                    <motion.div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      border: '6px solid #111', boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.1)',
                      backgroundImage: `url('${featuredImage}')`, backgroundRepeat: 'no-repeat',
                      backgroundSize: bgSizeStr, 
                      backgroundPosition: bgPosRight,
                      filter: 'sepia(0.15) hue-rotate(180deg) brightness(0.7) contrast(1.15)',
                      position: 'relative', overflow: 'hidden'
                    }}>
                      {/* Fixed Fake Glare */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)' }} />
                    </motion.div>

                    {/* Proper Right SVG Temple/Leg */}
                    <svg width="80" height="40" viewBox="0 0 80 40" style={{ position: 'absolute', right: '-75px', top: '30px', zIndex: -1 }}>
                      <path d="M 0 15 C 20 15, 50 15, 70 15 C 75 15, 80 20, 80 40" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" style={{ filter: 'drop-shadow(5px 5px 5px rgba(0,0,0,0.7))' }} />
                    </svg>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              {car.images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setFeaturedImage(img)}
                  style={{ 
                    width: '120px', height: '80px', borderRadius: '8px', 
                    overflow: 'hidden', cursor: 'pointer',
                    border: featuredImage === img ? '2px solid var(--color-primary)' : '2px solid transparent',
                    opacity: featuredImage === img ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {isPast ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(255, 50, 50, 0.2)', color: '#ff4d4d', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(255, 50, 50, 0.3)' }}>
                    AUCTION CLOSED
                  </div>
                  <h2 className="text-gold" style={{ fontSize: '3rem', margin: 0 }}>{pastData.price}</h2>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Winning Bid</p>
                  
                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1.5rem 0' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Winner</span>
                      <div style={{ textAlign: 'right' }}>
                        <strong className="text-gold" style={{ display: 'block' }}>{pastData.winner}</strong>
                        {pastData.location && <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{pastData.location}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Closed On</span>
                      <strong>{pastData.date}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                   <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '0.5rem' }}>Current Highest Bid</p>
                      <h2 className="text-gold" style={{ fontSize: '3rem', margin: 0 }}>₹{liveBid}</h2>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>by {liveBidder}</p>
                   </div>

                   <div style={{ height: '1px', background: 'var(--glass-border)' }} />

                   <div>
                     <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Place Your Bid</p>
                     <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px 16px', border: '1px solid var(--glass-border)' }}>
                       <IndianRupee size={18} className="text-silver" />
                       <input type="text" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', width: '100%', outline: 'none', marginLeft: '0.5rem' }}
                       />
                     </div>
                     <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'right' }}>
                       Min. increment: ₹10,00,000
                     </p>
                   </div>

                   <button onClick={handleBid} className="glow-btn" style={{ padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                     Confirm Bid <ArrowUpRight size={20} />
                   </button>
                </>
              )}
             </motion.div>

             {!isPast && (
               <div className="glass-panel" style={{ padding: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: 8, height: 8, background: 'red', borderRadius: '50%', boxShadow: '0 0 10px red' }} /> LIVE History
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {liveHistory.map((h, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: i === 0 ? 'var(--color-text-light)' : 'var(--color-text-muted)' }}>
                       <span>{h.user}</span>
                       <span className={i === 0 ? "text-gold" : ""}>₹{h.amount}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
