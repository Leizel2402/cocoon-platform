import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  BarChart3,
  LogOut,
  User,
  UserCircle,
  Clock,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Redirect logged-in users away from auth pages and to appropriate dashboards
useEffect(() => {
  if (!user) return;

  // Redirect from auth pages
  if (location.pathname === "/signin" || location.pathname === "/signup") {
    if (user.role === "prospect") {
      navigate("/prospect-dashboard", { replace: true });
    } else if (user.role === "renter") {
      navigate("/portal", { replace: true });
    } else if (user.role === "landlord_admin" || user.role === "landlord_employee") {
      navigate("/landlord-dashboard", { replace: true });
    } else if (user.role === "cocoon_admin" || user.role === "cocoon_employee") {
      navigate("/cocoon-dashboard", { replace: true });
    }
  }
  
  // Redirect prospect users from home page to their dashboard
  if (location.pathname === "/" && user.role === "prospect") {
    navigate("/prospect-dashboard", { replace: true });
  }
}, [user, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const isActive = (path: string) => location.pathname === path;
  // Hide header on auth pages and prospect dashboard (to avoid double headers)
  const hideHeader =
    location.pathname === "/signin" || 
    location.pathname === "/signup" ||
    (user?.role === "prospect" && location.pathname === "/prospect-dashboard");
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      {/* Header - Hidden on auth pages */}
      {!hideHeader && (
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                
                <span className="text-2xl hidden sm:flex  cust-div font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cocoon
                </span>
              </Link>
              <nav className="hidden lg:flex items-center space-x-8">
                {!user ? '':
                <Link
                  to="/"
                  className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActive("/")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Home
                </Link>}

                    {/* Show prospect routes */}
                    {user?.role === "prospect" && (
                      <>
                        <button
                          onClick={() => navigate("/property")}
                          className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                            isActive("/property")
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          Find Properties
                        </button>
                    <button
                      onClick={() => navigate("/addy-chat")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/addy-chat")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Chat with Addy
                    </button>
                    <button
                      onClick={() => navigate("/prospect-application")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/prospect-application")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Get Prequalified
                    </button>
                  </>
                )}

                {/* Show renter routes */}
                {user?.role === "renter" && (
                  <>
                    <button
                      onClick={() => navigate("/apply")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/apply")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => navigate("/my-applications")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/my-applications")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      My Applications
                    </button>
                    <button
                      onClick={() => navigate("/portal")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/portal")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Renter Portal
                    </button>
                    <button
                      onClick={() => navigate("/addy-chat")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/addy-chat")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Chat with Addy
                    </button>
                  </>
                )}

                {/* Show landlord routes */}
                {(user?.role === "landlord_admin" || user?.role === "landlord_employee") && (
                  <>
                    <button
                      onClick={() => navigate("/landlord-dashboard")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/landlord-dashboard")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/properties")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/properties")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Properties
                    </button>
                  </>
                )}

                {/* Show Cocoon employee routes */}
                {(user?.role === "cocoon_admin" || user?.role === "cocoon_employee") && (
                  <>
                    <button
                      onClick={() => navigate("/cocoon-dashboard")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/cocoon-dashboard")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/migrate")}
                      className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        isActive("/migrate")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Data Migration
                    </button>
                  </>
                )}
              </nav>
              <div className="flex items-center space-x-4">
                {/* Mobile menu button - visible on tablet/mobile */}

                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {user.email}
                        </span>
                        <span className="block text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                          {user.role === "landlord_admin" ? "Landlord Admin" : 
                           user.role === "landlord_employee" ? "Landlord Employee" :
                           user.role === "cocoon_admin" ? "Cocoon Admin" :
                           user.role === "cocoon_employee" ? "Cocoon Employee" :
                           user.role === "renter" ? "Renter" : "Prospect"}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="hidden lg:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => navigate("/signin")}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Sign In
                      </button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => navigate("/signup")}
                        className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Sign Up
                      </button>
                    </motion.div>
                  </div>
                )}
                {user && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      {/* Mobile Navigation - Hidden on auth pages, toggleable on tablet/mobile */}
      {!hideHeader && user && isMobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed top-0 right-0 h-full w-3/4 sm:w-1/3 bg-white/90 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
        >
          {/* Header inside menu */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <span className="text-lg  font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Cocoon</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col p-4 space-y-3">
            <motion.div whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => navigate("/")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                  isActive("/")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className="h-5 w-5" />
                Home
              </button>
            </motion.div>

            {user?.role === "prospect" && (
              <>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <button
                        onClick={() => {
                          navigate("/property");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                          isActive("/property")
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Home className="h-5 w-5" />
                        Find Properties
                      </button>
                    </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/addy-chat");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/addy-chat")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat with Addy
                  </button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/prospect-application");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/prospect-application")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    Get Prequalified
                  </button>
                </motion.div>
              </>
            )}

            {user?.role === "renter" && (
              <>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/apply");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/apply")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    Apply
                  </button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/my-applications");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/my-applications")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                    Applications
                  </button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/portal");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/portal")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <UserCircle className="h-5 w-5" />
                    Renter Portal
                  </button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/addy-chat");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/addy-chat")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat with Addy
                  </button>
                </motion.div>
              </>
            )}

            {(user?.role === "landlord_admin" || user?.role === "landlord_employee") && (
              <>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/landlord-dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/landlord-dashboard")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    Dashboard
                  </button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/properties");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/properties")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    Properties
                  </button>
                </motion.div>
              </>
            )}

            {(user?.role === "cocoon_admin" || user?.role === "cocoon_employee") && (
              <>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/cocoon-dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/cocoon-dashboard")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    Dashboard
                  </button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      navigate("/migrate");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full ${
                      isActive("/migrate")
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    Data Migration
                  </button>
                </motion.div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:from-red-600 hover:to-red-700 transition"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {children}
      </motion.main>
    </div>
  );
}
