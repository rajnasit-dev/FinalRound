import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Award } from "lucide-react";
import { getMenuLinks } from "../config/dashboardLinks";
import { deleteAccount } from "../store/slices/authSlice";
import LogoutBtn from "./LogoutBtn";
import { toast } from "react-hot-toast";

const Sidebar = ({ userRole, isMobile = false, onClose }) => {
  // Get the current page URL
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentURL = location.pathname;

  // Handle link click - close mobile menu if on mobile
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This will permanently remove your account and all related data. This action cannot be undone.")) {
      return;
    }
    try {
      await dispatch(deleteAccount()).unwrap();
      toast.success("Your account has been deleted successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err || "Failed to delete account.");
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

            // Handle action links (like Delete Account)
            if (link.action) {
              return (
                <button
                  key={link.action}
                  onClick={() => {
                    if (link.action === "deleteAccount") handleDeleteAccount();
                    if (isMobile && onClose) onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Icon size={20} strokeWidth={2} />
                  <span className="font-medium text-[15px]">{link.name}</span>
                </button>
              );
            }

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
