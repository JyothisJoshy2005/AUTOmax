import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Award } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function About() {
  const stats = [
    { label: "Active Users", value: "50K+" },
    { label: "Vehicles Sold", value: "12K+" },
    { label: "Total Volume", value: "₹12,000 Cr" },
    { label: "Global Offices", value: "14" },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ padding: '4rem 2rem', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            Redefining the <span className="text-gold">Automotive Exchange</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
            AUTOmax is the premier global platform for acquiring the most exclusive and highly sought-after vehicles. 
            We combine cutting-edge auction technology with unparalleled automotive expertise to deliver a seamless, transparent, and exhilarating bidding experience.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {[
            { icon: <Globe size={24} className="text-gold" />, title: "Global Reach", desc: "Access inventory from elite collectors and dealerships worldwide, without geographical borders." },
            { icon: <Zap size={24} className="text-gold" />, title: "Real-Time Bidding", desc: "Our proprietary WebSockets engine ensures sub-millisecond bid execution for a true live auction feel." },
            { icon: <Shield size={24} className="text-gold" />, title: "Verified Assets", desc: "Every vehicle undergoes a rigorous 200-point inspection and provenance verification." },
            { icon: <Award size={24} className="text-gold" />, title: "White-Glove Service", desc: "From bidding to doorstep delivery, our concierge team handles every detail securely." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-panel"
              style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-panel"
          style={{ 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(5,10,21,1) 100%)',
            border: '1px solid var(--glass-border)'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>By The Numbers</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span className="text-gold" style={{ fontSize: '3rem', fontWeight: 700 }}>{stat.value}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
