/**
 * Format a number with Indian Rupee comma separation.
 * e.g. 110000 → "1,10,000", 5500 → "5,500"
 * @param {number|string} amount
 * @returns {string}
 */
export const formatINR = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
};
