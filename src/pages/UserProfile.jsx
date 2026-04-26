import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, CreditCard, Edit3, Save, X, ArrowLeft, Shield, Phone, Mail, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';

const SECTION_STYLE = {
  glass: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  }
};

const inputStyle = (editing) => ({
  width: '100%',
  padding: '10px 14px',
  background: editing ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.03)',
  border: `1px solid ${editing ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: '8px',
  color: editing ? 'white' : 'rgba(255,255,255,0.85)',
  outline: 'none',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  cursor: editing ? 'text' : 'default',
  transition: 'all 0.2s',
});

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {Icon && <Icon size={17} style={{ color: '#D4AF37', marginTop: '2px', flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</span>
        <span style={{ fontSize: '0.95rem', color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)', fontStyle: value ? 'normal' : 'italic' }}>
          {value || 'Not set'}
        </span>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setProfile(res.data);
      setForm(res.data);
    }).catch(() => {
      showToast('Failed to load profile', 'error');
    }).finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(data.user);
      setForm(data.user);
      setEditing(false);
      showToast('Profile updated successfully! ✅', 'success');
    } catch {
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setForm(profile); setEditing(false); };
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2 className="text-gold">Loading Profile...</h2>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/garage')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', background: 'rgba(212,175,55,0.1)', padding: '8px 16px', borderRadius: '25px', border: '1px solid rgba(212,175,55,0.3)', cursor: 'pointer', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> My Garage
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>My Profile</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Manage your account details</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {editing ? (
              <>
                <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                  <X size={16} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="glow-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', opacity: saving ? 0.7 : 1 }}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Left: Avatar + Account Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Avatar Card */}
            <div style={{ ...SECTION_STYLE.glass, alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(5,10,21,0.8) 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #B8860B, #D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
                <User size={44} color="#0a0a0a" />
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>{profile?.username}</h2>
                <span style={{ fontSize: '0.8rem', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', padding: '3px 12px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.25)' }}>
                  {profile?.wonCars?.length >= 3 ? 'VIP Gold' : profile?.wonCars?.length >= 1 ? 'Silver Tier' : 'Collector'}
                </span>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <InfoRow label="Email" value={profile?.email} icon={Mail} />
                <InfoRow label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} icon={Shield} />
              </div>
              <div style={{ width: '100%', padding: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Wallet Balance</div>
                <div className="text-gold" style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{Number(profile?.balance || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Detail Sections */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Personal Details */}
            <div style={SECTION_STYLE.glass}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} className="text-gold" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Personal Information</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {[
                  { label: 'Full Name', key: 'fullName' },
                  { label: 'Phone Number', key: 'phone' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>{label}</label>
                    <input value={form[key] || ''} onChange={set(key)} readOnly={!editing} style={inputStyle(editing)} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>Address</label>
                  <input value={form.address || ''} onChange={set('address')} readOnly={!editing} style={inputStyle(editing)} />
                </div>
                {[
                  { label: 'City', key: 'city' },
                  { label: 'State', key: 'state' },
                  { label: 'Country', key: 'country' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>{label}</label>
                    <input value={form[key] || ''} onChange={set(key)} readOnly={!editing} style={inputStyle(editing)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Details */}
            <div style={SECTION_STYLE.glass}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={18} className="text-gold" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Bank Details</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  🔒 Display Only
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {[
                  { label: 'Bank Name', key: 'bankName' },
                  { label: 'Account Holder', key: 'accountHolder' },
                  { label: 'Account Number', key: 'accountNumber' },
                  { label: 'IFSC / SWIFT Code', key: 'ifscCode' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', letterSpacing: '0.5px' }}>{label}</label>
                    <input
                      value={key === 'accountNumber' && !editing ? (form[key] ? '•••• •••• ' + String(form[key]).slice(-4) : '') : (form[key] || '')}
                      onChange={set(key)} readOnly={!editing}
                      style={inputStyle(editing)}
                    />
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
