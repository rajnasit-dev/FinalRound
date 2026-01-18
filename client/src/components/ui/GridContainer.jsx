import React from "react";

/**
 * Reusable Grid Container Component
 * @param {React.ReactNode} children - Grid items
 * @param {number} cols - Max columns (1, 2, 3, or 4) - default is 3
 * @param {string} gap - Gap between items (default: "gap-6")
 * @param {string} className - Additional classes
 */
const GridContainer = ({ 
  children, 
  cols = 3, 
  gap = "gap-6", 
  className = "" 
}) => {
  const getColsClass = () => {
    switch (cols) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className={`grid ${getColsClass()} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export default GridContainer;
