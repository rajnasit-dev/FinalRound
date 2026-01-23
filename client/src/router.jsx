import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Tournaments from "./pages/public/Tournaments";
import TournamentDetail from "./pages/public/TournamentDetail";
import TournamentRegister from "./pages/public/TournamentRegister";
import Teams from "./pages/public/Teams";
import TeamDetail from "./pages/public/TeamDetail";
import Players from "./pages/public/Players";
import PlayerDetail from "./pages/public/PlayerDetail";
import Matches from "./pages/public/Matches";
import MatchDetail from "./pages/public/MatchDetail";
import NotFound from "./pages/public/NotFound";

// Manager Dashboard Pages
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import ManagerTeams from "./pages/Manager/ManagerTeams";
import CreateTeam from "./pages/Manager/CreateTeam";
import EditTeam from "./pages/Manager/EditTeam";
import ManagerPlayers from "./pages/Manager/ManagerPlayers";
import ManagerProfile from "./pages/Manager/ManagerProfile";
import EditManagerProfile from "./pages/Manager/EditManagerProfile";
import ManagerRequests from "./pages/Manager/ManagerRequests";

// Player Dashboard Pages
import PlayerProfile from "./pages/Player/PlayerProfile";
import EditPlayerProfile from "./pages/Player/EditPlayerProfile";
import PlayerTournaments from "./pages/Player/PlayerTournaments";
import TournamentDetails from "./pages/Player/TournamentDetails";
import TournamentPayment from "./pages/Player/TournamentPayment";
import PaymentReceipt from "./pages/Player/PaymentReceipt";
import PlayerTeams from "./pages/Player/PlayerTeams";
import PlayerRequests from "./pages/Player/PlayerRequests";

// Organizer Dashboard Pages
import OrganizerDashboard from "./pages/Organizer/OrganizerDashboard";
import OrganizerTournaments from "./pages/Organizer/OrganizerTournaments";
import CreateTournament from "./pages/Organizer/CreateTournament";
import EditTournament from "./pages/Organizer/EditTournament";
import OrganizerMatches from "./pages/Organizer/OrganizerMatches";
import CreateMatch from "./pages/Organizer/CreateMatch";
import EditMatch from "./pages/Organizer/EditMatch";
import TournamentFixtures from "./pages/Organizer/TournamentFixtures";
import OrganizerTournamentDashboard from "./pages/Organizer/OrganizerTournamentDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerRequests from "./pages/admin/OrganizerRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminTeams from "./pages/admin/AdminTeams";
import Revenue from "./pages/admin/Revenue";
import AdminFeedback from "./pages/admin/AdminFeedback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public Routes
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "tournaments", element: <Tournaments /> },
      { path: "tournaments/:id", element: <TournamentDetail /> },
      { path: "tournaments/:id/register", element: <TournamentRegister /> },
      { path: "payments/:paymentId/receipt", element: <PaymentReceipt /> },
      { path: "teams", element: <Teams /> },
      { path: "teams/:id", element: <TeamDetail /> },
      { path: "players", element: <Players /> },
      { path: "players/:id", element: <PlayerDetail /> },
      { path: "matches", element: <Matches /> },
      { path: "matches/:id", element: <MatchDetail /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      
      // Dashboard Routes (nested under RootLayout but with DashboardLayout)
      {
        path: "player",
        element: <DashboardLayout />,
        children: [
          { path: "tournaments", element: <PlayerTournaments /> },
          { path: "tournaments/:id", element: <TournamentDetails /> },
          { path: "tournaments/:id/payment", element: <TournamentPayment /> },
          { path: "payments/:paymentId/receipt", element: <PaymentReceipt /> },
          { path: "teams", element: <PlayerTeams /> },
          { path: "requests", element: <PlayerRequests /> },
          { path: "profile", element: <PlayerProfile /> },
          { path: "profile/edit", element: <EditPlayerProfile /> },
        ],
      },
      {
        path: "manager",
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: <ManagerDashboard /> },
          { path: "teams", element: <ManagerTeams /> },
          { path: "teams/create", element: <CreateTeam /> },
          { path: "teams/:teamId/edit", element: <EditTeam /> },
          { path: "players", element: <ManagerPlayers /> },
          { path: "requests", element: <ManagerRequests /> },
          { path: "profile", element: <ManagerProfile /> },
          { path: "profile/edit", element: <EditManagerProfile /> },
        ],
      },
      {
        path: "organizer",
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: <OrganizerDashboard /> },
          { path: "tournaments", element: <OrganizerTournaments /> },
          { path: "tournaments/create", element: <CreateTournament /> },
          { path: "tournaments/:tournamentId", element: <OrganizerTournamentDashboard /> },
          { path: "tournaments/:tournamentId/edit", element: <EditTournament /> },
          { path: "tournaments/:tournamentId/fixtures", element: <TournamentFixtures /> },
          { path: "matches", element: <OrganizerMatches /> },
          { path: "matches/create", element: <CreateMatch /> },
          { path: "matches/:matchId/edit", element: <EditMatch /> },
        ],
      },
      
      { path: "*", element: <NotFound /> },
    ],
  },
  // Admin Routes (separate layout)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "organizer-requests", element: <OrganizerRequests /> },
      { path: "users", element: <AdminUsers /> },
      { path: "tournaments", element: <AdminTournaments /> },
      { path: "teams", element: <AdminTeams /> },
      { path: "revenue", element: <Revenue /> },
      { path: "feedback", element: <AdminFeedback /> },
    ],
  },
]);
