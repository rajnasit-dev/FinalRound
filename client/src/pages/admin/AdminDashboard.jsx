import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import CardStat from "../../components/ui/CardStat";

const AdminDashboard = () => {
  const dispatch = useDispatch();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStat
          Icon={Users}
          iconColor="text-blue-600"
          label="Total Users"
          value={dashboardStats?.users?.total || 0}
          description={`${dashboardStats?.users?.players || 0} Players, ${
            dashboardStats?.users?.managers || 0
          } Managers, ${dashboardStats?.users?.organizers || 0} Organizers`}
        />
        <CardStat
          Icon={Trophy}
          iconColor="text-amber-600"
          label="Tournaments"
          value={dashboardStats?.tournaments?.total || 0}
          description={`${dashboardStats?.tournaments?.active || 0} Active`}
        />
        <CardStat
          Icon={Shield}
          iconColor="text-green-600"
          label="Teams"
          value={dashboardStats?.teams?.total || 0}
        />
        <CardStat
          Icon={DollarSign}
          iconColor="text-purple-600"
          label="Total Revenue"
          value={`₹${dashboardStats?.revenue?.total || 0}`}
          description={`₹${dashboardStats?.revenue?.perTournament || 0} per tournament`}
        />
      </div>

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
