import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {

  // Get user data and authentication status from Redux store
  const { user, isAuthenticated } = useSelector((state) => state.auth);

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
