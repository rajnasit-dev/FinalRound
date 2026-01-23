import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Shield,
  DollarSign,
  LogOut,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { logoutUser } from "../store/slices/authSlice";
import Logo from "../components/Logo";

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/organizer-requests", icon: UserCheck, label: "Organizer Requests" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/tournaments", icon: Trophy, label: "Tournaments" },
    { to: "/admin/teams", icon: Shield, label: "Teams" },
    { to: "/admin/revenue", icon: DollarSign, label: "Revenue" },
    { to: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <div className="min-h-screen bg-primary dark:bg-primary-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card-background dark:bg-card-background-dark border-r border-base-dark dark:border-base flex flex-col">
        <div className="p-6 border-b border-base-dark dark:border-base">
          <Logo />
          <p className="text-sm text-base dark:text-base-dark mt-2 font-semibold">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
