import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Application, Property } from "../types";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Home,
  Search,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Pagination } from "../components/Pagination";
import SubmissionsDashboard from "../components/SubmissionsDashboard";

export function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Redirect non-authorized users to home
  useEffect(() => {
    if (user && !["owner", "landlord_admin", "landlord_employee", "cocoon_admin", "cocoon_employee"].includes(user.role)) {
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load applications
        const applicationsQuery = query(
          collection(db, "applications"),
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
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate metrics
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayApplications = applications.filter((app) => {
    const appDateStr = app.created_at.toISOString().split("T")[0];
    return appDateStr === todayStr;
  }).length;

  const sevenDayApplications = applications.filter(
    (app) => app.created_at >= sevenDaysAgo
  ).length;

  const thirtyDayApplications = applications.filter(
    (app) => app.created_at >= thirtyDaysAgo
  ).length;

  // Average rent by city
  const avgRentByCity = properties.reduce((acc, property) => {
    if (!acc[property.city]) {
      acc[property.city] = { total: 0, count: 0 };
    }
    acc[property.city].total += property.rent;
    acc[property.city].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const avgRentData = Object.entries(avgRentByCity).map(([city, data]) => ({
    city,
    avgRent: Math.round(data.total / data.count),
  }));

  // Applications per day (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    const count = applications.filter(
      (app) => app.created_at.toISOString().split("T")[0] === dateStr
    ).length;

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      applications: count,
    };
  });

  // Top properties by applications
  const propertyApplicationCounts = applications.reduce((acc, app) => {
    const propertyId = app.property_id;
    acc[propertyId] = (acc[propertyId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProperties = Object.entries(propertyApplicationCounts)
    .map(([propertyId, count]) => ({
      property: properties.find((p) => p.id === propertyId),
      applications: count,
    }))
    .filter((item) => item.property)
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 5);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.property?.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });
  const currentApplications = filteredApplications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg shadow-lg mr-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Owner Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Monitor your rental applications and property performance
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayApplications}
                </p>
                <p className="text-sm text-gray-500">Applications</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">7 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sevenDayApplications}
                </p>
                <p className="text-sm text-gray-500">Applications</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">30 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {thirtyDayApplications}
                </p>
                <p className="text-sm text-gray-500">Applications</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Home className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Applications Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Application Trends
                  </h3>
                  <p className="text-blue-100">
                    Daily applications over the last 14 days
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Peak: {Math.max(...last14Days.map((d) => d.applications))}{" "}
                  applications
                </div>
                <div className="text-sm text-gray-600">
                  Total:{" "}
                  {last14Days.reduce((sum, d) => sum + d.applications, 0)}{" "}
                  applications
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={last14Days}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="applicationGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        fontSize: "14px",
                      }}
                      labelStyle={{ color: "#374151", fontWeight: "bold" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="url(#lineGradient)"
                      strokeWidth={4}
                      dot={{ fill: "#3B82F6", strokeWidth: 3, r: 6 }}
                      activeDot={{
                        r: 8,
                        fill: "#3B82F6",
                        strokeWidth: 3,
                        stroke: "#fff",
                      }}
                      fill="url(#applicationGradient)"
                    />
                    <defs>
                      <linearGradient
                        id="lineGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Rent Analysis</h3>
                  <p className="text-emerald-100">
                    Average rental prices across cities
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Highest: $
                  {Math.max(
                    ...avgRentData.map((d) => d.avgRent)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Lowest: $
                  {Math.min(
                    ...avgRentData.map((d) => d.avgRent)
                  ).toLocaleString()}
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={avgRentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="city"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        fontSize: "14px",
                      }}
                      labelStyle={{ color: "#374151", fontWeight: "bold" }}
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Average Rent",
                      ]}
                    />
                    <Bar
                      dataKey="avgRent"
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                      stroke="#059669"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          <div className="px-6 py-6 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                Recent Applications
              </h3>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-blue-50 p-1 rounded-lg">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Move-in Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentApplications.slice(0, 10).map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.property?.title || "Unknown Property"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.property?.city},{" "}
                        {application.property?.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${application.income.toLocaleString()}/month
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(application.move_in_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApplications?.length > 8 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-500">
                Applications will appear here as they are submitted.
              </p>
            </div>
          )}
        </motion.div>
        {/* Top Properties */}
        {topProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Top Properties by Applications
            </h3>
            <div className="space-y-4">
              {topProperties.map((item, index) => (
                <div
                  key={item.property!.id}
                  className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.property!.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.property!.city}, {item.property!.state}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.applications} application
                    {item.applications !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submissions Dashboard for Landlords and Staff */}
        {(user?.role === "landlord_admin" || user?.role === "landlord_employee" || user?.role === "cocoon_admin" || user?.role === "cocoon_employee") && (
          <section className="bg-white border-t border-gray-200 mt-8">
            <div className="container mx-auto px-6 py-8">
              <SubmissionsDashboard 
                userRole={user.role === "landlord_admin" || user.role === "landlord_employee" ? "landlord" : "staff"} 
                userId={user?.uid}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
