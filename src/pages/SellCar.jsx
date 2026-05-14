import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';
import { UploadCloud, CheckCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../config.js';

export default function SellCar() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    engine: '',
    horsepower: '',
    topSpeed: '',
    description: '',
    startingBid: '',
    durationMinutes: '10'
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 3) {
      showToast('Maximum 3 photos allowed', 'error');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      showToast('Please upload at least 1 photo of the car.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to sell a car', 'error');
        return navigate('/login');
      }

      await axios.post(`${API_BASE}/api/cars`, {
        ...formData,
        images,
        sellerName: localStorage.getItem('username') || 'Guest'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('Car listed successfully! It is now live in the auctions.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error listing car.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ padding: '2rem', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          Sell Your <span className="gradient-text">Masterpiece</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '3rem' }}>
          List your premium vehicle on AUTOmax and let the bidding war begin.
        </p>

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Images Section */}
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Vehicle Photos (Max 3)</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <label style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'all 0.3s' }} className="hover-glow">
                  <UploadCloud size={24} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.8rem' }}>Upload</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Make</label>
              <input type="text" name="make" required placeholder="e.g. Lamborghini" value={formData.make} onChange={handleChange} className="login-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Model</label>
              <input type="text" name="model" required placeholder="e.g. Aventador SVJ" value={formData.model} onChange={handleChange} className="login-input" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Engine</label>
              <input type="text" name="engine" placeholder="e.g. 6.5L V12" value={formData.engine} onChange={handleChange} className="login-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Horsepower</label>
              <input type="text" name="horsepower" placeholder="e.g. 759 hp" value={formData.horsepower} onChange={handleChange} className="login-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Top Speed</label>
              <input type="text" name="topSpeed" placeholder="e.g. 217 mph" value={formData.topSpeed} onChange={handleChange} className="login-input" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Short Description</label>
            <textarea name="description" rows="3" placeholder="Describe the vehicle..." value={formData.description} onChange={handleChange} className="login-input" style={{ resize: 'vertical' }}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Starting Bid (₹)</label>
              <input type="number" name="startingBid" required min="100000" placeholder="e.g. 10000000" value={formData.startingBid} onChange={handleChange} className="login-input" style={{ borderColor: 'var(--color-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Auction Duration (Minutes)</label>
              <input type="number" name="durationMinutes" required min="1" max="1440" placeholder="e.g. 10" value={formData.durationMinutes} onChange={handleChange} className="login-input" style={{ borderColor: 'var(--color-primary)' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="glow-btn" style={{ padding: '16px', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? 'Processing...' : <><CheckCircle size={20} /> List Car for Auction</>}
          </button>
        </form>
      </main>
    </div>
  );
}
