import { Globe, Menu, Moon, PawPrint, Sun, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from './Button';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Adopciones', href: '#services' },
    { name: 'Donar', href: '#donate' },
    { name: 'Eventos', href: '#events' },
    { name: 'Nosotros', href: '#footer' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-xl' : 'py-4'
      } bg-primary-600 text-white`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="bg-white text-primary-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <PawPrint size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">Paz Animal</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium hover:text-secondary-200 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-primary-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="flex items-center gap-1 font-medium hover:text-secondary-200">
              <Globe size={18} /> ES
            </button>

            <Button variant="white-outline" size="sm">
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-primary-600 border-t border-primary-700 shadow-xl p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-medium py-2 border-b border-primary-700/30"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 font-medium"
            >
              {darkMode ? (
                <>
                  <Sun size={20} /> Modo Claro
                </>
              ) : (
                <>
                  <Moon size={20} /> Modo Oscuro
                </>
              )}
            </button>
            <Button variant="white-outline" size="sm" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
