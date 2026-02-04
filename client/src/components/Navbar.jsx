import { NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, User, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getDashboardLinks } from "../config/dashboardLinks";
import LogoutBtn from "./LogoutBtn";
import Logo from "./Logo";
import defaultAvatar from "../assets/defaultAvatar.png";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Navigation links data
  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/tournaments", label: "TOURNAMENTS" },
    { to: "/teams", label: "TEAMS" },
    { to: "/players", label: "PLAYERS" },
    // { to: "/matches", label: "MATCHES" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    const roleLabels = {
      Player: "Player",
      TeamManager: "Team Manager",
      TournamentOrganizer: "Tournament Organizer",
    };
    
    return roleLabels[user?.role] || user?.role;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 shadow-md bg-primary dark:bg-primary-dark transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ height: "var(--navbar-height)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="h-full flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation - Centered Links */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative text-sm font-semibold transition-all duration-300 group ${
                    isActive
                      ? "text-secondary dark:text-secondary-dark"
                      : "hover:text-secondary dark:hover:text-secondary-dark"
                  }`
                }
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary dark:bg-secondary-dark transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card-background dark:bg-card-background-dark hover:bg-opacity-80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <img
                      src={user.avatar || defaultAvatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                      <div className="text-left">
                        <p className="text-sm font-semibold">{user.fullName}</p>
                        <p className="text-xs text-base dark:text-base-dark">{getRoleBadge()}</p>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-card-background dark:bg-card-background-dark rounded-lg shadow-lg border border-base-dark dark:border-base overflow-hidden z-50">
                      <button
                        onClick={() => {
                          // Map role to URL path - show dashboard for admin, profile for others
                          const roleMap = {
                            Admin: "admin",
                            Player: "player",
                            TeamManager: "manager",
                            TournamentOrganizer: "organizer",
                          };
                          const rolePath = roleMap[user?.role] || user?.role.toLowerCase();
                          
                          // Navigate to dashboard for admin, profile for others
                          if (user?.role === "Admin") {
                            navigate(`/${rolePath}/dashboard`);
                          } else {
                            navigate(`/${rolePath}/profile`);
                          }
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-primary dark:hover:bg-primary-dark transition-colors flex items-center gap-2"
                      >
                        <User size={16} />
                        <span>{user?.role === "Admin" ? "Dashboard" : "My Profile"}</span>
                      </button>
                      <LogoutBtn />
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="px-6 py-2 bg-secondary dark:bg-secondary-dark text-white rounded-lg hover:bg-opacity-90 dark:hover:bg-opacity-90 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
                >
                  Login 
                </NavLink>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-card-background dark:hover:bg-card-background-dark transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-accent dark:text-accent-dark" />
                ) : (
                  <Moon className="h-5 w-5 text-text-primary dark:text-text-primary-dark" />
                )}
              </button>
            </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-card-background dark:hover:bg-card-background-dark transition-colors"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-accent dark:text-accent-dark" />
              ) : (
                <Moon className="h-5 w-5 text-text-primary dark:text-text-primary-dark" />
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-card-background dark:hover:bg-card-background-dark transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="md:hidden fixed inset-x-0 bg-primary dark:bg-primary-dark z-50 max-h-[calc(100vh-var(--navbar-height))] overflow-y-auto shadow-xl" style={{ top: "var(--navbar-height)" }}>
              <div className="p-4">
                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-4 mb-4">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={handleNavLinkClick}
                      className={({ isActive }) =>
                        `text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-secondary dark:bg-secondary-dark text-white"
                            : "hover:bg-card-background dark:hover:bg-card-background-dark"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>

            {/* Mobile User Section */}
            {isAuthenticated && user ? (
              <div className="border-t border-base-dark dark:border-base pt-4">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-card-background dark:bg-card-background-dark rounded-lg mb-3">
                      <img
                      src={user.avatar || defaultAvatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-xs text-base dark:text-base-dark">{getRoleBadge()}</p>
                  </div>
                </div>

                {/* Dashboard Menu Links */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-base dark:text-base-dark uppercase mb-2 px-4">Dashboard Menu</p>
                  <div className="flex flex-col gap-1">
                    {getDashboardLinks(user?.role).map((link) => {
                      const Icon = link.icon;
                      return (
                        <NavLink
                          key={link.url}
                          to={link.url}
                          onClick={handleNavLinkClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-secondary dark:bg-secondary-dark text-white"
                                : "hover:bg-card-background dark:hover:bg-card-background-dark"
                            }`
                          }
                        >
                          <Icon size={18} />
                          <span className="font-medium">{link.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile User Actions */}
                <div className="flex flex-col gap-2 border-t border-base-dark dark:border-base pt-3">
                  <LogoutBtn />
                </div>
              </div>
            ) : (
              <div className="border-t border-base-dark dark:border-base pt-4">
                <NavLink
                  to="/login"
                  onClick={handleNavLinkClick}
                  className="block w-full text-center px-6 py-3 bg-secondary dark:bg-secondary-dark text-white rounded-lg hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all duration-200 font-medium"
                >
                  Login
                </NavLink>
              </div>
            )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
