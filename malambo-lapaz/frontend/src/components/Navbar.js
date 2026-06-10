import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaHome, FaCalendarAlt, FaStore, FaTachometerAlt, FaInfoCircle, FaEnvelope, FaSignInAlt } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cerrarMenu = () => setIsOpen(false);

  // Enlaces de navegación
  const navLinks = [
    { name: 'Inicio', href: '/', icon: <FaHome /> },
    { name: 'Clases', href: '/#clases', icon: <FaCalendarAlt /> },
    { name: 'Horarios', href: '/#horarios', icon: <FaCalendarAlt /> },
    { name: 'Disciplinas', href: '/#disciplinas', icon: <FaInfoCircle /> },
    { name: 'Profesores', href: '/#profesores', icon: <FaUser /> },
    { name: 'Nosotros', href: '/#nosotros', icon: <FaInfoCircle /> },
    { name: 'Noticias', href: '/#noticias', icon: <FaEnvelope /> },
    { name: 'Eventos', href: '/eventos', icon: <FaCalendarAlt /> },
    { name: 'Tienda', href: '/tienda', icon: <FaStore /> },
    { name: 'Dashboard', href: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Logs', href: '/logs', icon: <FaInfoCircle /> },
  ];

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        cerrarMenu();
      }
    } else {
      cerrarMenu();
    }
  };

  return (
    <>
      {/* Navbar principal */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(15px)',
        padding: scrolled ? '0.8rem 2rem' : '1.2rem 2rem',
        transition: 'all 0.3s ease',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }} onClick={cerrarMenu}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '45px',
                height: '45px',
                background: 'linear-gradient(135deg, #c9a03d, #8b6914)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.3rem' }}>M</span>
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.3rem',
                  fontWeight: '300',
                  letterSpacing: '2px',
                  color: 'white',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  MALAMBO
                </h1>
                <p style={{
                  fontSize: '0.7rem',
                  letterSpacing: '3px',
                  color: '#c9a03d',
                  margin: 0
                }}>
                  BALLET | LA PAZ
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Menu (visible en pantallas grandes) */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            '@media (max-width: 1024px)': { display: 'none' }
          }} className="desktop-menu">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#')) {
                    e.preventDefault();
                    const element = document.querySelector(link.href.substring(1));
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  letterSpacing: '1px',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c9a03d'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {/* Login/Admin button */}
            <Link
              to="/login"
              style={{
                background: 'transparent',
                border: '1.5px solid #c9a03d',
                padding: '8px 20px',
                borderRadius: '30px',
                color: '#c9a03d',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaUser size={12} />
              {isLoggedIn ? 'Admin' : 'Acceso'}
            </Link>
          </div>

          {/* Botón Hamburguesa (visible en móvil) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.8rem',
              cursor: 'pointer',
              display: 'none'
            }}
            className="menu-btn"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Menú Hamburguesa desplegable (móvil) */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '300px',
        height: '100vh',
        background: 'rgba(10, 10, 10, 0.98)',
        backdropFilter: 'blur(20px)',
        zIndex: 999,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        padding: '80px 25px 30px 25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
        overflowY: 'auto'
      }}>
        {navLinks.map(link => (
          <Link
            key={link.name}
            to={link.href}
            onClick={(e) => {
              if (link.href.startsWith('/#')) {
                e.preventDefault();
                const element = document.querySelector(link.href.substring(1));
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }
              setIsOpen(false);
            }}
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
        
        <Link
          to="/login"
          onClick={() => setIsOpen(false)}
          style={{
            background: 'linear-gradient(135deg, #c9a03d, #8b6914)',
            padding: '14px',
            borderRadius: '30px',
            color: 'white',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: '600',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <FaSignInAlt />
          {isLoggedIn ? 'Panel Administrativo' : 'Iniciar Sesión'}
        </Link>
      </div>

      {/* CSS para responsive */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-menu {
            display: none !important;
          }
          .menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;