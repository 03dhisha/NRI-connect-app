import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center px-6">
        <div className="w-20 h-20 bg-gradient-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-glow">
          <span className="text-4xl text-white">🏠</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you've wandered off the path. Let's get you back home.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center px-8 py-4 bg-gradient-primary text-white rounded-2xl font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105"
        >
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
