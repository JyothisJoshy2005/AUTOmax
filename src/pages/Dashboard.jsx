import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LiveAuctions from '../components/LiveAuctions';
import UpcomingAuctions from '../components/UpcomingAuctions';
import API_BASE from '../config.js';

export default function Dashboard() {
  const username = localStorage.getItem('username') || 'Guest';
  const [activeBidsCount, setActiveBidsCount] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const flagKey = `firstVisit_${username}`;
    if (localStorage.getItem(flagKey) === 'true') {
      setIsFirstVisit(true);
      localStorage.removeItem(flagKey);
    }
  }, [username]);

  useEffect(() => {
    if (!token) return;
    axios.get(API_BASE + '/api/garage', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => setActiveBidsCount(res.data.activeBids?.length || 0))
      .catch(console.error);
  }, [username, token]);

  const greeting = username && username !== 'Guest'
    ? isFirstVisit
      ? <> 🏎️ Welcome to the showroom, <span className="gradient-text">{username}</span>! </>
      : <> 🏁 Back on the track, <span className="gradient-text">{username}</span>. </>
    : <> Welcome to <span className="gradient-text">AUTOmax</span>. </>;

  const subtext = username && username !== 'Guest'
    ? isFirstVisit
      ? 'Your seat is reserved. The engines are ready — start exploring the auctions below.'
      : <> You have <span className="text-gold" style={{fontWeight: 600}}>{activeBidsCount} active bid{activeBidsCount !== 1 ? 's' : ''}</span> live on the auction floor. </>
    : <>Login to start bidding on the world's most exclusive supercars.</>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ padding: '2rem', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {greeting}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
            {subtext}
          </p>
        </motion.div>

        <HeroSection />
        
        <div id="live-auctions" style={{ marginTop: '4rem', paddingTop: '2rem' }}>
          <LiveAuctions />
        </div>

        <div id="upcoming-auctions" style={{ marginTop: '4rem', marginBottom: '4rem', paddingTop: '2rem' }}>
          <UpcomingAuctions />
        </div>
      </main>
    </div>
  );
}
