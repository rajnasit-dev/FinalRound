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
    
    // If time is already a simple time string like "14:30" or "05:02" (short format), return it
    if (typeof time === "string" && time.length <= 8 && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
      return time;
    }
    
    // Otherwise try to parse as date and format
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return { formatDate, formatTime };
};

export default useDateFormat;
