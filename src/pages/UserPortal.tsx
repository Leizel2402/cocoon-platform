import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Application, Property } from "../types";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  Home,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserPortal() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load user's applications
        const applicationsQuery = query(
          collection(db, "applications"),
          where("user_id", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);

        const applicationsData = applicationsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate
              ? data.created_at.toDate()
              : new Date(),
          };
        }) as Application[];

        // Load properties
        const propertiesResponse = await fetch("/data/properties.json");
        const propertiesData: Property[] = await propertiesResponse.json();

        // Enrich applications with property data
        const enrichedApplications = applicationsData.map((app) => ({
          ...app,
          property: propertiesData.find((p) => p.id === app.property_id),
        }));

        setApplications(enrichedApplications);
        setProperties(propertiesData);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Calculate stats
  const totalApplications = applications.length;
  const recentApplications = applications.filter((app) => {
    const daysDiff =
      (new Date().getTime() - app.created_at.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30;
  }).length;

  const avgRentApplied =
    applications.length > 0
      ? Math.round(
          applications.reduce(
            (sum, app) => sum + (app.property?.rent || 0),
            0
          ) / applications.length
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-gray-600 text-xl mt-2">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Tenant Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 "
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalApplications}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentApplications}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg. Rent Applied
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgRentApplied > 0
                    ? `$${avgRentApplied.toLocaleString()}`
                    : "$0"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.a
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex cursor-pointer items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
            >
              <Home className="h-8 w-8 text-blue-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Browse Properties
                </h3>
                <p className="text-sm text-gray-600">Find your next home</p>
              </div>
            </motion.a>

            <motion.a
              onClick={() => navigate("/apply")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex  cursor-pointer items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <FileText className="h-8 w-8 text-green-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-gray-900">New Application</h3>
                <p className="text-sm text-gray-600">Apply for a property</p>
              </div>
            </motion.a>

            <motion.a
              onClick={() => navigate("/my-applications")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex cursor-pointer items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
            >
              <Clock className="h-8 w-8 text-purple-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-gray-900">My Applications</h3>
                <p className="text-sm text-gray-600">Track your applications</p>
              </div>
            </motion.a>
          </div>
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Applications
          </h2>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.slice(0, 3).map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {application.property?.title || "Property Application"}
                    </h3>
                    <p className="text-gray-600">
                      {application.property?.city},{" "}
                      {application.property?.state}
                    </p>
                    <p className="text-sm text-gray-500">
                      Applied on{" "}
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      ${application.property?.rent.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Submitted
                    </span>
                  </div>
                </motion.div>
              ))}

              {applications.length > 3 && (
                <motion.a
                  onClick={() => navigate("/my-applications")}
                  whileHover={{ scale: 1.02 }}
                  className="block text-center py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {applications.length} applications →
                </motion.a>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start browsing properties to submit your first application
              </p>
              <motion.a
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Browse Properties
              </motion.a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
