import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Application, Property } from "../types";
import { motion } from "framer-motion";
import { FileText, Calendar, DollarSign, MapPin, Clock } from "lucide-react";

export function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadApplications = async () => {
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
            created_at: data.created_at?.toDate ? data.created_at.toDate() : new Date(),
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
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="text-gray-600 text-lg">Track your rental applications and their status</p>
            </div>
          </div>
        </motion.div>

        {applications.length > 0 ? (
          <div className="grid gap-6">
            {applications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="md:flex">
                  {/* Property Image */}
                  <div className="md:w-1/3">
                    <div className="relative h-48 md:h-full">
                      <img
                        src={application.property?.image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={application.property?.title || 'Property'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          Submitted
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {application.property?.title || "Property Application"}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="text-lg">
                            {application.property?.city}, {application.property?.state}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          ${application.property?.rent.toLocaleString()}
                        </div>
                        <div className="text-gray-500">per month</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-semibold text-gray-700">Move-in Date</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {new Date(application.move_in_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-semibold text-gray-700">Monthly Income</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          ${application.income.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-semibold text-gray-700">Applied</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {new Date(application.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {application.notes && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Additional Notes</h4>
                        <p className="text-gray-600">{application.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Applications Yet</h3>
              <p className="text-gray-600 mb-8 text-lg">
                You haven't submitted any rental applications yet. Start browsing properties to find your perfect home!
              </p>
              <motion.a
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Browse Properties
              </motion.a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}