import { useEffect, useState, useRef } from "react";
import {
  X,
  Trophy,
  Building2,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Hash,
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import useDateFormat from "../../hooks/useDateFormat";
import Spinner from "./Spinner";
import defaultAvatar from "../../assets/defaultAvatar.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const PaymentDetailModal = ({ paymentId, onClose, currentUserId }) => {
  const { formatDate, formatTime } = useDateFormat();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!paymentId) return;
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, {
          withCredentials: true,
        });
        setPayment(response.data.data);
      } catch {
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
      Pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
      Failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      Refunded: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    };
    return styles[status] || styles.Pending;
  };

  const getPayerTypeLabel = (type) => {
    const labels = { Organizer: "Platform Fee", Team: "Team Registration", Player: "Player Registration" };
    return labels[type] || type;
  };

  const getPayerTypeBadge = (type) => {
    const styles = {
      Organizer: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      Team: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      Player: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
    };
    return styles[type] || "";
  };

  // Check if the current user is the one who made the payment
  const isPayer = () => {
    if (!payment || !currentUserId) return false;
    if (payment.payerType === "Organizer" && payment.organizer?._id === currentUserId) return true;
    if (payment.payerType === "Player" && payment.player?._id === currentUserId) return true;
    // For team payments, check if the team manager is the current user
    if (payment.payerType === "Team" && payment.team?.manager?._id === currentUserId) return true;
    return false;
  };

  const handleDownloadReceipt = () => {
    // Open receipt in new tab — reuses existing receipt page route
    // Determine which receipt path to use based on context
    window.open(`/payments/${paymentId}/receipt`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-card-background dark:bg-card-background-dark rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border-light dark:border-border-dark shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark sticky top-0 bg-card-background dark:bg-card-background-dark z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
              Payment Detail
            </h2>
            {payment && (
              <p className="text-sm text-base dark:text-base-dark mt-1">
                Transaction #{payment._id?.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer hover:bg-primary dark:hover:bg-primary-dark transition-colors"
          >
            <X className="w-5 h-5 text-text-primary dark:text-text-primary-dark" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : !payment ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <XCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
                <p className="text-text-primary dark:text-text-primary-dark font-medium">
                  Payment not found
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Amount & Status Hero */}
              <div className="bg-primary dark:bg-primary-dark rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-base dark:text-base-dark">Amount</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{payment.amount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusStyle(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPayerTypeBadge(payment.payerType)}`}>
                      {getPayerTypeLabel(payment.payerType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tournament */}
                <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Tournament
                    </h3>
                  </div>
                  <p className="font-medium text-text-primary dark:text-text-primary-dark">
                    {payment.tournament?.name || "Unknown"}
                  </p>
                  {payment.tournament?.sport && (
                    <p className="text-xs text-base dark:text-base-dark mt-1">
                      {payment.tournament.sport.name}
                    </p>
                  )}
                </div>

                {/* Organizer */}
                <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Organizer
                    </h3>
                  </div>
                  {payment.organizer ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-border-light dark:border-border-dark shrink-0">
                        <img
                          src={payment.organizer.avatar || defaultAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {payment.organizer.orgName || payment.organizer.fullName}
                        </p>
                        {payment.organizer.email && (
                          <p className="text-xs text-base dark:text-base-dark truncate">
                            {payment.organizer.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-base dark:text-base-dark">Unavailable</p>
                  )}
                </div>

                {/* Payer (Team or Player) */}
                {(payment.team || payment.player) && (
                  <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {payment.team ? (
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      )}
                      <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        {payment.team ? "Team" : "Player"}
                      </h3>
                    </div>
                    {payment.team ? (
                      <div>
                        <p className="font-medium text-text-primary dark:text-text-primary-dark">
                          {payment.team.name || payment.team.teamName || "Unknown"}
                        </p>
                        {payment.team.manager && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-border-light dark:border-border-dark shrink-0">
                              <img src={payment.team.manager.avatar || defaultAvatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs text-base dark:text-base-dark">
                              Manager: {payment.team.manager.fullName}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border-light dark:border-border-dark shrink-0">
                          <img src={payment.player.avatar || defaultAvatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                            {payment.player.fullName}
                          </p>
                          <p className="text-xs text-base dark:text-base-dark">{payment.player.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Meta */}
                <div className="bg-primary dark:bg-primary-dark rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-base dark:text-base-dark" />
                    <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      Payment Info
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {payment.provider && (
                      <div>
                        <p className="text-xs text-base dark:text-base-dark">Provider</p>
                        <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {payment.provider}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-base dark:text-base-dark shrink-0" />
                      <p className="text-xs text-base dark:text-base-dark">
                        {formatDate(payment.createdAt)} at {formatTime(payment.createdAt)}
                      </p>
                    </div>
                    {payment.currency && (
                      <p className="text-xs text-base dark:text-base-dark">
                        Currency: {payment.currency}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Receipt Button — only for the payer on successful payments */}
              {payment.status === "Success" && isPayer() && (
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
