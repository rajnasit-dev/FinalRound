import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import Spinner from "./components/ui/Spinner";

// Lazy wrapper for cleaner route definitions
const lazyPage = (importFn) => {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>}>
      <Component />
    </Suspense>
  );
};

// Public pages - lazy loaded
const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ChangePassword = lazy(() => import("./pages/auth/ChangePassword"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Tournaments = lazy(() => import("./pages/public/Tournaments"));
const TournamentDetail = lazy(() => import("./pages/public/TournamentDetail"));
const TournamentRegister = lazy(() => import("./pages/public/TournamentRegister"));
const Teams = lazy(() => import("./pages/public/Teams"));
const TeamDetail = lazy(() => import("./pages/public/TeamDetail"));
const Players = lazy(() => import("./pages/public/Players"));
const PlayerDetail = lazy(() => import("./pages/public/PlayerDetail"));
const Matches = lazy(() => import("./pages/public/Matches"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Manager Dashboard Pages - lazy loaded
const ManagerDashboard = lazy(() => import("./pages/Manager/ManagerDashboard"));
const ManagerTeams = lazy(() => import("./pages/Manager/ManagerTeams"));
const CreateTeam = lazy(() => import("./pages/Manager/CreateTeam"));
const EditTeam = lazy(() => import("./pages/Manager/EditTeam"));
const ManagePlayers = lazy(() => import("./pages/Manager/ManagePlayers"));
const AddPlayer = lazy(() => import("./pages/Manager/AddPlayer"));
const ManagerTournaments = lazy(() => import("./pages/Manager/ManagerTournaments"));
const ManagerProfile = lazy(() => import("./pages/Manager/ManagerProfile"));
const EditManagerProfile = lazy(() => import("./pages/Manager/EditManagerProfile"));
const ManagerRequests = lazy(() => import("./pages/Manager/ManagerRequests"));
const ManagerPayments = lazy(() => import("./pages/Manager/ManagerPayments"));

// Player Dashboard Pages - lazy loaded
const PlayerProfile = lazy(() => import("./pages/Player/PlayerProfile"));
const EditPlayerProfile = lazy(() => import("./pages/Player/EditPlayerProfile"));
const PlayerTournaments = lazy(() => import("./pages/Player/PlayerTournaments"));
const TournamentDetails = lazy(() => import("./pages/Player/TournamentDetails"));
const TournamentPayment = lazy(() => import("./pages/Player/TournamentPayment"));
const PaymentReceipt = lazy(() => import("./pages/Player/PaymentReceipt"));
const PlayerTeams = lazy(() => import("./pages/Player/PlayerTeams"));
const PlayerRequests = lazy(() => import("./pages/Player/PlayerRequests"));
const PlayerPayments = lazy(() => import("./pages/Player/PlayerPayments"));

// Organizer Dashboard Pages - lazy loaded
const OrganizerDashboard = lazy(() => import("./pages/Organizer/OrganizerDashboard"));
const OrganizerTournaments = lazy(() => import("./pages/Organizer/OrganizerTournaments"));
const OrganizerPayments = lazy(() => import("./pages/Organizer/OrganizerPayments"));
const OrganizerTeams = lazy(() => import("./pages/Organizer/OrganizerTeams"));
const OrganizerAuthorization = lazy(() => import("./pages/Organizer/OrganizerAuthorization"));
const CreateTournament = lazy(() => import("./pages/Organizer/CreateTournament"));
const EditTournament = lazy(() => import("./pages/Organizer/EditTournament"));
const CreateMatch = lazy(() => import("./pages/Organizer/CreateMatch"));
const EditMatch = lazy(() => import("./pages/Organizer/EditMatch"));
const TournamentFixtures = lazy(() => import("./pages/Organizer/TournamentFixtures"));
const OrganizerTournamentDashboard = lazy(() => import("./pages/Organizer/OrganizerTournamentDashboard"));
const OrganizerProfile = lazy(() => import("./pages/Organizer/OrganizerProfile"));
const EditOrganizerProfile = lazy(() => import("./pages/Organizer/EditOrganizerProfile"));

// Admin Pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const OrganizerRequests = lazy(() => import("./pages/admin/OrganizerRequests"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTournaments = lazy(() => import("./pages/admin/AdminTournaments"));
const AdminTeams = lazy(() => import("./pages/admin/AdminTeams"));
const Revenue = lazy(() => import("./pages/admin/Revenue"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminSports = lazy(() => import("./pages/admin/AdminSports"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const ReportView = lazy(() => import("./pages/admin/ReportView"));

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
      { path: "reports", element: <AdminReports /> },
      { path: "reports/:reportId", element: <ReportView /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },
]);
