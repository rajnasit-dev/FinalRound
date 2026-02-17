import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// pages
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ChangePassword from "./pages/auth/ChangePassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Tournaments from "./pages/public/Tournaments";
import TournamentDetail from "./pages/public/TournamentDetail";
import TournamentRegister from "./pages/public/TournamentRegister";
import Teams from "./pages/public/Teams";
import TeamDetail from "./pages/public/TeamDetail";
import Players from "./pages/public/Players";
import PlayerDetail from "./pages/public/PlayerDetail";
import Matches from "./pages/public/Matches";
import NotFound from "./pages/public/NotFound";

// Manager Dashboard Pages
import ManagerDashboard from "./pages/Manager/ManagerDashboard";
import ManagerTeams from "./pages/Manager/ManagerTeams";
import CreateTeam from "./pages/Manager/CreateTeam";
import EditTeam from "./pages/Manager/EditTeam";
import ManagePlayers from "./pages/Manager/ManagePlayers";
import AddPlayer from "./pages/Manager/AddPlayer";
import ManagerTournaments from "./pages/Manager/ManagerTournaments";
import ManagerProfile from "./pages/Manager/ManagerProfile";
import EditManagerProfile from "./pages/Manager/EditManagerProfile";
import ManagerRequests from "./pages/Manager/ManagerRequests";
import ManagerPayments from "./pages/Manager/ManagerPayments";

// Player Dashboard Pages
import PlayerProfile from "./pages/Player/PlayerProfile";
import EditPlayerProfile from "./pages/Player/EditPlayerProfile";
import PlayerTournaments from "./pages/Player/PlayerTournaments";
import TournamentDetails from "./pages/Player/TournamentDetails";
import TournamentPayment from "./pages/Player/TournamentPayment";
import PaymentReceipt from "./pages/Player/PaymentReceipt";
import PlayerTeams from "./pages/Player/PlayerTeams";
import PlayerRequests from "./pages/Player/PlayerRequests";
import PlayerPayments from "./pages/Player/PlayerPayments";

// Organizer Dashboard Pages
import OrganizerDashboard from "./pages/Organizer/OrganizerDashboard";
import OrganizerTournaments from "./pages/Organizer/OrganizerTournaments";
import OrganizerPayments from "./pages/Organizer/OrganizerPayments";
import OrganizerTeams from "./pages/Organizer/OrganizerTeams";
import OrganizerAuthorization from "./pages/Organizer/OrganizerAuthorization";
import CreateTournament from "./pages/Organizer/CreateTournament";
import EditTournament from "./pages/Organizer/EditTournament";
import CreateMatch from "./pages/Organizer/CreateMatch";
import EditMatch from "./pages/Organizer/EditMatch";
import TournamentFixtures from "./pages/Organizer/TournamentFixtures";
import OrganizerTournamentDashboard from "./pages/Organizer/OrganizerTournamentDashboard";
import OrganizerProfile from "./pages/Organizer/OrganizerProfile";
import EditOrganizerProfile from "./pages/Organizer/EditOrganizerProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerRequests from "./pages/admin/OrganizerRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminTeams from "./pages/admin/AdminTeams";
import Revenue from "./pages/admin/Revenue";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminSports from "./pages/admin/AdminSports";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public Routes
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "tournaments", element: <Tournaments /> },
      { path: "tournaments/:id", element: <TournamentDetail /> },
      { path: "tournaments/:id/register", element: <TournamentRegister /> },
      { path: "payments/:paymentId/receipt", element: <PaymentReceipt /> },
      { path: "teams", element: <Teams /> },
      { path: "teams/:id", element: <TeamDetail /> },
      { path: "players", element: <Players /> },
      { path: "players/:id", element: <PlayerDetail /> },
      { path: "matches", element: <Matches /> },
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
          { path: "payments", element: <PlayerPayments /> },
          { path: "payments/:paymentId/receipt", element: <PaymentReceipt /> },
          { path: "teams", element: <PlayerTeams /> },
          { path: "requests", element: <PlayerRequests /> },
          { path: "profile", element: <PlayerProfile /> },
          { path: "profile/edit", element: <EditPlayerProfile /> },
          { path: "change-password", element: <ChangePassword /> },
        ],
      },
      {
        path: "manager",
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: <ManagerDashboard /> },
          { path: "tournaments", element: <ManagerTournaments /> },
          { path: "teams", element: <ManagerTeams /> },
          { path: "teams/create", element: <CreateTeam /> },
          { path: "teams/:teamId/edit", element: <EditTeam /> },
          { path: "teams/:teamId/players", element: <ManagePlayers /> },
          { path: "teams/:teamId/add-player", element: <AddPlayer /> },
          { path: "requests", element: <ManagerRequests /> },
          { path: "payments", element: <ManagerPayments /> },
          { path: "profile", element: <ManagerProfile /> },
          { path: "profile/edit", element: <EditManagerProfile /> },
          { path: "change-password", element: <ChangePassword /> },
        ],
      },
      {
        path: "organizer",
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: <OrganizerDashboard /> },
          { path: "authorization", element: <OrganizerAuthorization /> },
          { path: "tournaments", element: <OrganizerTournaments /> },
          { path: "tournaments/create", element: <CreateTournament /> },
          { path: "tournaments/:tournamentId", element: <OrganizerTournamentDashboard /> },
          { path: "tournaments/:tournamentId/edit", element: <EditTournament /> },
          { path: "tournaments/:tournamentId/fixtures", element: <TournamentFixtures /> },
          { path: "tournaments/:tournamentId/fixtures/create", element: <CreateMatch /> },
          { path: "matches/:matchId/edit", element: <EditMatch /> },
          { path: "payments", element: <OrganizerPayments /> },
          { path: "teams", element: <OrganizerTeams /> },
          { path: "profile", element: <OrganizerProfile /> },
          { path: "profile/edit", element: <EditOrganizerProfile /> },
          { path: "change-password", element: <ChangePassword /> },
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
      { path: "payments", element: <AdminPayments /> },
      { path: "feedback", element: <AdminFeedback /> },
      { path: "sports", element: <AdminSports /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },
]);
