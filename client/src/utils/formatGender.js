export const formatGenderLabel = (gender, fallback = "N/A") => {
  if (!gender) {
    return fallback;
  }

  return String(gender).toLowerCase() === "mixed" ? "All Genders" : gender;
};
