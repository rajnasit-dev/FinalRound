import { XCircle, AlertTriangle, Info } from "lucide-react";

const ErrorMessage = ({ message, type = "error", onDismiss }) => {
  const config = {
    error: {
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-700 dark:text-red-400",
      iconColor: "text-red-500 dark:text-red-400",
      Icon: XCircle,
    },
    warning: {
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-700 dark:text-yellow-400",
      iconColor: "text-yellow-500 dark:text-yellow-400",
      Icon: AlertTriangle,
    },
    info: {
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-400",
      iconColor: "text-blue-500 dark:text-blue-400",
      Icon: Info,
    },
  };

  const { bgColor, borderColor, textColor, iconColor, Icon } = config[type];

  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 ${bgColor} border ${borderColor} rounded-lg transition-all`}
    >
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <p className={`flex-1 text-sm ${textColor}`}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors ${iconColor}`}
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
