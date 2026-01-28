import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card-background dark:bg-card-background-dark border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              SportsHub
            </h3>
            <p className="text-text-primary/70 dark:text-text-primary-dark/70 text-sm leading-relaxed">
              Your ultimate platform for organizing and managing sports tournaments, teams, and matches all in one place. 
              Connect with players, create teams, participate in tournaments, and manage your sports journey seamlessly. 
              Whether you're a player, team manager, or tournament organizer, SportsHub provides all the tools you need to excel in your sports community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Teams
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-secondary dark:text-secondary-dark mt-1 flex-shrink-0" />
                <a href="mailto:support@sportshub.com" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  support@sportshub.com
                </a>
              </li>
              <li className="flex items-start gap-2 font-num">
                <Phone className="w-4 h-4 text-secondary dark:text-secondary-dark mt-1 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-secondary dark:text-secondary-dark mt-1 flex-shrink-0" />
                <span className="text-text-primary/70 dark:text-text-primary-dark/70 text-sm">
                  Ahmedabad, Gujarat, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-primary/70 dark:text-text-primary-dark/70 text-sm">
              © 2025 SportsHub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-text-primary dark:hover:text-text-primary-dark transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-text-primary dark:hover:text-text-primary-dark transition-colors text-sm">
                Terms
              </Link>
              <Link to="/cookies" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-text-primary dark:hover:text-text-primary-dark transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
