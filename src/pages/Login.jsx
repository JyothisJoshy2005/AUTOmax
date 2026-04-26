import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { User, MapPin, CreditCard, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: 'white',
  outline: 'none',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  minWidth: 0,
  transition: 'border-color 0.3s',
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.82rem',
  letterSpacing: '0.5px',
};

const STEPS = [
  { icon: User,       label: 'Account'  },
  { icon: MapPin,     label: 'Personal' },
  { icon: CreditCard, label: 'Banking'  },
];

export default function Login() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 0 — Account credentials
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Step 1 — Personal info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [address, setAddress]   = useState('');
  const [city, setCity]         = useState('');
  const [state, setState]       = useState('');
  const [country, setCountry]   = useState('');

  // Step 2 — Bank details
  const [bankName, setBankName]         = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode]           = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Reset to step 0 when switching between login/register
  const toggleMode = () => { setIsRegister(r => !r); setStep(0); setErrorMsg(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      localStorage.setItem('balance', data.balance);
      showToast(`🏁 Welcome back, ${data.username}. The engines are warm and the showroom awaits.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        username, email, password,
        fullName, phone, address, city, state, country,
        bankName, accountNumber, ifscCode, accountHolder,
      });
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      localStorage.setItem('balance', data.balance);
      showToast(`🔥 Welcome aboard, ${data.username}! Tighten your seatbelts — you're now in the most exclusive auction floor on the planet.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
      setStep(0); // send back to first step on error
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => { e.preventDefault(); setErrorMsg(''); setStep(s => s + 1); };
  const prevStep = () => { setErrorMsg(''); setStep(s => s - 1); };

  const Field = ({ label, children }) => (
    <div style={{ textAlign: 'left' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Parallax BG */}
      <motion.div animate={{ x: mousePos.x * -30, y: mousePos.y * -30, scale: 1.05 }} transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.5)', zIndex: 0 }}
      />
      <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', top: '20%', right: '25%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }}
      />

      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}
        className="glass-panel"
        style={{ position: 'relative', zIndex: 2, padding: '2.5rem 2.5rem 2rem', width: '100%', maxWidth: isRegister ? '540px' : '440px', textAlign: 'center', overflow: 'hidden', boxSizing: 'border-box' }}
      >
        <h1 className="text-gold" style={{ margin: '0 0 4px', fontSize: '2.2rem', letterSpacing: '2px' }}>AUTOmax</h1>
        <p className="gradient-text" style={{ margin: '0 0 1.8rem', fontSize: '1rem', fontStyle: 'italic' }}>
          {isRegister ? '"Join the Elite"' : '"Bid Beyond Limits"'}
        </p>

        {/* ── Step indicator (register only) ── */}
        {isRegister && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0', marginBottom: '1.8rem' }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: done ? 'var(--color-primary)' : active ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${done || active ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                    }}>
                      {done ? <Check size={16} color="#000" /> : <Icon size={16} color={active ? '#D4AF37' : 'rgba(255,255,255,0.3)'} />}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: active ? '#D4AF37' : 'rgba(255,255,255,0.3)', fontWeight: active ? 600 : 400 }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', margin: '0 8px', marginBottom: '20px', transition: 'background 0.3s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {errorMsg && <div style={{ color: '#ff4d4d', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>{errorMsg}</div>}

        {/* ═══ LOGIN FORM ═══ */}
        {!isRegister && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Field label="Username">
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </Field>
            <Field label="Password">
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
            </Field>
            <button type="submit" disabled={loading} className="glow-btn" style={{ padding: '13px', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entering...' : 'Enter Showroom'}
            </button>
          </form>
        )}

        {/* ═══ REGISTER — STEP 0: Account ═══ */}
        {isRegister && step === 0 && (
          <AnimatePresence mode="wait">
            <motion.form key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Username *">
                <input type="text" required minLength={3} value={username} onChange={e => setUsername(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Email *">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Password *">
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <button type="submit" className="glow-btn" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
                Next: Personal Info <ChevronRight size={18} />
              </button>
            </motion.form>
          </AnimatePresence>
        )}

        {/* ═══ REGISTER — STEP 1: Personal Details ═══ */}
        {isRegister && step === 1 && (
          <AnimatePresence mode="wait">
            <motion.form key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Full Name *">
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Phone *">
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Address *">
                <input type="text" required value={address} onChange={e => setAddress(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="City *">
                  <input type="text" required value={city} onChange={e => setCity(e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
                <Field label="State *">
                  <input type="text" required value={state} onChange={e => setState(e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
              </div>
              <Field label="Country *">
                <input type="text" required value={country} onChange={e => setCountry(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={prevStep} style={{ flex: '0 0 auto', padding: '12px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" className="glow-btn" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Next: Bank Details <ChevronRight size={18} />
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        )}

        {/* ═══ REGISTER — STEP 2: Bank Details ═══ */}
        {isRegister && step === 2 && (
          <AnimatePresence mode="wait">
            <motion.form key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                🔒 Bank details are for display purposes only. No real transactions occur.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Bank Name *">
                  <input type="text" required value={bankName} onChange={e => setBankName(e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
                <Field label="Account Holder *">
                  <input type="text" required value={accountHolder} onChange={e => setAccountHolder(e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                </Field>
              </div>
              <Field label="Account Number *">
                <input type="text" required value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="IFSC / SWIFT Code *">
                <input type="text" required value={ifscCode} onChange={e => setIfscCode(e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={prevStep} style={{ flex: '0 0 auto', padding: '12px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" disabled={loading} className="glow-btn" style={{ flex: 1, padding: '12px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating Account...' : '🏎️ Enter the Showroom'}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
          {isRegister ? 'Already a member? ' : "Don't have an account? "}
          <span style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: 600 }} onClick={toggleMode}>
            {isRegister ? 'Login Instead' : 'Create One'}
          </span>
        </p>
      </motion.div>
    </div>
  );
}
