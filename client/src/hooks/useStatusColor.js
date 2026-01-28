import { useCallback } from "react";

const useStatusColor = () => {
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-500";
      case "Scheduled":
        return "bg-blue-500";
      case "Live":
        return "bg-red-500";
      case "Completed":
        return "bg-gray-500";
      case "Cancelled":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  }, []);

  return { getStatusColor };
};

export default useStatusColor;
