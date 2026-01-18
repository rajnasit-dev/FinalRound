import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({ children, type = "button", variant = "primary", disabled = false, isLoading = false, className = ""}) => {
  const baseStyles = "w-full px-6 py-3 rounded-lg font-bold transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/50 dark:bg-accent dark:hover:bg-accent/90 dark:text-black dark:focus:ring-accent/50",
    outline: "bg-transparent border-2 border-secondary dark:border-accent text-secondary dark:text-accent hover:bg-secondary/10 dark:hover:bg-accent/10 focus:ring-secondary/50 dark:focus:ring-accent/50",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
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
