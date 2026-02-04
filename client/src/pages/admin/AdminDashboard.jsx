import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../store/slices/adminSlice";
import {
  Users,
  Trophy,
  Shield,
  DollarSign,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import DashboardCardState from "../../components/ui/DashboardCardState";
import GridContainer from "../../components/ui/GridContainer";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboardStats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Admin Dashboard
        </h1>
        <p className="text-base dark:text-base-dark mt-2">
          Overview of platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      <GridContainer cols={2}>
        <div onClick={() => navigate("/admin/users")} className="cursor-pointer">
          <DashboardCardState
            Icon={Users}
            label="Total Users"
            value={dashboardStats?.users?.total || 0}
            gradientFrom="from-blue-500/10"
            gradientVia="via-blue-500/5"
            borderColor="border-blue-500/20"
            iconGradientFrom="from-blue-500"
            iconGradientTo="to-blue-600"
          />
        </div>
        <div onClick={() => navigate("/admin/tournaments")} className="cursor-pointer">
          <DashboardCardState
            Icon={Trophy}
            label="Tournaments"
            value={dashboardStats?.tournaments?.total || 0}
            gradientFrom="from-amber-500/10"
            gradientVia="via-amber-500/5"
            borderColor="border-amber-500/20"
            iconGradientFrom="from-amber-500"
            iconGradientTo="to-amber-600"
          />
        </div>
        <div onClick={() => navigate("/admin/teams")} className="cursor-pointer">
          <DashboardCardState
            Icon={Shield}
            label="Teams"
            value={dashboardStats?.teams?.total || 0}
            gradientFrom="from-green-500/10"
            gradientVia="via-green-500/5"
            borderColor="border-green-500/20"
            iconGradientFrom="from-green-500"
            iconGradientTo="to-green-600"
          />
        </div>
        <div onClick={() => navigate("/admin/revenue")} className="cursor-pointer">
          <DashboardCardState
            Icon={DollarSign}
            label="Total Revenue"
            value={`₹${dashboardStats?.revenue?.total || 0}`}
            gradientFrom="from-purple-500/10"
            gradientVia="via-purple-500/5"
            borderColor="border-purple-500/20"
            iconGradientFrom="from-purple-500"
            iconGradientTo="to-purple-600"
          />
        </div>
      </GridContainer>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold">Pending Organizer Requests</h3>
          </div>
          <div className="text-4xl font-bold text-secondary">
            {dashboardStats?.pendingRequests || 0}
          </div>
          <p className="text-sm text-base dark:text-base-dark mt-2">
            Organizers waiting for authorization
          </p>
        </div>

        {/* Recent Payments */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold">Recent Payments</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardStats?.recentPayments?.slice(0, 5).map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-3 bg-base-dark dark:bg-base rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {payment.tournament?.name || "Unknown Tournament"}
                  </p>
                  <p className="text-sm text-base dark:text-base-dark">
                    {payment.team?.name || "Unknown Team"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{payment.amount}</p>
                  <p className="text-xs text-base dark:text-base-dark">
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
            {(!dashboardStats?.recentPayments ||
              dashboardStats.recentPayments.length === 0) && (
              <p className="text-center text-base dark:text-base-dark py-4">
                No recent payments
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
