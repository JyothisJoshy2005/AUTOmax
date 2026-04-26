import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, ChevronRight } from 'lucide-react';

// ─── Victory Sound via Web Audio API ────────────────────────────────────────
function playVictoryFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const playNote = (freq, startTime, duration, vol = 0.3) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration + 0.1);
    };

    // Victory fanfare: ascending triumphant chord sequence
    playNote(523.25, 0.0,  0.18, 0.25); // C5
    playNote(659.25, 0.15, 0.18, 0.25); // E5
    playNote(783.99, 0.30, 0.18, 0.25); // G5
    playNote(1046.5, 0.45, 0.45, 0.30); // C6 (hold)

    // Harmonics underneath
    playNote(261.63, 0.0,  0.6,  0.15); // C4
    playNote(392.00, 0.0,  0.6,  0.12); // G4

    // Sparkle high notes
    playNote(1318.5, 0.55, 0.12, 0.12); // E6
    playNote(1567.98,0.65, 0.12, 0.12); // G6
    playNote(2093.0, 0.75, 0.30, 0.10); // C7 shimmer

    // Bell-like chime at peak
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.connect(bellGain);
    bellGain.connect(ctx.destination);
    bell.type = 'triangle';
    bell.frequency.setValueAtTime(1760, ctx.currentTime + 0.45);
    bellGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.45);
    bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    bell.start(ctx.currentTime + 0.45);
    bell.stop(ctx.currentTime + 1.6);

  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

// ─── Confetti + Ribbon Canvas ────────────────────────────────────────────────
function CelebrationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const COLORS = ['#D4AF37', '#FFD700', '#FF6B6B', '#4ECDC4', '#A8E6CF', '#C3A6FF', '#FF9F43', '#FFF', '#F8B500'];

    // ── Square confetti ──────────────────────────────────────────────────────
    const confetti = Array.from({ length: 140 }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.5,
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.18,
      vx: (Math.random() - 0.5) * 2.5,
      vy: Math.random() * 3.5 + 1.5,
      isCircle: Math.random() > 0.7,
    }));

    // ── Ribbon streamers from all 4 corners ──────────────────────────────────
    // Each ribbon = a chain of segments that trail behind a leading particle
    const makeRibbon = (startX, startY, dirX, dirY, color) => ({
      points: Array.from({ length: 22 }, (_, i) => ({
        x: startX - dirX * i * 6,
        y: startY - dirY * i * 6,
      })),
      head: { x: startX, y: startY, vx: dirX * (3 + Math.random() * 3), vy: dirY * (3 + Math.random() * 3) },
      color,
      width: Math.random() * 5 + 4,
      wave: Math.random() * 0.15 + 0.05,
      waveOffset: Math.random() * Math.PI * 2,
      age: 0,
    });

    const ribbons = [
      // Top-left corner → right & down
      ...COLORS.slice(0, 3).map((c, i) => makeRibbon(-10, -10, 1 + i * 0.3, 1 + i * 0.2, c)),
      // Top-right corner → left & down
      ...COLORS.slice(3, 6).map((c, i) => makeRibbon(W + 10, -10, -(1 + i * 0.3), 1 + i * 0.2, c)),
      // Bottom-left corner → right & up
      ...COLORS.slice(0, 3).map((c, i) => makeRibbon(-10, H + 10, 1 + i * 0.2, -(1 + i * 0.3), c)),
      // Bottom-right corner → left & up
      ...COLORS.slice(3, 6).map((c, i) => makeRibbon(W + 10, H + 10, -(1 + i * 0.2), -(1 + i * 0.3), c)),
    ];

    let tick = 0;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      tick++;

      // Draw confetti
      confetti.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        if (p.y > H + 30) { p.y = -20; p.x = Math.random() * W; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      // Draw ribbons
      ribbons.forEach(r => {
        r.age++;
        const t = tick * r.wave + r.waveOffset;

        // Move head
        r.head.vy += 0.04; // gravity
        r.head.vx *= 0.99; // air resistance
        r.head.x += r.head.vx + Math.sin(t) * 1.5;
        r.head.y += r.head.vy + Math.cos(t) * 0.8;

        // Shift points: each follows the one before
        for (let i = r.points.length - 1; i > 0; i--) {
          r.points[i].x = r.points[i].x * 0.75 + r.points[i - 1].x * 0.25;
          r.points[i].y = r.points[i].y * 0.75 + r.points[i - 1].y * 0.25;
        }
        r.points[0].x = r.head.x;
        r.points[0].y = r.head.y;

        // Draw ribbon as a smooth path
        if (r.points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = Math.min(1, r.age / 20) * 0.85;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(r.points[0].x, r.points[0].y);
        for (let i = 1; i < r.points.length - 1; i++) {
          const mx = (r.points[i].x + r.points[i + 1].x) / 2;
          const my = (r.points[i].y + r.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(r.points[i].x, r.points[i].y, mx, my);
        }
        ctx.stroke();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 999,
      }}
    />
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function WinCelebrationModal({ wins, onClose }) {
  const [current, setCurrent] = useState(0);
  const win = wins[current];
  const hasMore = current < wins.length - 1;

  // Play fanfare when modal first mounts
  useEffect(() => {
    playVictoryFanfare();
  }, []);

  if (!win) return null;

  return (
    <AnimatePresence>
      <>
        <CelebrationCanvas />

        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
          }}
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.5, y: 60, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -40 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          style={{
            position: 'fixed',
            top: '3vh',
            left: '50%',
            x: '-50%',
            zIndex: 1001,
            width: 'calc(100% - 2rem)',
            maxWidth: '500px',
            maxHeight: '94vh',
            overflowY: 'auto',
            borderRadius: '24px',
            border: '1px solid rgba(212,175,55,0.7)',
            boxShadow: '0 0 100px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.2), 0 40px 80px rgba(0,0,0,0.9)',
            background: 'linear-gradient(160deg, rgba(20,20,40,0.99) 0%, rgba(5,10,21,1) 100%)',
          }}
        >
          {/* Animated gold shimmer top bar */}
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'linear-gradient(90deg, #7B5A00, #D4AF37, #FFD700, #FFF8DC, #FFD700, #D4AF37, #7B5A00)',
              backgroundSize: '300% 100%',
              padding: '13px 0',
              textAlign: 'center',
              fontWeight: 900,
              fontSize: '0.85rem',
              letterSpacing: '4px',
              color: '#0a0a0a',
            }}
          >
            ✦  AUCTION VICTORY  ✦
          </motion.div>

          {/* Car Image */}
          {win.car?.images?.[0] && (
            <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
              <img
                src={win.car.images[0]}
                alt={win.car.make}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(5,10,21,0.95) 100%)',
              }} />

              {/* Pulsing trophy */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: [1, 1.1, 1], rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, scale: { delay: 0.8, duration: 1.2, repeat: Infinity } }}
                style={{
                  position: 'absolute', top: '14px', right: '16px',
                  background: 'linear-gradient(135deg, #B8860B, #FFD700)',
                  borderRadius: '50%', width: '56px', height: '56px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(255,215,0,0.9), 0 0 80px rgba(255,215,0,0.4)',
                }}
              >
                <Trophy size={28} color="#0a0a0a" />
              </motion.div>

              {/* Win count badge */}
              {wins.length > 1 && (
                <div style={{
                  position: 'absolute', top: '14px', left: '16px',
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  color: '#D4AF37',
                  fontWeight: 600,
                }}>
                  {current + 1} / {wins.length}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}
              >
                🎊 Congratulations! You won
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ margin: '6px 0 0', fontSize: '2.3rem', lineHeight: 1.1 }}
              >
                {win.car?.make} <span style={{ color: '#D4AF37' }}>{win.car?.model}</span>
              </motion.h1>
            </div>

            {/* Bid amount */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>Your Winning Bid</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.9rem' }}
              >
                ₹{win.bidAmount?.toLocaleString('en-IN')}
              </motion.span>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}
            >
              {hasMore ? (
                <button
                  onClick={() => { setCurrent(c => c + 1); playVictoryFanfare(); }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #B8860B, #D4AF37)',
                    color: '#0a0a0a',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Next Win <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #B8860B, #D4AF37)',
                    color: '#0a0a0a',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  🏁 View My Collection
                </button>
              )}
            </motion.div>

            {/* Dot nav */}
            {wins.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {wins.map((_, i) => (
                  <div key={i} style={{
                    width: i === current ? '22px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === current ? '#D4AF37' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '50px', right: '16px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              width: '30px', height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
