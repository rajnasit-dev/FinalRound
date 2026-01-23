import { useMemo } from "react";

/**
 * Custom hook to calculate age from date of birth
 * @param {string|Date} dateOfBirth - The date of birth (ISO string or Date object)
 * @returns {number|null} - Age in years or null if invalid/missing DOB
 */
const useAge = (dateOfBirth) => {
  const age = useMemo(() => {
    if (!dateOfBirth) return null;

    try {
      const dob = new Date(dateOfBirth);
      
      // Validate date
      if (isNaN(dob.getTime())) return null;
      
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      
      return calculatedAge >= 0 ? calculatedAge : null;
    } catch (error) {
      console.error("Error calculating age:", error);
      return null;
    }
  }, [dateOfBirth]);

  return age;
};

export default useAge;
