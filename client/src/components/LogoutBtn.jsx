import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";
import { LogOut } from "lucide-react";

const LogoutBtn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle logout button click
  const handleLogout = async () => {
    // Logout the user using Redux
    await dispatch(logoutUser());
    
    // Go back to home page
    navigate("/");
  };

  return (
    <button 
      onClick={handleLogout} 
      className="w-full px-4 py-2.5 rounded-lg bg-card-background hover:bg-red-500 dark:bg-card-background-dark dark:hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white font-medium"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
};

export default LogoutBtn;
