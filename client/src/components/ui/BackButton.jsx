import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark transition-colors ${className} cursor-pointer hover:scale-105 duration-200 transition-transform`}
    >
      <ArrowLeft className="text-xl" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
