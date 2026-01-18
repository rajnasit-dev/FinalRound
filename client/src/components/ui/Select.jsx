import React from "react";

const Select = React.forwardRef(({ options, label, error, id, icon, ...rest }, ref) => {
  const inputId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base dark:text-base-dark pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          id={inputId}
          {...rest}
          className={`w-full h-full py-3 bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-lg dark:focus:border-base-dark/50 focus:border-base/50 focus:outline-none cursor-pointer ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
