import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Property } from "../types";
import { motion } from "framer-motion";
import { FileText, Check, AlertCircle, User, Home } from "lucide-react";

const applicationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: z.string().email("Please enter a valid email"),

  phone: z
    .string()
    .regex(/^\+?[0-9]{10}$/, "Please enter a valid phone number"),

  income: z
    .number()
    .min(100, "Income must be at least 100")
    .max(1000000, "Income cannot exceed 1,000,000"),

  move_in_date: z.string().refine((val) => new Date(val) >= new Date(), {
    message: "Move-in date must be today or in the future",
  }),

  property_id: z.string().min(1, "Property selection is required"),

  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export function Apply() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedPropertyId = searchParams.get("property");

  // Redirect owners to dashboard immediately
  useEffect(() => {
    if (user?.role === "owner") {
      navigate("/dashboard", { replace: true });
      return;
    }
    // if (!user) {
    //   navigate("/signin", { replace: true });
    //   return;
    // }
  }, [user, navigate]);

  // Don't render anything if user is owner or not authenticated
  // if (!user || user.role === "owner") {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Redirecting...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      email: user?.email || "",
      property_id: selectedPropertyId || "",
    },
  });

  useEffect(() => {
    // Load properties
    fetch("/data/properties.json")
      .then((response) => response.json())
      .then((data: Property[]) => {
        setProperties(data);
      })
      .catch((error) => {
        console.error("Error loading properties:", error);
      });

    // Set email if user is logged in
    if (user?.email) {
      setValue("email", user.email);
    }

    // Set property if selected
    if (selectedPropertyId) {
      setValue("property_id", selectedPropertyId);
    }
  }, [user, selectedPropertyId, setValue]);

  const onSubmit = async (data: ApplicationForm) => {
    if (!user) {
      alert("Please sign in before submitting an application.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "applications"), {
        ...data,
        created_at: serverTimestamp(),
        user_id: user.uid,
      });

      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/my-applications");
      }, 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="h-8 w-8 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Your rental application has been successfully submitted. You'll be
            redirected to your applications shortly.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white/20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Rental Application
                </h1>
                <p className="text-blue-100 text-lg">
                  Fill out the form below to apply for your dream home
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/70 backdrop-blur-sm"
                    placeholder="Enter your email"
                    readOnly
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="income"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Monthly Income *
                  </label>
                  <input
                    {...register("income", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                    placeholder="5000"
                  />
                  {errors.income && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.income.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Home className="h-5 w-5 text-green-600" />
                </div>
                Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="property_id"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Select Property *
                  </label>
                  <select
                    {...register("property_id")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">Choose a property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} - ${property.rent}/month
                      </option>
                    ))}
                  </select>
                  {errors.property_id && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.property_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="move_in_date"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Preferred Move-in Date *
                  </label>
                  <input
                    {...register("move_in_date")}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  />
                  {errors.move_in_date && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.move_in_date.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Additional Notes
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Application"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
