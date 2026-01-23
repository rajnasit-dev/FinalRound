import { 
  Trophy, 
  Users, 
  UserCircle, 
  Calendar,
  MapPin,
  LayoutDashboard,
  Inbox,
  Zap,
  Target
} from "lucide-react";

// Player dashboard menu links
export const playerLinks = [
  { name: "My Tournaments", icon: Trophy, url: "/player/tournaments" },
  { name: "My Teams", icon: Users, url: "/player/teams" },
  { name: "Requests", icon: Inbox, url: "/player/requests" },
  { name: "Profile", icon: UserCircle, url: "/player/profile" },
];

// Team Manager dashboard menu links
export const managerLinks = [
  { name: "My Teams", icon: Users, url: "/manager/teams" },
  { name: "Team Players", icon: Zap, url: "/manager/players" },
  { name: "Requests", icon: Inbox, url: "/manager/requests" },
  { name: "Profile", icon: UserCircle, url: "/manager/profile" },
];

// Tournament Organizer dashboard menu links
export const organizerLinks = [
  { name: "Dashboard", icon: LayoutDashboard, url: "/organizer/dashboard" },
  { name: "Tournaments", icon: Trophy, url: "/organizer/tournaments" },
  { name: "Matches", icon: Calendar, url: "/organizer/matches" },
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
