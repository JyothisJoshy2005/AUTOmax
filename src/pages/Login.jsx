import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { User, MapPin, CreditCard, ChevronRight, ChevronLeft, Check, KeyRound } from 'lucide-react';
import API_BASE from '../config.js';

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

function Field({ label, children }) {
  return (
    <div style={{ textAlign: 'left' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function StyledInput({ type = 'text', ...props }) {
  return (
    <input
      type={type}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#D4AF37'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      {...props}
    />
  );
}

export default function Login() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // View mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [fullName, setFullName]       = useState('');
  const [phone, setPhone]             = useState('');
  const [address, setAddress]         = useState('');
  const [city, setCity]               = useState('');
  const [state, setState]             = useState('');
  const [country, setCountry]         = useState('');
  const [bankName, setBankName]           = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode]           = useState('');

  // Forgot password fields
  const [forgotUsername, setForgotUsername]   = useState('');
  const [otpValue, setOtpValue]               = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep]           = useState(1); // 1 = enter username, 2 = enter OTP
  const [maskedEmail, setMaskedEmail]         = useState('');

  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const switchMode = (m) => { setMode(m); setStep(0); setErrorMsg(''); setSuccessMsg(''); setForgotStep(1); setForgotUsername(''); setOtpValue(''); setNewPassword(''); setConfirmPassword(''); setMaskedEmail(''); };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { username, password });
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      localStorage.setItem('balance', data.balance);
      showToast(`🏁 Welcome back, ${data.username}. The engines are warm!`, 'success');
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
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, {
        username: regUsername, email: regEmail, password: regPassword,
        fullName, phone, address, city, state, country,
        bankName, accountNumber, ifscCode, accountHolder,
      });
      localStorage.setItem('username', data.username);
      localStorage.setItem('token', data.token);
      localStorage.setItem('balance', data.balance);
      showToast(`🔥 Welcome aboard, ${data.username}! You're in the most exclusive auction floor.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: send OTP to registered email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!forgotUsername.trim()) return setErrorMsg('Please enter your username.');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/send-otp`, { username: forgotUsername });
      setMaskedEmail(data.maskedEmail);
      setSuccessMsg(data.message);
      setForgotStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP and reset password
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) return setErrorMsg('Passwords do not match.');
    if (newPassword.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/verify-otp-reset`, {
        username: forgotUsername,
        otp: otpValue,
        newPassword,
      });
      setSuccessMsg(data.message);
      showToast('✅ Password reset successfully! Please log in.', 'success');
      setTimeout(() => { switchMode('login'); }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => { e.preventDefault(); setErrorMsg(''); setStep(s => s + 1); };
  const prevStep = () => { setErrorMsg(''); setStep(s => s - 1); };

  const backBtnStyle = {
    flex: '0 0 auto', padding: '12px 18px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'white', borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
  };

  const isRegister = mode === 'register';
  const isForgot   = mode === 'forgot';

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Parallax BG */}
      <motion.div
        animate={{ x: mousePos.x * -30, y: mousePos.y * -30, scale: 1.05 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.5)', zIndex: 0, pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', top: '20%', right: '25%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}
        className="glass-panel"
        style={{ position: 'relative', zIndex: 2, padding: '2.5rem 2.5rem 2rem', width: '100%', maxWidth: isRegister ? '540px' : '460px', textAlign: 'center', boxSizing: 'border-box' }}
      >
        <h1 className="text-gold" style={{ margin: '0 0 4px', fontSize: '2.2rem', letterSpacing: '2px' }}>AUTOmax</h1>
        <p className="gradient-text" style={{ margin: '0 0 1.8rem', fontSize: '1rem', fontStyle: 'italic' }}>
          {isForgot ? '"Reset Your Access"' : isRegister ? '"Join the Elite"' : '"Bid Beyond Limits"'}
        </p>

        {/* Step indicator (register only) */}
        {isRegister && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.8rem' }}>
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
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

        {/* Error / Success messages */}
        {errorMsg && (
          <div style={{ color: '#ff4d4d', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ color: '#4dff91', background: 'rgba(0,255,100,0.08)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {successMsg}
          </div>
        )}

        {/* ═══ LOGIN FORM ═══ */}
        {!isRegister && !isForgot && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Field label="Username">
              <StyledInput required value={username} onChange={e => setUsername(e.target.value)} />
            </Field>
            <Field label="Password">
              <StyledInput type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </Field>

            {/* Forgot Password link */}
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <span
                onClick={() => switchMode('forgot')}
                style={{ color: 'rgba(212,175,55,0.7)', fontSize: '0.82rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#D4AF37'}
                onMouseOut={e => e.target.style.color = 'rgba(212,175,55,0.7)'}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" disabled={loading} className="glow-btn" style={{ padding: '13px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entering...' : 'Enter Showroom'}
            </button>
          </form>
        )}

        {/* ═══ FORGOT PASSWORD — STEP 1: Enter Username ═══ */}
        {isForgot && forgotStep === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <KeyRound size={20} color="#D4AF37" />
              <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Enter your username</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem', textAlign: 'center' }}>
              We'll send a 6-digit OTP to your registered email.
            </p>

            <Field label="Username *">
              <StyledInput required value={forgotUsername} onChange={e => setForgotUsername(e.target.value)} placeholder="Your account username" />
            </Field>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <button type="button" onClick={() => switchMode('login')} style={backBtnStyle}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" disabled={loading} className="glow-btn" style={{ flex: 1, padding: '12px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending OTP...' : '📧 Send OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ═══ FORGOT PASSWORD — STEP 2: Enter OTP + New Password ═══ */}
        {isForgot && forgotStep === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <KeyRound size={20} color="#D4AF37" style={{ marginBottom: '0.4rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                OTP sent to <strong style={{ color: '#D4AF37' }}>{maskedEmail}</strong>
              </p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>Valid for 10 minutes</p>
            </div>

            <Field label="6-Digit OTP *">
              <StyledInput
                required maxLength={6} inputMode="numeric" pattern="[0-9]*"
                value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter OTP from email"
                style={{ ...inputStyle, textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: 700 }}
              />
            </Field>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

            <Field label="New Password *">
              <StyledInput type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
            </Field>
            <Field label="Confirm New Password *">
              <StyledInput type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </Field>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <button type="button" onClick={() => { setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }} style={backBtnStyle}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" disabled={loading} className="glow-btn" style={{ flex: 1, padding: '12px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Verifying...' : '🔑 Reset Password'}
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', margin: '0.25rem 0 0' }}>
              Didn't get it?{' '}
              <span style={{ color: '#D4AF37', cursor: 'pointer' }} onClick={() => { setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}>
                Resend OTP
              </span>
            </p>
          </form>
        )}

        {/* ═══ REGISTER — STEP 0: Account ═══ */}
        {isRegister && step === 0 && (
          <form key="step0" onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Username *">
              <StyledInput required minLength={3} value={regUsername} onChange={e => setRegUsername(e.target.value)} />
            </Field>
            <Field label="Email *">
              <StyledInput type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            </Field>
            <Field label="Password *">
              <StyledInput type="password" required minLength={6} value={regPassword} onChange={e => setRegPassword(e.target.value)} />
            </Field>
            <button type="submit" className="glow-btn" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
              Next: Personal Info <ChevronRight size={18} />
            </button>
          </form>
        )}

        {/* ═══ REGISTER — STEP 1: Personal Details ═══ */}
        {isRegister && step === 1 && (
          <form key="step1" onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Full Name *">
              <StyledInput required value={fullName} onChange={e => setFullName(e.target.value)} />
            </Field>
            <Field label="Phone *">
              <StyledInput type="tel" required value={phone} onChange={e => setPhone(e.target.value)} />
            </Field>
            <Field label="Address *">
              <StyledInput required value={address} onChange={e => setAddress(e.target.value)} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="City *">
                <StyledInput required value={city} onChange={e => setCity(e.target.value)} />
              </Field>
              <Field label="State *">
                <StyledInput required value={state} onChange={e => setState(e.target.value)} />
              </Field>
            </div>
            <Field label="Country *">
              <StyledInput required value={country} onChange={e => setCountry(e.target.value)} />
            </Field>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={prevStep} style={backBtnStyle}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" className="glow-btn" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Next: Bank Details <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ═══ REGISTER — STEP 2: Bank Details ═══ */}
        {isRegister && step === 2 && (
          <form key="step2" onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
              🔒 Bank details are for display purposes only. No real transactions occur.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Bank Name *">
                <StyledInput required value={bankName} onChange={e => setBankName(e.target.value)} />
              </Field>
              <Field label="Account Holder *">
                <StyledInput required value={accountHolder} onChange={e => setAccountHolder(e.target.value)} />
              </Field>
            </div>
            <Field label="Account Number *">
              <StyledInput required value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
            </Field>
            <Field label="IFSC / SWIFT Code *">
              <StyledInput required value={ifscCode} onChange={e => setIfscCode(e.target.value)} />
            </Field>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={prevStep} style={backBtnStyle}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" disabled={loading} className="glow-btn" style={{ flex: 1, padding: '12px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating Account...' : '🏎️ Enter the Showroom'}
              </button>
            </div>
          </form>
        )}

        {/* Footer links */}
        <p style={{ marginTop: '1.5rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)' }}>
          {isForgot ? (
            <>
              Remembered it?{' '}
              <span style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: 600 }} onClick={() => switchMode('login')}>Login Instead</span>
            </>
          ) : isRegister ? (
            <>
              Already a member?{' '}
              <span style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: 600 }} onClick={() => switchMode('login')}>Login Instead</span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: 600 }} onClick={() => switchMode('register')}>Create One</span>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
