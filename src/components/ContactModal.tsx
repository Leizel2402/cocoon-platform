import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/lable";
import { submitContactForm } from "../services/contactService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Phone number formatting function from ApplicationProcess
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
      6,
      10
    )}`;
  };

  // Phone validation function from ApplicationProcess
  const validatePhone = (value: string) => {
    const phoneDigits = value.replace(/\D/g, "");
    if (!phoneDigits) return "Phone number is required";
    return phoneDigits.length !== 10
      ? "Please enter a valid 10-digit phone number"
      : "";
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    if (field === "phone") {
      const formatted = formatPhoneNumber(value);
      const error = validatePhone(formatted);
      setFormData((prev) => ({
        ...prev,
        [field]: formatted,
      }));
      setPhoneError(error);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setSubmitError("");

    // Validate phone number before submission
    const phoneValidationError = validatePhone(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Firebase using the contact service
      const result = await submitContactForm(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source: "contact_modal",
        },
        user?.uid
      );

      if (result.success) {
        // Show success state
        setIsSuccess(true);

        // Reset form after a short delay
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            phone: "",
            message: "",
          });
          setPhoneError("");
          setSubmitError("");
          setIsSuccess(false);
          onClose();
        }, 3000);
      } else {
        setSubmitError(
          result.error || "Failed to submit your message. Please try again."
        );

        // Show error toast
        toast({
          title: "Submission Failed",
          description:
            result.error ||
            "There was an error sending your message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitError(
        "There was an error sending your message. Please try again."
      );

      // Show error toast
      toast({
        title: "Network Error",
        description:
          "There was an error sending your message. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isSuccess) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setPhoneError("");
      setSubmitError("");
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting || isSuccess}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-6 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for contacting us. We'll get back to you within 24
                    hours.
                  </p>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-name"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                  >
                    <User className="h-4 w-4 text-green-600" />
                    Name *
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-email"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                  >
                    <Mail className="h-4 w-4 text-green-600" />
                    Email *
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-phone"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                  >
                    <Phone className="h-4 w-4 text-green-600" />
                    Phone Number *
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    maxLength={14}
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white/50 backdrop-blur-sm ${
                      phoneError
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 ffocus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contact-message"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                  >
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    Message *
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Tell us how we can help you..."
                    required
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>

                {/* Error Display */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 " />
                        Send Message
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
