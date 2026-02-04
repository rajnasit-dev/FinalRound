import { 
  Trophy, 
  Users, 
  UserCircle, 
  Calendar,
  MapPin,
  LayoutDashboard,
  Inbox,
  Zap,
  Target,
  Lock,
  DollarSign
} from "lucide-react";

// Player dashboard menu links
export const playerLinks = [
  { name: "My Tournaments", icon: Trophy, url: "/player/tournaments" },
  { name: "My Teams", icon: Users, url: "/player/teams" },
  { name: "Requests", icon: Inbox, url: "/player/requests" },
  { name: "Payments", icon: DollarSign, url: "/player/payments" },
  { name: "Profile", icon: UserCircle, url: "/player/profile" },
  { name: "Change Password", icon: Lock, url: "/player/change-password" },
];

// Team Manager dashboard menu links
export const managerLinks = [
  { name: "My Tournaments", icon: Trophy, url: "/manager/tournaments" },
  { name: "My Teams", icon: Users, url: "/manager/teams" },
  { name: "Requests", icon: Inbox, url: "/manager/requests" },
  { name: "Payments", icon: DollarSign, url: "/manager/payments" },
  { name: "Profile", icon: UserCircle, url: "/manager/profile" },
  { name: "Change Password", icon: Lock, url: "/manager/change-password" },
];

// Tournament Organizer dashboard menu links
export const organizerLinks = [
  { name: "Dashboard", icon: LayoutDashboard, url: "/organizer/dashboard" },
  { name: "Tournaments", icon: Trophy, url: "/organizer/tournaments" },
  { name: "Payments", icon: DollarSign, url: "/organizer/payments" },
  { name: "Profile", icon: UserCircle, url: "/organizer/profile" },
  { name: "Change Password", icon: Lock, url: "/organizer/change-password" },
];

// Get dashboard links based on user role
export const getDashboardLinks = (userRole) => {
  const roleLinks = {
    Player: playerLinks,
    TeamManager: managerLinks,
    TournamentOrganizer: organizerLinks,
  };

  return roleLinks[userRole] || [];
};

// Get role-specific menu links (for sidebar that uses lowercase role strings from backend)
export const getMenuLinks = (userRole) => {
  if (userRole === "player") return playerLinks;
  if (userRole === "manager") return managerLinks;
  if (userRole === "organizer") return organizerLinks;
  return [];
};
