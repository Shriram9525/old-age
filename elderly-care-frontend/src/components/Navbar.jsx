import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ActivitySquare, CalendarHeart, MessageCircleHeart,
  BrainCircuit, AlertTriangle, LogOut, HeartPulse
} from 'lucide-react';

function Navbar({ setToken }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
        <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <motion.nav
      className="top-navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 70, damping: 15 }}
    >
      <div className="nav-brand">
        <HeartPulse size={40} color="#FF0505" />
        <span style={{ fontWeight: 'bold', fontSize: '1.6rem', color: 'white', marginLeft: '12px' }}>CareAI</span>
      </div>

      <div className="nav-links">
        <NavItem to="/" icon={ActivitySquare} label="Dashboard" />
        <NavItem to="/medications" icon={CalendarHeart} label="Medications" />
        <NavItem to="/chatbot" icon={MessageCircleHeart} label="Chatbot" />
        <NavItem to="/games" icon={BrainCircuit} label="Mind Care" />
        <NavItem to="/alerts" icon={AlertTriangle} label="Alerts" />
      </div>

      <div className="nav-actions">
        <button className="nav-logout-btn" onClick={handleLogout}>
          <LogOut size={28} />
          <span>Logout</span>
        </button>
      </div>
    </motion.nav>
  );
}

export default Navbar;
