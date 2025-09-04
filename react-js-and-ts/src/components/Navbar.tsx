import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './theme/theme-toggle';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react'
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  console.log("Navbar: user=", user);

  const Links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold dark:text-white">MySite</span>
          </div>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              {Links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 rounded-md transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <Link
                  to="/admin"
                  className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 rounded-md transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
            </div>
          )}


          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-gray-800 dark:text-white text-sm font-medium">
                  Hello, {user?.email}!
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/register">Sign-up</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu and dark mode toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-white dark:bg-gray-800 transition-colors duration-300">
          {user && (
            Links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-gray-800 dark:text-white px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))
          )}


          {user && (user.role?.name === 'user' || user.role?.name === 'superadmin') && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block text-gray-800 dark:text-white px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Admin
            </Link>
          )}
          {user ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button asChild className="w-full justify-start">
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                >
                  Sign-up
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
