import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { fetchCurrentUser } from "../store/slices/authSlice";

const DashboardLayout = () => {

  const dispatch = useDispatch();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get user data and authentication status from Redux store
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Refresh user data from server on mount / page refresh
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let userRole = "";
  // Map full role names to short form for sidebar
  if (user?.role === "Player") userRole = "player";
  if (user?.role === "TeamManager") userRole = "manager";
  if (user?.role === "TournamentOrganizer") userRole = "organizer";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
        
        {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden pt-4 pb-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card-background dark:bg-card-background-dark hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="font-medium text-sm">Menu</span>
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <div
          className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-primary dark:bg-primary-dark z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end p-3">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-base-dark dark:hover:bg-base transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Sidebar
            userRole={userRole}
            userName={user?.fullName || "Guest User"}
            userEmail={user?.email || "guest@sportshub.com"}
            userAvatar={user?.avatar}
            isMobile={true}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* SIDEBAR - Only visible on large screens */}
        <aside className="hidden lg:block py-6">
          <Sidebar
            userRole={userRole}
            userName={user?.fullName || "Guest User"}
            userEmail={user?.email || "guest@sportshub.com"}
            userAvatar={user?.avatar}
            isMobile={false}
            onClose={() => {}}
          />
        </aside>

        {/* MAIN CONTENT */}
        <main className="py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
