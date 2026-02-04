import { Link, useLocation } from "react-router-dom";
import { Award } from "lucide-react";
import { getMenuLinks } from "../config/dashboardLinks";
import LogoutBtn from "./LogoutBtn";

const Sidebar = ({ userRole, isMobile = false, onClose }) => {
  // Get the current page URL
  const location = useLocation();
  const currentURL = location.pathname;

  // Handle link click - close mobile menu if on mobile
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Decide which title to show based on user role
  let title = "Dashboard";
  if (userRole === "player") title = "Player Portal";
  if (userRole === "manager") title = "Manager Portal";
  if (userRole === "organizer") title = "Organizer Portal";

  // Get menu links based on user role
  const menuLinks = getMenuLinks(userRole);

  return (
    <aside className="sticky top-0 w-72 flex flex-col p-4 lg:block">
      <div className="h-[80vh] mt-8 bg-card-background dark:bg-card-background-dark rounded-2xl shadow-lg flex flex-col">
      
        {/* TOP SECTION - Logo and Menu */}
        <div className="flex-1 flex flex-col p-6">
          
          {/* Logo and Title at the top */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-bold text-xl text-text-primary dark:text-text-primary-dark">
              {title}
            </h2>
          </div>

        {/* Menu Links */}
        <nav className="space-y-1">
          {menuLinks.map((link) => {
            const Icon = link.icon;
            const isCurrentPage = currentURL === link.url;
            
            return (
              <Link
                key={link.url}
                to={link.url}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isCurrentPage 
                    ? "bg-text-primary dark:bg-text-primary-dark text-text-secondary dark:text-text-secondary-dark shadow-md" 
                    : "text-base dark:text-base-dark hover:bg-primary dark:hover:bg-primary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
                  }
                `}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="font-medium text-[15px]">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="p-6 border-t border-base/10 dark:border-base-dark/10">
          <LogoutBtn />
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;
