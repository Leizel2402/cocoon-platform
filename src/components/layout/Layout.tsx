import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  BarChart3,
  LogOut,
  UserCircle,
  Clock,
  Menu,
  X,
  MessageCircle,
  Globe,
  Heart,
  DollarSign,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Toaster } from "../ui/toaster";

import { useTranslation } from "../../hooks/useTranslations";
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<
    "EN" | "ES" | "FR" | "DE"
  >("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation(selectedLanguage);

  // Redirect logged-in users away from auth pages and to appropriate dashboards
  useEffect(() => {
    if (!user) return;

    // Redirect from auth pages
    if (location.pathname === "/signin" ) {
      if (user.role === "prospect") {
        // navigate("/property", { replace: true });
      } else if (user.role === "renter") {
        navigate("/portal", { replace: true });
      } else if (
        user.role === "landlord_admin" ||
        user.role === "landlord_employee"
      ) {
        navigate("/landlord-dashboard", { replace: true });
      } else if (
        user.role === "cocoon_admin" ||
        user.role === "cocoon_employee"
      ) {
        navigate("/cocoon-dashboard", { replace: true });
      }
    }

    // Redirect prospect users from home page to their dashboard
    if (location.pathname === "/" && user.role === "prospect") {
      // navigate("/property", { replace: true });
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
  // Hide header on auth pages
  const hideHeader =
    location.pathname === "/signin" || location.pathname === "/signup";
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      {/* Header - Hidden on auth pages */}
      {!hideHeader && (
        <header className="bg-white/80 backdrop-blur-md shadow-lg  py-1 border-b border-white/20 sticky top-0 z-40">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-2 sm:p-3 rounded-lg shadow-xl">
                  <Home className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>

                {/* <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 bg-clip-text text-transparent">
                  Cocoon
                </span> */}
              </Link>

              {/* Desktop Navigation - Clean design */}
              <div className="hidden xl:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-muted"
                  onClick={() => navigate("/property")}
                >
                  Find Properties
                </Button>

                {/* Get Prequalified button */}
                {(user?.role === "renter" ||
                  user?.role === "prospect" ||
                  !user) && (
                    <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-[8px] sm:px-6 py-2 font-semibold text-sm sm:text-base"
                    onClick={() => navigate("/prequalify")}
                  >
                    Get Prequalified
                  </Button>
                   <Button
                   variant="ghost"
                   className="text-gray-700 hover:bg-muted"
                   onClick={() => navigate("/my-applications")}
                 >
                   My Applications
                 </Button>
                 </>
                )}

                {/* Renter specific navigation items */}
                {user?.role === "renter" && (
                  <>
                    {/* <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-muted"
                      onClick={() => navigate("/my-applications")}
                    >
                      My Applications
                    </Button> */}
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-muted"
                      onClick={() => navigate("/portal")}
                    >
                      Rental Portal
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-muted"
                      onClick={() => navigate("/maintenance")}
                    >
                      Maintenance
                    </Button>
                  </>
                )}
              </div>

              {/* Right side navigation */}
              <div className="flex items-center space-x-3">
                {/* Language selector - always visible */}
                <div className="hidden sm:block">
                  <Popover open={langOpen} onOpenChange={setLangOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {selectedLanguage}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-40 p-2 bg-white border shadow-lg z-[60]"
                      align="end"
                    >
                      <div className="space-y-1">
                        {(["EN", "ES", "FR", "DE"] as const).map((lang) => (
                          <Button
                            key={lang}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left hover:bg-gray-100 text-sm"
                            onClick={() => {
                              setSelectedLanguage(lang);
                              setLangOpen(false);
                            }}
                          >
                            {lang === "EN" && t("english")}
                            {lang === "ES" && t("spanish")}
                            {lang === "FR" && t("french")}
                            {lang === "DE" && t("german")}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* User Profile Popover - Enhanced design */}
                {!user ? (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-muted"
                      onClick={() => navigate("/signin")}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-semibold text-sm"
                      onClick={() => navigate("/signup")}
                    >
                      Sign Up
                    </Button>
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {user.email?.charAt(0).toUpperCase() || "U"}
                        {/* Notification badge */}
                        {/* <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                           1
                         </span> */}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 p-0 bg-white border shadow-xl z-[60]"
                      align="end"
                    >
                      <div className="space-y-0">
                        {/* User info header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-600 capitalize font-medium">
                            {user.role?.replace("_", " ")}
                          </p>
                        </div>

                        {/* Navigation items based on role */}
                        <div className="py-2">
                          {user.role === "prospect" && (
                            <>
                              <button
                                onClick={() => navigate("/saved-properties")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <Heart className="h-4 w-4 mr-3 text-green-600" />
                                Saved Properties
                              </button>
                              
                              <button
                                onClick={() => navigate("/saved-searches")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <Search className="h-4 w-4 mr-3 text-green-600" />
                                Saved Searches
                              </button>

                              <button
                                onClick={() => navigate("/learning-center")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-3 text-green-600" />
                                Learning Center
                              </button>
                          
                              <button
                                onClick={() => navigate("/prequalify")}
                                className="w-full text-left px-4 py-3 rounded-[8px] text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-3 text-green-600" />
                                Get Prequalified
                              </button>
                            </>
                          )}

                          {user.role === "renter" && (
                            <>
                              <button
                                onClick={() => navigate("/saved-properties")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <Heart className="h-4 w-4 mr-3 text-green-600" />
                                Saved Properties
                              </button>
                              
                              <button
                                onClick={() => navigate("/saved-searches")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <Search className="h-4 w-4 mr-3 text-green-600" />
                                Saved Searches
                              </button>
                              <button
                                onClick={() => navigate("/learning-center")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-3 text-green-600" />
                                Learning Center
                              </button>
                              <button
                                onClick={() => navigate("/subscriptions")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <DollarSign className="h-4 w-4 mr-3 text-green-600" />
                                Subscriptions
                              </button>
                            </>
                          )}

                          {(user.role === "landlord_admin" ||
                            user.role === "landlord_employee") && (
                            <>
                              <button
                                onClick={() => navigate("/landlord-dashboard")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <BarChart3 className="h-4 w-4 mr-3 text-green-600" />
                                Dashboard
                              </button>
                              <button
                                onClick={() => navigate("/properties")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <Home className="h-4 w-4 mr-3 text-green-600" />
                                Properties
                              </button>
                              <button
                                onClick={() => navigate("/learning-center")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-3 text-green-600" />
                                Learning Center
                              </button>
                            </>
                          )}

                          {(user.role === "cocoon_admin" ||
                            user.role === "cocoon_employee") && (
                            <>
                              <button
                                onClick={() => navigate("/cocoon-dashboard")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <BarChart3 className="h-4 w-4 mr-3 text-green-600" />
                                Dashboard
                              </button>
                              <button
                                onClick={() => navigate("/learning-center")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-3 text-green-600" />
                                Learning Center
                              </button>
                              <button
                                onClick={() => navigate("/migrate")}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center"
                              >
                                <FileText className="h-4 w-4 mr-3 text-green-600" />
                                Data Migration
                              </button>
                            </>
                          )}
                        </div>

                        {/* Footer with sign out */}
                        <div className="border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              {/* Mobile menu toggle - visible on tablet and mobile (below 1280px) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </header>
      )}
      {/* Mobile Navigation - Hidden on auth pages, toggleable on tablet/mobile */}
      {!hideHeader && isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Mobile menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed top-0 right-0 h-full w-4/6 sm:w-2/5 md:w-1/3 bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header inside menu */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Cocoon
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col p-4 space-y-3 flex-1">
              {/* Home button - always visible */}
              {/* <motion.div whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                  isActive("/")
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className="h-5 w-5" />
                Home
              </button>
            </motion.div> */}

              {/* Non-authenticated user menu items */}
              {!user && (
                <>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/property");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-gray-700 hover:bg-gray-100"
                    >
                      <Home className="h-5 w-5" />
                      Property Search
                    </button>
                  </motion.div>

                  {/* <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      localStorage.setItem("portal_context", "manager");
                      navigate("/signin");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-5 w-5" />
                    Manager Portal
                  </button>
                </motion.div> */}

                  {/* <motion.div whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      localStorage.setItem("portal_context", "renter");
                      navigate("/signin");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircle className="h-5 w-5" />
                    Renter Portal
                  </button>
                </motion.div> */}

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/faq");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-gray-700 hover:bg-gray-100"
                    >
                      <MessageCircle className="h-5 w-5" />
                      FAQs
                    </button>
                  </motion.div>

                  {/* Language selector for mobile */}
                  <div className="px-4 py-3">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">
                        Language
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(["EN", "ES", "FR", "DE"] as const).map((lang) => (
                          <motion.button
                            key={lang}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedLanguage(lang);
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedLanguage === lang
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {lang === "EN" && t("english")}
                            {lang === "ES" && t("spanish")}
                            {lang === "FR" && t("french")}
                            {lang === "DE" && t("german")}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user?.role === "prospect" && (
                <>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/saved-properties");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/saved-properties")
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Heart className="h-5 w-5" />
                      Saved Properties
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/learning-center");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/learning-center")
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      Learning Center
                    </button>
                  </motion.div>
                </>
              )}

              {user?.role === "renter" && (
                <>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/my-applications");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/my-applications")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Clock className="h-5 w-5" />
                      My Applications
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/portal");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/portal")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <UserCircle className="h-5 w-5" />
                      Rental Portal
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/maintenance");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/maintenance")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                      Maintenance
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/saved-properties");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/saved-properties")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Heart className="h-5 w-5" />
                      Saved Properties
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/learning-center");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/learning-center")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      Learning Center
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/subscriptions");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/subscriptions")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <DollarSign className="h-5 w-5" />
                      Subscriptions
                    </button>
                  </motion.div>
                </>
              )}

              {(user?.role === "landlord_admin" ||
                user?.role === "landlord_employee") && (
                <>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/landlord-dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/properties")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      Properties
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/learning-center");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/learning-center")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      Learning Center
                    </button>
                  </motion.div>
                </>
              )}

              {(user?.role === "cocoon_admin" ||
                user?.role === "cocoon_employee") && (
                <>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/cocoon-dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
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
                        navigate("/learning-center");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive("/learning-center")
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      Learning Center
                    </button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <button
                      onClick={() => {
                        navigate("/migrate");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
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
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:from-red-600 hover:to-red-700 transition"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              ) : (
                <></>
                // <motion.button
                //   whileTap={{ scale: 0.95 }}
                //   onClick={() => {
                //     navigate("/prequalify");
                //     setIsMobileMenuOpen(false);
                //   }}
                //   className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 transition"
                // >
                //   <FileText className="h-5 w-5" />
                //   Get Prequalified
                // </motion.button>
              )}
            </div>
          </motion.div>
        </>
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
