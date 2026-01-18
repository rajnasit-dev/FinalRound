import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card-background dark:bg-card-background-dark border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              SportsHub
            </h3>
            <p className="text-text-primary/70 dark:text-text-primary-dark/70 text-sm leading-relaxed">
              Your ultimate platform for organizing and managing sports tournaments, teams, and matches all in one place.
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
                <Link to="/about" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-primary/70 dark:text-text-primary-dark/70 hover:text-secondary dark:hover:text-secondary-dark transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              Connect With Us
            </h4>
            <div className="space-y-3">
              <p className="text-text-primary/70 dark:text-text-primary-dark/70 text-sm">
                📧 support@sportshub.com
              </p>
              <p className="text-text-primary/70 dark:text-text-primary-dark/70 text-sm">
                📞 +1 (555) 123-4567
              </p>
              <div className="flex gap-3 mt-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-secondary dark:bg-secondary-dark hover:bg-secondary/90 dark:hover:bg-secondary-dark/90 flex items-center justify-center text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-text-primary dark:bg-text-primary-dark hover:bg-text-primary/90 dark:hover:bg-text-primary-dark/90 flex items-center justify-center text-primary dark:text-primary-dark transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-secondary dark:bg-secondary-dark hover:bg-secondary/90 dark:hover:bg-secondary-dark/90 flex items-center justify-center text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
