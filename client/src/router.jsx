import { createBrowserRouter, isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { lazy } from "react";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

const CHUNK_LOAD_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed/i;

const loadWithRetry = async (importFn) => {
  const refreshKey = "sportshub:chunk-reload-attempted";

  try {
    const module = await importFn();
    sessionStorage.removeItem(refreshKey);
    return module;
  } catch (error) {
    const message = error?.message || "";
    const shouldForceReload = CHUNK_LOAD_ERROR_PATTERN.test(message);
    const hasReloaded = sessionStorage.getItem(refreshKey) === "true";

    if (shouldForceReload && !hasReloaded) {
      sessionStorage.setItem(refreshKey, "true");
      window.location.reload();
      return new Promise(() => {});
    }

    throw error;
  }
};

const lazyPage = (importFn) => lazy(() => loadWithRetry(importFn));

const RouteErrorFallback = () => {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";

  const errorMessage =
    error?.message ||
    (isRouteErrorResponse(error) ? error.data?.message : "") ||
    "Please refresh the page and try again.";

  const isChunkLoadError = CHUNK_LOAD_ERROR_PATTERN.test(errorMessage);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark p-6 sm:p-8 text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-primary-dark">{title}</h1>
        <p className="text-base dark:text-base-dark">
          {isChunkLoadError
            ? "A new version of the app was deployed. Reload to get the latest files."
            : errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-secondary text-white hover:opacity-90 transition-opacity"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-base-dark dark:border-base text-text-primary dark:text-text-primary-dark hover:bg-base-dark dark:hover:bg-base transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

// Public pages - lazy loaded
const Home = lazyPage(() => import("./pages/public/Home"));
const Login = lazyPage(() => import("./pages/auth/Login"));
const Register = lazyPage(() => import("./pages/auth/Register"));
const VerifyEmail = lazyPage(() => import("./pages/auth/VerifyEmail"));
const ChangePassword = lazyPage(() => import("./pages/auth/ChangePassword"));
const ForgotPassword = lazyPage(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazyPage(() => import("./pages/auth/ResetPassword"));
const Tournaments = lazyPage(() => import("./pages/public/Tournaments"));
const TournamentDetail = lazyPage(() => import("./pages/public/TournamentDetail"));
const TournamentRegister = lazyPage(() => import("./pages/public/TournamentRegister"));
const Teams = lazyPage(() => import("./pages/public/Teams"));
const TeamDetail = lazyPage(() => import("./pages/public/TeamDetail"));
const Players = lazyPage(() => import("./pages/public/Players"));
const PlayerDetail = lazyPage(() => import("./pages/public/PlayerDetail"));
const Matches = lazyPage(() => import("./pages/public/Matches"));
const NotFound = lazyPage(() => import("./pages/public/NotFound"));

// Manager Dashboard Pages - lazy loaded
const ManagerDashboard = lazyPage(() => import("./pages/Manager/ManagerDashboard"));
const ManagerTeams = lazyPage(() => import("./pages/Manager/ManagerTeams"));
const CreateTeam = lazyPage(() => import("./pages/Manager/CreateTeam"));
const EditTeam = lazyPage(() => import("./pages/Manager/EditTeam"));
const ManagePlayers = lazyPage(() => import("./pages/Manager/ManagePlayers"));
const AddPlayer = lazyPage(() => import("./pages/Manager/AddPlayer"));
const ManagerTournaments = lazyPage(() => import("./pages/Manager/ManagerTournaments"));
const ManagerProfile = lazyPage(() => import("./pages/Manager/ManagerProfile"));
const EditManagerProfile = lazyPage(() => import("./pages/Manager/EditManagerProfile"));
const ManagerRequests = lazyPage(() => import("./pages/Manager/ManagerRequests"));
const ManagerPayments = lazyPage(() => import("./pages/Manager/ManagerPayments"));

// Player Dashboard Pages - lazy loaded
const PlayerProfile = lazyPage(() => import("./pages/Player/PlayerProfile"));
const EditPlayerProfile = lazyPage(() => import("./pages/Player/EditPlayerProfile"));
const PlayerTournaments = lazyPage(() => import("./pages/Player/PlayerTournaments"));
const TournamentDetails = lazyPage(() => import("./pages/Player/TournamentDetails"));
const TournamentPayment = lazyPage(() => import("./pages/Player/TournamentPayment"));
const PaymentReceipt = lazyPage(() => import("./pages/Player/PaymentReceipt"));
const PlayerTeams = lazyPage(() => import("./pages/Player/PlayerTeams"));
const PlayerRequests = lazyPage(() => import("./pages/Player/PlayerRequests"));
const PlayerPayments = lazyPage(() => import("./pages/Player/PlayerPayments"));

// Organizer Dashboard Pages - lazy loaded
const OrganizerDashboard = lazyPage(() => import("./pages/Organizer/OrganizerDashboard"));
const OrganizerTournaments = lazyPage(() => import("./pages/Organizer/OrganizerTournaments"));
const OrganizerPayments = lazyPage(() => import("./pages/Organizer/OrganizerPayments"));
const OrganizerTeams = lazyPage(() => import("./pages/Organizer/OrganizerTeams"));
const OrganizerAuthorization = lazyPage(() => import("./pages/Organizer/OrganizerAuthorization"));
const CreateTournament = lazyPage(() => import("./pages/Organizer/CreateTournament"));
const EditTournament = lazyPage(() => import("./pages/Organizer/EditTournament"));
const CreateMatch = lazyPage(() => import("./pages/Organizer/CreateMatch"));
const EditMatch = lazyPage(() => import("./pages/Organizer/EditMatch"));
const TournamentFixtures = lazyPage(() => import("./pages/Organizer/TournamentFixtures"));
const OrganizerTournamentDashboard = lazyPage(() => import("./pages/Organizer/OrganizerTournamentDashboard"));
const OrganizerProfile = lazyPage(() => import("./pages/Organizer/OrganizerProfile"));
const EditOrganizerProfile = lazyPage(() => import("./pages/Organizer/EditOrganizerProfile"));
const OrganizerReports = lazyPage(() => import("./pages/Organizer/OrganizerReports"));

// Admin Pages - lazy loaded
const AdminDashboard = lazyPage(() => import("./pages/admin/AdminDashboard"));
const OrganizerRequests = lazyPage(() => import("./pages/admin/OrganizerRequests"));
const AdminUsers = lazyPage(() => import("./pages/admin/AdminUsers"));
const AdminTournaments = lazyPage(() => import("./pages/admin/AdminTournaments"));
const AdminTeams = lazyPage(() => import("./pages/admin/AdminTeams"));
const Revenue = lazyPage(() => import("./pages/admin/Revenue"));
const AdminPayments = lazyPage(() => import("./pages/admin/AdminPayments"));
const AdminFeedback = lazyPage(() => import("./pages/admin/AdminFeedback"));
const AdminSports = lazyPage(() => import("./pages/admin/AdminSports"));
const AdminReports = lazyPage(() => import("./pages/admin/AdminReports"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
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
          { path: "reports", element: <OrganizerReports /> },
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
    errorElement: <RouteErrorFallback />,
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
    ],
  },
]);

