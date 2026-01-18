import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createPayment, verifyPayment, clearError, clearCurrentPayment, clearPaymentSuccess } from "../../store/slices/paymentSlice";
import { CreditCard, CheckCircle, XCircle, Loader } from "lucide-react";
import useDateFormat from "../../hooks/useDateFormat";
import Button from "../../components/ui/Button";

const TournamentPayment = () => {
  const { id } = useParams();
  const { formatDate } = useDateFormat();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { tournament, teamId } = location.state || {};
  const { currentPayment, loading, error, paymentSuccess } = useSelector(
    (state) => state.payment
  );
  const { user } = useSelector((state) => state.auth);

  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!tournament || !teamId) {
      navigate("/player/tournaments");
    }
  }, [tournament, teamId, navigate]);

  useEffect(() => {
    if (paymentSuccess && currentPayment) {
      navigate(`/player/payments/${currentPayment._id}/receipt`);
    }
  }, [paymentSuccess, currentPayment, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearCurrentPayment());
      dispatch(clearPaymentSuccess());
    };
  }, [dispatch]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!tournament || !teamId) return;

    setProcessingPayment(true);

    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load payment gateway. Please try again.");
      setProcessingPayment(false);
      return;
    }

    // Create payment order
    const paymentData = {
      tournament: tournament._id,
      team: teamId,
      payerType: "Team",
      organizer: tournament.organizer._id || tournament.organizer,
      amount: tournament.entryFee,
    };

    try {
      const result = await dispatch(createPayment(paymentData)).unwrap();

      if (!result.razorpayOrderId) {
        throw new Error("Failed to create payment order");
      }

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.amount * 100, // Convert to paise
        currency: result.currency || "INR",
        name: "SportsHub",
        description: `Entry fee for ${tournament.name}`,
        order_id: result.razorpayOrderId,
        handler: async function (response) {
          // Verify payment
          const verificationData = {
            paymentId: result._id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          dispatch(verifyPayment(verificationData));
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      setProcessingPayment(false);
    }
  };

  if (!tournament) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CreditCard className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Payment</h1>
            <p className="text-gray-600">Tournament Registration Fee</p>
          </div>

          {/* Tournament Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 text-lg">Tournament Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tournament:</span>
                <span className="font-medium text-gray-800">{tournament.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sport:</span>
                <span className="font-medium text-gray-800">{tournament.sport?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium text-gray-800">
                  {formatDate(tournament.startDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 text-lg">Payment Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Fee:</span>
                <span className="font-medium text-gray-800">
                  ₹{tournament.entryFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium text-gray-800">₹0</span>
              </div>
              <div className="border-t border-blue-300 pt-2 mt-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-blue-600">
                    ₹{tournament.entryFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={processingPayment || loading}
            loading={processingPayment || loading}
            variant="primary"
            className="text-lg"
          >
            <CreditCard className="w-5 h-5" />
            Pay ₹{tournament.entryFee.toLocaleString()}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secured by Razorpay | Your payment information is encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default TournamentPayment;
