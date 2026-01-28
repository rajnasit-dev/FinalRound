import useDateFormat from "../../hooks/useDateFormat";
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentReceipt, clearError, clearReceipt } from "../../store/slices/paymentSlice";
import {
  CheckCircle,
  Download,
  Home,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";

const PaymentReceipt = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const componentRef = useRef(null);

  const { receipt, loading } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);
  const { formatDate, formatTime } = useDateFormat();

  useEffect(() => {
    if (paymentId) {
      dispatch(fetchPaymentReceipt(paymentId));
    }
  }, [dispatch, paymentId]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearReceipt());
    };
  }, [dispatch]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt-${paymentId}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Receipt not found</p>
          <Button
            onClick={() => navigate("/player/tournaments")}
            variant="primary"
            className="w-auto"
          >
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BackButton className="mb-6" />
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your tournament registration has been confirmed
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handlePrint}
            variant="primary"
            className="flex-1"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </Button>
          <Button
            onClick={() => navigate("/player/tournaments")}
            variant="primary"
            className="flex-1"
          >
            <Home className="w-5 h-5" />
            Back to Tournaments
          </Button>
        </div>

        {/* Receipt */}
        <div ref={componentRef} className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  PAYMENT RECEIPT
                </h2>
                <p className="text-gray-600">SportsHub Platform</p>
                <p className="text-sm text-gray-500">www.sportshub.com</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                  {receipt.status}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Receipt #{receipt.transactionId || receipt._id.slice(-8)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium text-gray-800">
                    {receipt.transactionId || receipt._id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-medium text-gray-800">
                    {`${formatDate(receipt.createdAt)} ${formatTime(receipt.createdAt)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-800">
                    {receipt.provider || "Razorpay"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payer Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-800">{user?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-800">
                    {user?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tournament Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tournament Name:</span>
                <span className="font-medium text-gray-800">
                  {receipt.tournament?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sport:</span>
                <span className="font-medium text-gray-800">
                  {receipt.tournament?.sport?.name}
                </span>
              </div>
              {receipt.team && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Team:</span>
                  <span className="font-medium text-gray-800">
                    {receipt.team.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tournament Date:</span>
                <span className="font-medium text-gray-800">
                  {receipt.tournament?.startDate && formatDate(receipt.tournament.startDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Entry Fee:</span>
                <span className="font-medium text-gray-800 font-num">
                  ₹{receipt.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Processing Fee:</span>
                <span className="font-medium text-gray-800 font-num">₹0</span>
              </div>
              <div className="flex justify-between text-xl">
                <span className="font-bold text-gray-800">Total Paid:</span>
                <span className="font-bold text-black font-num">
                  ₹{receipt.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Thank you for registering with SportsHub!
            </p>
            <p className="text-xs text-gray-500">
              This is a computer-generated receipt and does not require a
              signature.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              For any queries, please contact support@sportshub.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
