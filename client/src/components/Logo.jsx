import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png";

const Logo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 group cursor-pointer"
    >
      {/* Logo Image */}
      <div className="flex items-center">
        <img 
          src={logoImage} 
          alt="SportsHub Logo" 
          className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Text Logo */}
      <h1 className="text-xl sm:text-xl md:text-xl font-bold text-text-primary dark:text-text-primary-dark group-hover:scale-105 transition-transform duration-300">
        SPORTSHUB
      </h1>
    </Link>
  );
};

export default Logo;
