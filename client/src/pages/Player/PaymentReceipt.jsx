import useDateFormat from "../../hooks/useDateFormat";
import { formatINR } from "../../utils/formatINR";
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
import logo from "../../assets/logo.png";

const PaymentReceipt = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const componentRef = useRef(null);

  const { receipt, loading } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);
  const { formatDate, formatTime } = useDateFormat();
  const totalAmount = Number(receipt?.amount || 0);
  const tournamentEntryFee = Number(receipt?.tournament?.entryFee || 0);
  const hasStoredBreakdown =
    Number.isFinite(Number(receipt?.entryFeeAmount)) &&
    Number(receipt?.entryFeeAmount) > 0;

  // Legacy payments may not have tax snapshot fields. In that case,
  // fall back to the amount paid so downloaded receipts still show entry fee.
  const entryFeeAmount = hasStoredBreakdown
    ? Number(receipt.entryFeeAmount)
    : (tournamentEntryFee > 0 ? tournamentEntryFee : totalAmount);

  const inferredTaxAmount = Math.max(totalAmount - entryFeeAmount, 0);
  const taxAmount = hasStoredBreakdown
    ? Number(receipt?.taxAmount || 0)
    : inferredTaxAmount;

  const taxRate =
    entryFeeAmount > 0
      ? (taxAmount / entryFeeAmount)
      : Number(receipt?.taxRate || 0);

  const rawPaymentMethod = receipt?.paymentMethod?.toString().toLowerCase();
  const methodKey =
    rawPaymentMethod && rawPaymentMethod !== "unknown"
      ? rawPaymentMethod
      : (receipt?.provider || "razorpay").toString().toLowerCase();
  const methodLabelMap = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
    paylater: "Pay Later",
    razorpay: "Razorpay",
    unknown: "Razorpay",
  };
  const paymentMethodLabel = methodLabelMap[methodKey] || methodKey.toUpperCase();

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
        margin: 0;
      }
      html, body {
        margin: 0;
        padding: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        * {
          color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Hide icons in print */
        svg {
          display: none !important;
        }
        .flex.items-center.gap-2 {
          display: flex !important;
          gap: 0.5rem !important;
        }
        .flex.items-center.gap-2 h3 {
          margin-left: 0 !important;
        }
      }
    `,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-96">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <BackButton className="mb-6" />
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          
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
        <div ref={componentRef} className="bg-white p-3 relative overflow-hidden" style={{ fontSize: "13px", maxWidth: "800px" }}>
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={logo}
              alt=""
              className="w-96 h-96 object-contain opacity-5"
            />
          </div>

          {/* Header with Logo and Branding */}
          <div style={{ position: "relative", zIndex: 10, borderBottom: "1px solid #000", paddingBottom: "8px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={logo} alt="SportsHub" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                <div>
                  <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#000", fontFamily: "'Syne', sans-serif", margin: 0 }}>
                    SportsHub
                  </h1>
                  <p style={{ fontSize: "11px", color: "#000", margin: 0 }}>www.sportshub.com</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "11px", color: "#000", margin: 0 }}>Receipt Date</p>
                <p style={{ fontWeight: "600", color: "#000", fontSize: "12px", margin: 0 }}>{new Date().toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>

          {/* Receipt Title and Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#000", margin: 0 }}>
              PAYMENT RECEIPT
            </h2>
            <div>
              <p style={{ fontSize: "11px", color: "#000", margin: "0 0 3px 0" }}>Status: {receipt.status}</p>
              <p style={{ fontSize: "11px", color: "#000", margin: 0 }}>
                Receipt #{receipt.transactionId || receipt._id.slice(-8)}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#000", margin: "0 0 6px 0" }}>Payment Information</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Transaction ID:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{receipt.transactionId || receipt._id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Payment Date:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{`${formatDate(receipt.createdAt)} ${formatTime(receipt.createdAt)}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Payment Method:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{paymentMethodLabel}</span>
            </div>
          </div>

          {/* Payer Information */}
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#000", margin: "0 0 6px 0" }}>Payer Information</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Paid By Type:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{receipt.payerType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Paid By:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{receipt.payerName || user?.fullName || "N/A"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Email:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{user?.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Phone:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{user?.phone || "N/A"}</span>
            </div>
          </div>

          {/* Tournament Details */}
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#000", margin: "0 0 6px 0" }}>Tournament Details</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Tournament Name:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{receipt.tournament?.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Sport:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{receipt.tournament?.sport?.name}</span>
            </div>
            {receipt.team && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ color: "#000" }}>Team:</span>
                <span style={{ fontWeight: "600", color: "#000" }}>{receipt.team.name}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Tournament Date:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>{receipt.tournament?.startDate && formatDate(receipt.tournament.startDate)}</span>
            </div>
          </div>

          {/* Amount Summary */}
          <div style={{ marginBottom: "10px", borderTop: "1px solid #000", borderBottom: "1px solid #000", paddingTop: "6px", paddingBottom: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Entry Fee:</span>
              <span style={{ fontWeight: "600", color: "#000" }}>₹{formatINR(entryFeeAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#000" }}>Tax ({Math.round(taxRate * 100)}%):</span>
              <span style={{ fontWeight: "600", color: "#000" }}>₹{formatINR(taxAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold" }}>
              <span style={{ color: "#000" }}>Total Paid:</span>
              <span style={{ color: "#000" }}>₹{formatINR(totalAmount)}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", borderTop: "1px solid #000", paddingTop: "8px", marginTop: "10px" }}>
            <p style={{ fontSize: "11px", color: "#000", margin: "0 0 3px 0" }}>
              Thank you for registering with SportsHub!
            </p>
            <p style={{ fontSize: "11px", color: "#000", margin: "0 0 3px 0" }}>
              This receipt is computer-generated and is valid for your records.
            </p>
            <p style={{ fontSize: "11px", color: "#000", margin: "0 0 3px 0" }}>
              Note: All payments are non-refundable.
            </p>
            <p style={{ fontSize: "11px", color: "#000", margin: 0 }}>
              For any queries, please contact sportshub.support@gmail.com
            </p>
          </div>
        </div>
    </div>
  );
};

export default PaymentReceipt;

