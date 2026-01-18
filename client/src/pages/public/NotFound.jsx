import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Large 404 Text */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-secondary-dark dark:bg-accent">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-8xl">⚽</span>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg mb-8 max-w-md mx-auto">
          The page you're looking for seems to have been moved, deleted, or doesn't exist. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="px-8 py-3 bg-accent hover:bg-accent/90 text-black rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            ← Back to Home
          </Link>
          <Link
            to="/tournaments"
            className="px-8 py-3 bg-secondary hover:bg-secondary/90 text-text-secondary rounded-lg font-semibold transition-all border border-white/10"
          >
            Browse Tournaments
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="mb-4">Quick Links:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link to="/" className="text-secondary dark:text-accent hover:underline">
              Home
            </Link>
            <Link to="/tournaments" className="text-secondary dark:text-accent hover:underline">
              Tournaments
            </Link>
            <Link to="/login" className="text-secondary dark:text-accent hover:underline">
              Login
            </Link>
            <Link to="/register" className="text-secondary dark:text-accent hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
