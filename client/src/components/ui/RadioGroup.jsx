import React from "react";

const RadioGroup = React.forwardRef(
  ({ label, options = [], name, error, value, onChange, required = false }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium mb-3">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="flex gap-6">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                ref={ref}
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-4 h-4 text-secondary bg-card-background dark:bg-card-background-dark border-2 border-base-dark dark:border-base cursor-pointer accent-secondary"
              />
              <label
                htmlFor={`${name}-${option.value}`}
                className="ml-2 text-sm font-medium text-text-primary dark:text-text-primary-dark cursor-pointer hover:text-secondary dark:hover:text-secondary transition-colors"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
