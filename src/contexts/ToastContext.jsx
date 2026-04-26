import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Dissolve after 4 seconds
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-panel"
              style={{
                padding: '1rem 1.5rem',
                minWidth: '300px',
                background: 'rgba(5, 10, 21, 0.85)',
                backdropFilter: 'blur(12px)',
                border: t.type === 'error' ? '1px solid rgba(255,50,50,0.5)' : '1px solid var(--color-primary)',
                boxShadow: t.type === 'error' ? '0 0 15px rgba(255,0,0,0.3)' : 'var(--glow-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                pointerEvents: 'auto'
              }}
            >
              <h4 className="text-gold" style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                AUTOmax says
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                {t.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
