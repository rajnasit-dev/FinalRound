import { useCallback } from "react";

const useDateFormat = () => {

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatTime = useCallback((time) => {
    if (!time) return "";
    
    // If time is already a string like "14:30", return it
    if (typeof time === "string" && time.includes(":")) {
      return time;
    }
    
    // Otherwise try to parse as date
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return { formatDate, formatTime };
};

export default useDateFormat;
