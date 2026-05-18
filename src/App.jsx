import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CarDetail from './pages/CarDetail';
import Garage from './pages/Garage';
import About from './pages/About';
import SellCar from './pages/SellCar';
import UserProfile from './pages/UserProfile';
import { ToastProvider } from './contexts/ToastContext';
import { SearchProvider } from './contexts/SearchContext';
import { ThemeProvider } from './contexts/ThemeContext';
import API_BASE from './config';

function App() {
  // Wake up Render backend immediately on app load (prevents cold-start delays)
  useEffect(() => {
    fetch(`${API_BASE}/ping`).catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <SearchProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/sell" element={<SellCar />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
