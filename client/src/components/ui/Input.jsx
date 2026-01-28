import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef(
  ({ label, type = "text", name, placeholder, error, icon, required, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;

    // Prefer explicit prop, but also respect aria/data flags for required indicators
    const isRequired =
      required ?? rest?.["aria-required"] ?? rest?.["data-required"] ?? false;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium mb-2" htmlFor={name}>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark`}>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            name={name}
            type={inputType}
            placeholder={placeholder}
            required={!!isRequired}
            {...rest}
            className={`w-full py-3 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base dark:focus:border-base-dark/50 focus:border-base/50 focus:outline-none text-base dark:text-base-dark ${
              icon ? "pl-10" : "pl-4"
            } ${isPasswordField ? "pr-12" : "pr-4"}`}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-base dark:text-base-dark hover:text-secondary dark:hover:text-secondary transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
