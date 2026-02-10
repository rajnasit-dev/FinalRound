import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({ children, type = "button", variant = "primary", disabled = false, isLoading = false, loading, className = "", onClick, ...props }) => {
  const baseStyles = "w-full px-6 py-3 rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/50 dark:bg-accent dark:hover:bg-accent/90 dark:text-black dark:focus:ring-accent/50",
    outline: "bg-transparent border-2 border-secondary dark:border-accent text-secondary dark:text-accent hover:bg-secondary/10 dark:hover:bg-accent/10 focus:ring-secondary/50 dark:focus:ring-accent/50",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:focus:ring-gray-600",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/50 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-600/50",
  };

  // Support both isLoading and loading props
  const showLoading = isLoading || loading;

  // Filter out non-DOM props
  const { whileHover, whileTap, transition, ...domProps } = props;

  return (
    <button
      type={type}
      disabled={disabled || showLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...domProps}
    >
      {showLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {children}
        </span>
      )}
    </button>
  );
};

Button.displayName = "Button";

export default Button;
