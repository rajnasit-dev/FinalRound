export const showToast = (message, type = "success", duration = 3000) => {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-semibold shadow-lg z-50 animate-fade-in`;

  // Add type-based styling
  if (type === "success") {
    toast.classList.add("bg-green-500");
  } else if (type === "error") {
    toast.classList.add("bg-red-500");
  } else if (type === "warning") {
    toast.classList.add("bg-yellow-500");
  } else {
    toast.classList.add("bg-blue-500");
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.classList.add("animate-fade-out");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};
