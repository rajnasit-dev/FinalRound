import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Shield,
  DollarSign,
  LogOut,
  UserCheck,
  MessageSquare,
  Dumbbell,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { logoutUser } from "../store/slices/authSlice";
import Logo from "../components/Logo";

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/organizer-requests", icon: UserCheck, label: "Organizer Requests" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/sports", icon: Dumbbell, label: "Sports" },
    { to: "/admin/tournaments", icon: Trophy, label: "Tournaments" },
    { to: "/admin/teams", icon: Shield, label: "Teams" },
    { to: "/admin/payments", icon: DollarSign, label: "Payments" },
    { to: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
    { to: "/admin/change-password", icon: Lock, label: "Change Password" },
  ];

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-base-dark dark:border-base">
        <Logo />
        <p className="text-sm text-base dark:text-base-dark mt-2 font-semibold">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-secondary text-white"
                  : "text-text-primary dark:text-text-primary-dark hover:bg-base-dark dark:hover:bg-base"
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-base-dark dark:border-base">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card-background dark:bg-card-background-dark border-b border-base-dark dark:border-base px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Logo />
        </div>
        <p className="text-sm font-semibold text-base dark:text-base-dark">Admin Panel</p>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* Desktop: always visible */}
      <aside className="hidden lg:flex w-64 bg-card-background dark:bg-card-background-dark border-r border-base-dark dark:border-base flex-col sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile: slide-in drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-card-background dark:bg-card-background-dark border-r border-base-dark dark:border-base flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-3">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
