import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../utils/formatINR";
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchUserPayments } from "../../store/slices/paymentSlice";

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tournaments, loading: tournamentsLoading } = useSelector((state) => state.tournament);
  const { payments, loading: paymentsLoading } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    dispatch(fetchUserPayments());
  }, [dispatch]);

  // Filter tournaments organized by this user
  const myTournaments = tournaments?.filter((t) => t.organizer?._id === user?._id) || [];

  const totalTournaments = myTournaments.length;

  // Total registrations across all tournaments (teams + players)
  const totalRegistrations = myTournaments.reduce((acc, t) => {
    return acc + (t.registeredTeams?.length || 0) + (t.registeredPlayers?.length || 0);
  }, 0);

  // Payment stats from fetched payments
  const paymentStats = useMemo(() => {
    if (!payments || payments.length === 0) return { netRevenue: 0 };
    const successful = payments.filter((p) => p.status === "Success");
    const totalReceived = successful
      .filter((p) => p.payerType !== "Organizer")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPlatformFees = successful
      .filter((p) => p.payerType === "Organizer")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return { netRevenue: totalReceived - totalPlatformFees };
  }, [payments]);

  if (tournamentsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authorization Warning Banner */}
      {!user?.isAuthorized && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2">
                Authorization Required
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                Your organization needs to be authorized before you can create tournaments. 
                Submit your verification documents to get started.
              </p>
              <Button
                onClick={() => navigate("/organizer/authorization")}
                className="!w-auto px-6 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                Apply for Authorization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-base dark:text-base-dark">
          Manage your tournaments and organize matches
        </p>
      </div>

      {/* Stats Cards */}
      <GridContainer cols={2}>
        <DashboardCardState
          Icon={Trophy}
          label="Total Tournaments"
          value={totalTournaments}
          gradientFrom="from-amber-500/10"
          gradientVia="via-amber-500/5"
          borderColor="border-amber-500/30"
          iconGradientFrom="from-amber-500"
          iconGradientTo="to-amber-600"
          onClick={() => navigate("/organizer/tournaments")}
        />
        <DashboardCardState
          Icon={DollarSign}
          label="Net Revenue"
          value={`₹${formatINR(paymentStats.netRevenue)}`}
          gradientFrom="from-green-500/10"
          gradientVia="via-green-500/5"
          borderColor="border-green-500/30"
          iconGradientFrom="from-green-500"
          iconGradientTo="to-green-600"
          onClick={() => navigate("/organizer/payments")}
        />
        <DashboardCardState
          Icon={Users}
          label="Total Registrations"
          value={totalRegistrations}
          gradientFrom="from-purple-500/10"
          gradientVia="via-purple-500/5"
          borderColor="border-purple-500/30"
          iconGradientFrom="from-purple-500"
          iconGradientTo="to-purple-600"
          onClick={() => navigate("/organizer/tournaments")}
        />
      </GridContainer>
    </div>
  );
};

export default OrganizerDashboard;
