import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/lable";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calender";
import { motion } from "framer-motion";

// import { useAuth } from '../../auth/services/AuthContext';
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";
import { submitApplicationWithDocuments } from "../services/submissionService";
import {
  Shield,
  User,
  DollarSign,
  Home,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  Users,
  Calendar as CalendarIcon,
  Edit,
  Plus,
  Trash2,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import ProductSelection from "../components/ProductSelection";
import LeaseTermSelection from "../components/rentar/LeaseTermSelection";
import PaymentProcess from "../components/payment/PaymentProcess";
// import QualifiedProperties from './QualifiedProperties';
// import PaymentProcess from '../payment/PaymentProcess';

interface ApplicationProcessProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
  type: "prequalify" | "apply";
  initialStep?: number | null;
  onNavigateToUnitSelection?: () => void;
}

const ApplicationProcess = ({
  isOpen,
  onClose,
  property,
  type,
  initialStep,
  onNavigateToUnitSelection,
}: ApplicationProcessProps) => {
  console.log("prequalify",type);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);
  const [showMatchingProcess, setShowMatchingProcess] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showCalendarPlaceholder, setShowCalendarPlaceholder] = useState(false);
  const [qualifiedProperties, setQualifiedProperties] = useState([]);
  const [currentProspectStep, setCurrentProspectStep] = useState<
    "qualified" | "lease_term" | "products" | "payment"
  >("qualified");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedLeaseTerm, setSelectedLeaseTerm] = useState(0);
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    // Enhanced personal info
    firstName: "",
    middleInitial: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    moveInDate: today,
    desiredLeaseTerm: "",
    ssn: "",
    isCitizen: true,
    // Financial info
    employment: "",
    employerName: "",
    employers: [
      {
        name: "",
        industry: "",
        position: "",
        income: "",
        employmentStatus: "full-time",
      },
    ],
    hasOtherIncome: false,
    otherIncomeDetails: "",
    // Current address fields
    currentStreet: "",
    currentCity: "",
    currentState: "",
    currentZip: "",
    currentDuration: "",
    // Previous address fields (shown if lived at current < 2 years)
    previousStreet: "",
    previousCity: "",
    previousState: "",
    previousZip: "",
    // Lease holders and guarantors
    leaseHolders: [],
    guarantors: [],
    // Additional occupants
    additionalOccupants: [],
    // Additional info (moved to later screen)
    pets: [],
    hasPets: undefined,
    emergencyContact: {
      name: "",
      phone: "",
      email: "",
      relation: "",
    },
    vehicles: [],
    hasVehicles: undefined,
    additionalInfo: "",
    // Documents
    documents: {
      id: []
    },
    // Permissions
    backgroundCheckPermission: false,
    textMessagePermission: true,
  });

  const [rawSSN, setRawSSN] = useState("");
  const [ssnFocused, setSsnFocused] = useState(false);
  const [holderSSNStates, setHolderSSNStates] = useState<{
    [key: number]: { raw: string; focused: boolean };
  }>({});
  const [guarantorSSNStates, setGuarantorSSNStates] = useState<{
    [key: number]: { raw: string; focused: boolean };
  }>({});
  const [occupantSSNStates, setOccupantSSNStates] = useState<{
    [key: number]: { raw: string; focused: boolean };
  }>({});
  const [dobError, setDobError] = useState("");
  const [holderDobErrors, setHolderDobErrors] = useState<{
    [key: number]: string;
  }>({});
  const [guarantorDobErrors, setGuarantorDobErrors] = useState<{
    [key: number]: string;
  }>({});

  // Enhanced validation state
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [validationMessages, setValidationMessages] = useState<{[key: string]: string}>({});

  // Pre-populate with user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Validate DOB on component mount or when dateOfBirth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const error = validateDOB(formData.dateOfBirth);
      setDobError(error);
    }
  }, [formData.dateOfBirth]);

  const steps = [
    { title: "Personal Info", icon: User },
    { title: "Financial Info", icon: DollarSign },
    { title: "Housing History", icon: Home },
    { title: "Lease Holders & Guarantors", icon: Users },
    { title: "Additional Occupants", icon: User },
    { title: "Additional Info", icon: FileText },
    { title: "Documents", icon: FileText },
    { title: "Review & Submit", icon: CheckCircle },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Auto-save functionality
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem("applicationFormData", JSON.stringify(formData));
    };
    const timer = setTimeout(saveData, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("applicationFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure arrays remain arrays
        const safeData = {
          ...parsedData,
          vehicles: Array.isArray(parsedData.vehicles)
            ? parsedData.vehicles
            : [],
          pets: Array.isArray(parsedData.pets) ? parsedData.pets : [],
          additionalOccupants: Array.isArray(parsedData.additionalOccupants)
            ? parsedData.additionalOccupants
            : [],
          leaseHolders: Array.isArray(parsedData.leaseHolders)
            ? parsedData.leaseHolders
            : [],
          guarantors: Array.isArray(parsedData.guarantors)
            ? parsedData.guarantors
            : [],
          employers: Array.isArray(parsedData.employers)
            ? parsedData.employers
            : [
                {
                  name: "",
                  industry: "",
                  position: "",
                  income: "",
                  employmentStatus: "full-time",
                },
              ],
        };
        setFormData((prev) => ({
          ...prev,
          ...safeData,
          moveInDate: safeData.moveInDate || prev.moveInDate || today,
        }));
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  // Validation functions
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

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(
      5,
      9
    )}`;
  };

  const maskSSNDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    if (numbers.length <= 3) return "•".repeat(numbers.length);
    if (numbers.length <= 5) return `•••-${"•".repeat(numbers.length - 3)}`;
    if (numbers.length <= 9) return `•••-••-${"•".repeat(numbers.length - 5)}`;
    return "•••-••-••••";
  };

  const formatCurrency = (value: string) => {
    // Only allow digits during typing
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleIncomeChange = (value: string, employerIndex: number) => {
    // Only allow digits during typing
    const digitsOnly = value.replace(/\D/g, "");
    const updated = [...formData.employers];
    updated[employerIndex] = { ...updated[employerIndex], income: digitsOnly };
    setFormData({ ...formData, employers: updated });
  };

  const handleIncomeBlur = (employerIndex: number) => {
    // Format with commas on blur
    const updated = [...formData.employers];
    const income = updated[employerIndex]?.income || "";
    if (income) {
      updated[employerIndex] = {
        ...updated[employerIndex],
        income: formatCurrency(income),
      };
      setFormData({ ...formData, employers: updated });
    }
  };

  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Construction",
    "Hospitality",
    "Transportation",
    "Government",
    "Non-profit",
    "Other",
  ];

  const positionOptions = [
    "Manager",
    "Supervisor",
    "Director",
    "VP",
    "C-Level",
    "Individual Contributor",
    "Intern",
    "Contractor",
    "Consultant",
    "Other",
  ];

  const vehicleTypes = ["Car", "Truck", "Van", "SUV", "Motorcycle", "Other"];

  const jumpToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Enhanced validation functions
  const validateField = (fieldName: string, value: any, fieldType?: string): string => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return !value || value.trim() === '' ? `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` : '';
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (!phoneDigits) return 'Phone number is required';
        return phoneDigits.length !== 10 ? 'Please enter a valid 10-digit phone number' : '';
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        const dobError = validateDOB(value);
        return dobError;
      case 'ssn':
        const ssnDigits = value.replace(/\D/g, '');
        if (!ssnDigits) return 'SSN/TIN/EIN is required';
        return ssnDigits.length !== 9 ? 'Please enter a valid 9-digit SSN/TIN/EIN' : '';
      case 'moveInDate':
        return !value ? 'Move-in date is required' : '';
      case 'currentStreet':
      case 'currentCity':
      case 'currentState':
        return !value || value.trim() === '' ? 'This field is required' : '';
      case 'currentZip':
        if (!value) return 'ZIP code is required';
        return value.length !== 5 ? 'Please enter a valid 5-digit ZIP code' : '';
      case 'currentDuration':
        return !value ? 'Please specify how long you have lived at this address' : '';
      case 'employment':
        return !value ? 'Employment status is required' : '';
      case 'employerName':
        if (formData.employment !== 'unemployed' && (!value || value.trim() === '')) {
          return 'Employer name is required';
        }
        return '';
      case 'monthlyIncome':
        if (formData.employment !== 'unemployed' && (!value || value.trim() === '')) {
          return 'Monthly income is required';
        }
        return '';
      default:
        return '';
    }
  };

  const validateStep = (step: number): {isValid: boolean, errors: {[key: string]: string}, missingFields: string[]} => {
    const errors: {[key: string]: string} = {};
    const missingFields: string[] = [];

    switch (step) {
      case 0: // Personal Info
        const personalFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'ssn', 'moveInDate'];
        personalFields.forEach(field => {
          const error = validateField(field, formData[field as keyof typeof formData]);
          if (error) {
            errors[field] = error;
            missingFields.push(field);
          }
        });
        
        // Check DOB error state
        if (dobError) {
          errors['dateOfBirth'] = dobError;
          missingFields.push('dateOfBirth');
        }
        
        // Check SSN format
        const ssnError = validateField('ssn', rawSSN);
        if (ssnError) {
          errors['ssn'] = ssnError;
          missingFields.push('ssn');
        }
        
        // Check middle initial
        if (formData.middleInitial === undefined) {
          errors['middleInitial'] = 'Middle initial is required';
          missingFields.push('middleInitial');
        }
        
        break;

      case 1: // Financial Info
        const employmentError = validateField('employment', formData.employment);
        if (employmentError) {
          errors['employment'] = employmentError;
          missingFields.push('employment');
        }
        
        if (formData.employment !== 'unemployed') {
          // Check employer name from both sources
          const employerName = formData.employerName || formData.employers[0]?.name || '';
          const employerError = validateField('employerName', employerName);
          if (employerError) {
            errors['employerName'] = employerError;
            missingFields.push('employerName');
          }
          
          // Check industry
          const industry = formData.employers[0]?.industry || '';
          if (!industry) {
            errors['industry'] = 'Industry is required';
            missingFields.push('industry');
          }
          
          // Check position
          const position = formData.employers[0]?.position || '';
          if (!position) {
            errors['position'] = 'Position is required';
            missingFields.push('position');
          }
          
          // Check income from employers array
          const primaryIncome = formData.employers[0]?.income || '';
          const incomeError = validateField('monthlyIncome', primaryIncome);
          if (incomeError) {
            errors['monthlyIncome'] = incomeError;
            missingFields.push('monthlyIncome');
          }
        }
        break;

      case 2: // Housing History
        const housingFields = ['currentStreet', 'currentCity', 'currentState', 'currentZip', 'currentDuration'];
        housingFields.forEach(field => {
          const error = validateField(field, formData[field as keyof typeof formData]);
          if (error) {
            errors[field] = error;
            missingFields.push(field);
          }
        });
        
        // Check previous address if needed
        if (formData.currentDuration === '0-2') {
          const previousFields = ['previousStreet', 'previousCity', 'previousState', 'previousZip'];
          previousFields.forEach(field => {
            const error = validateField(field, formData[field as keyof typeof formData]);
            if (error) {
              errors[field] = error;
              missingFields.push(field);
            }
          });
        }
        break;

      case 3: // Lease Holders & Guarantors
        // Check DOB errors for holders and guarantors
        const holderErrors = Object.values(holderDobErrors).some(error => error !== '');
        const guarantorErrors = Object.values(guarantorDobErrors).some(error => error !== '');
        
        if (holderErrors) {
          errors['leaseHolders'] = 'Please fix date of birth errors for lease holders';
          missingFields.push('leaseHolders');
        }
        
        if (guarantorErrors) {
          errors['guarantors'] = 'Please fix date of birth errors for guarantors';
          missingFields.push('guarantors');
        }
        break;

      case 6: // Documents
        if (formData.documents.id.length === 0) {
          errors['documents'] = 'At least one ID document is required';
          missingFields.push('documents');
        }
        break;

      case 7: // Review & Submit
        if (!formData.backgroundCheckPermission) {
          errors['backgroundCheckPermission'] = 'Background check authorization is required';
          missingFields.push('backgroundCheckPermission');
        }
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      missingFields
    };
  };

  const isStepValid = () => {
    const validation = validateStep(currentStep);
    if (currentStep === 1) {
      console.log('Financial Info Validation:', {
        employment: formData.employment,
        employerName: formData.employerName,
        employersArray: formData.employers,
        primaryIncome: formData.employers[0]?.income,
        validation,
        isValid: validation.isValid
      });
    }
    return validation.isValid;
  };

  const handleNext = () => {
    if (isStepValid() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (!isStepValid()) {
      const validation = validateStep(currentStep);
      const errorCount = validation.missingFields.length;
      const fieldNames = validation.missingFields.slice(0, 3).join(', ');
      const moreFields = errorCount > 3 ? ` and ${errorCount - 3} more field${errorCount - 3 > 1 ? 's' : ''}` : '';
      
      toast({
        title: "Missing Required Information",
        description: `Please complete: ${fieldNames}${moreFields}`,
        variant: "destructive",
      });
      
      // Update field errors for visual feedback
      setFieldErrors(validation.errors);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // SafeRent normalization functions
  const formatPhoneE164 = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return `+${digits}`;
  };

  // Date input masking for MM/DD/YYYY
  const formatDateInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const formatDOB = (dob: string): string => {
    // Convert MM/DD/YYYY to YYYY-MM-DD for SafeRent
    if (!dob) return "";

    // Only process if it's in MM/DD/YYYY format (contains slashes)
    if (dob.includes("/")) {
      const parts = dob.split("/");
      if (parts.length === 3) {
        const [mm, dd, yyyy] = parts;
        // Validate parts before formatting
        const month = parseInt(mm);
        const day = parseInt(dd);
        const year = parseInt(yyyy);

        // Ensure we have valid numbers and proper 4-digit year
        if (!isNaN(month) && !isNaN(day) && !isNaN(year) && yyyy.length === 4) {
          return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        }
      }
    }

    // If already in YYYY-MM-DD format or invalid, return as is
    return dob;
  };

  const validateDateMMDDYYYY = (date: string): string => {
    if (!date) return "Date is required";

    // Check format MM/DD/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return "Please enter a valid date in MM/DD/YYYY format";
    }

    const parts = date.split("/");
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    // Check year is exactly 4 digits and reasonable
    if (year < 1900 || year > new Date().getFullYear()) {
      return "Please enter a valid year (1900 - present)";
    }

    // Check month is valid
    if (month < 1 || month > 12) {
      return "Please enter a valid month (01-12)";
    }

    // Check if the date is valid (this handles days per month, leap years, etc.)
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return "Please enter a valid date";
    }

    return ""; // No errors
  };

  const validateDOB = (dob: string): string => {
    const baseError = validateDateMMDDYYYY(dob);
    if (baseError) return baseError;

    // Additional check for age >= 18
    const parts = dob.split("/");
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    const dateObj = new Date(year, month - 1, day);

    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (dateObj > eighteenYearsAgo) {
      return "Applicant must be at least 18 years old";
    }

    return ""; // No errors
  };

  const handleDOBChange = (value: string) => {
    // Apply input mask
    const maskedValue = formatDateInput(value);
    setFormData({ ...formData, dateOfBirth: maskedValue });

    // Validate on blur or when complete
    if (maskedValue.length === 10) {
      const error = validateDOB(maskedValue);
      setDobError(error);
    } else {
      setDobError("");
    }
  };

  const handleDOBBlur = (value: string) => {
    const error = validateDOB(value);
    setDobError(error);
  };

  // Real-time field validation
  const handleFieldChange = (fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    // Clear error when field becomes valid
    if (!error) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Get field error state
  const getFieldError = (fieldName: string): string => {
    return fieldErrors[fieldName] || '';
  };

  // Get field error styling
  const getFieldErrorStyle = (fieldName: string): string => {
    return fieldErrors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  };

  const handleHolderDOBChange = (value: string, index: number) => {
    const maskedValue = formatDateInput(value);
    const updated = [...formData.leaseHolders];
    updated[index] = { ...updated[index], dateOfBirth: maskedValue };
    setFormData({ ...formData, leaseHolders: updated });

    if (maskedValue.length === 10) {
      const error = validateDOB(maskedValue); // Use same validation as applicant
      setHolderDobErrors((prev) => ({ ...prev, [index]: error }));
    } else {
      setHolderDobErrors((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const handleHolderDOBBlur = (value: string, index: number) => {
    const error = validateDOB(value); // Use same validation as applicant
    setHolderDobErrors((prev) => ({ ...prev, [index]: error }));
  };

  const handleGuarantorDOBChange = (value: string, index: number) => {
    const maskedValue = formatDateInput(value);
    const updated = [...formData.guarantors];
    updated[index] = { ...updated[index], dateOfBirth: maskedValue };
    setFormData({ ...formData, guarantors: updated });

    if (maskedValue.length === 10) {
      const error = validateDOB(maskedValue);
      setGuarantorDobErrors((prev) => ({ ...prev, [index]: error }));
    } else {
      setGuarantorDobErrors((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const handleGuarantorDOBBlur = (value: string, index: number) => {
    const error = validateDOB(value);
    setGuarantorDobErrors((prev) => ({ ...prev, [index]: error }));
  };

  const normalizeIncome = (income: string): string => {
    return income.replace(/,/g, ""); // remove commas
  };

  // Helper function to capitalize names
  const capitalizeName = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to capitalize state abbreviations
  const capitalizeState = (state: string): string => {
    if (!state) return "";
    return state.toUpperCase();
  };

  const handleSubmit = async () => {
    console.log("🔥 SUBMIT BUTTON CLICKED - Starting SafeRent JSON capture...");

    // Validation: Check if citizenship status is missing for any applicant
    if (formData.isCitizen === null || formData.isCitizen === undefined) {
      toast({
        title: "Validation Error",
        description:
          "Please specify citizenship status for the primary applicant.",
        variant: "destructive",
      });
      setCurrentStep(0);
      return;
    }

    // Check lease holders citizenship
    for (let i = 0; i < formData.leaseHolders.length; i++) {
      const holder = formData.leaseHolders[i];
      if (holder.isCitizen === null || holder.isCitizen === undefined) {
        toast({
          title: "Validation Error",
          description: `Please specify citizenship status for lease holder ${
            i + 1
          }.`,
          variant: "destructive",
        });
        setCurrentStep(3);
        return;
      }
    }

    // Check guarantors citizenship
    for (let i = 0; i < formData.guarantors.length; i++) {
      const guarantor = formData.guarantors[i];
      if (guarantor.isCitizen === null || guarantor.isCitizen === undefined) {
        toast({
          title: "Validation Error",
          description: `Please specify citizenship status for guarantor ${
            i + 1
          }.`,
          variant: "destructive",
        });
        setCurrentStep(3);
        return;
      }
    }

    // Validation: Check Duration for all address entries
    // Check primary applicant address duration
    if (!formData.currentDuration) {
      toast({
        title: "Validation Error",
        description:
          "Please specify how long you have lived at your current address.",
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }

    // Check lease holders address duration
    for (let i = 0; i < formData.leaseHolders.length; i++) {
      const holder = formData.leaseHolders[i];
      if (!holder.currentDuration) {
        toast({
          title: "Validation Error",
          description: `Please specify how long lease holder ${
            i + 1
          } has lived at their current address.`,
          variant: "destructive",
        });
        setCurrentStep(3);
        return;
      }
    }

    // Check guarantors address duration
    for (let i = 0; i < formData.guarantors.length; i++) {
      const guarantor = formData.guarantors[i];
      if (!guarantor.currentDuration) {
        toast({
          title: "Validation Error",
          description: `Please specify how long guarantor ${
            i + 1
          } has lived at their current address.`,
          variant: "destructive",
        });
        setCurrentStep(3);
        return;
      }
    }

    // Validation: Check DOB for all person types
    // Check primary applicant DOB
    if (!formData.dateOfBirth || dobError) {
      toast({
        title: "Validation Error",
        description:
          "Please provide a valid date of birth for the primary applicant.",
        variant: "destructive",
      });
      setCurrentStep(0);
      return;
    }

    // Check lease holders DOB
    for (let i = 0; i < formData.leaseHolders.length; i++) {
      const holder = formData.leaseHolders[i];
      if (!holder.dateOfBirth || holderDobErrors[i]) {
        toast({
          title: "Validation Error",
          description: `Please provide a valid date of birth for lease holder ${
            i + 1
          }.`,
          variant: "destructive",
        });
        setCurrentStep(3);
        return;
      }
    }

    // Check guarantors DOB
    for (let i = 0; i < formData.guarantors.length; i++) {
      const guarantor = formData.guarantors[i];
      if (!guarantor.dateOfBirth || guarantorDobErrors[i]) {
        toast({
          title: "Validation Error",
          description: `Please provide a valid date of birth for guarantor ${
            i + 1
          }.`,
          variant: "destructive",
        });
        setCurrentStep(3);
        return;
      }
    }

    // Check additional occupants DOB (for those 18+)
    for (let i = 0; i < formData.additionalOccupants.length; i++) {
      const occupant = formData.additionalOccupants[i];
      const occupantAge = occupant.age ? parseInt(occupant.age) : 0;

      if (occupantAge >= 18 && occupant.dateOfBirth) {
        // Validate DOB format for adult occupants
        const dobError = validateDOB(occupant.dateOfBirth);
        if (dobError) {
          toast({
            title: "Validation Error",
            description: `Please provide a valid date of birth for additional occupant ${
              i + 1
            }: ${dobError}`,
            variant: "destructive",
          });
          setCurrentStep(4);
          return;
        }
      }
    }

    // Validation: Check vehicles year if vehicles exist
    if (formData.hasVehicles && formData.vehicles.length > 0) {
      for (let i = 0; i < formData.vehicles.length; i++) {
        const vehicle = formData.vehicles[i];
        const yearStr = vehicle?.year ? String(vehicle.year).trim() : "";
        const year = parseInt(yearStr);

        if (
          !yearStr ||
          isNaN(year) ||
          yearStr.length !== 4 ||
          year < 1900 ||
          year > new Date().getFullYear()
        ) {
          toast({
            title: "Validation Error",
            description: `Please provide a valid 4-digit year for vehicle ${
              i + 1
            }.`,
            variant: "destructive",
          });
          setCurrentStep(5);
          return;
        }
      }
    }

    // Validation: Check emergency contact relation
    if (!formData.emergencyContact.relation) {
      toast({
        title: "Validation Error",
        description: "Please specify the relation for your emergency contact.",
        variant: "destructive",
      });
      setCurrentStep(5);
      return;
    }

    // Validate additional occupants - must have Age if under 18, DOB if 18+
    for (let i = 0; i < formData.additionalOccupants.length; i++) {
      const occupant = formData.additionalOccupants[i];
      const occupantAge = occupant.age ? parseInt(occupant.age) : 0;

      if (occupantAge >= 18) {
        if (!occupant.dateOfBirth) {
          toast({
            title: "Validation Error",
            description: `Please provide date of birth for additional occupant ${
              i + 1
            } (18 years or older).`,
            variant: "destructive",
          });
          setCurrentStep(4);
          return;
        }
      } else if (occupantAge > 0 && occupantAge < 18) {
        if (!occupant.age) {
          toast({
            title: "Validation Error",
            description: `Please provide age for additional occupant ${
              i + 1
            } (under 18 years old).`,
            variant: "destructive",
          });
          setCurrentStep(4);
          return;
        }
      } else if (!occupant.age && !occupant.dateOfBirth) {
        toast({
          title: "Validation Error",
          description: `Please provide age for additional occupant ${i + 1}.`,
          variant: "destructive",
        });
        setCurrentStep(4);
        return;
      }
    }

    // Validate pets - Age and Weight are required
    console.log("🐞 Pets before validation:", JSON.stringify(formData.pets));
    for (let i = 0; i < formData.pets.length; i++) {
      const pet = formData.pets[i];
      const petAgeRaw = pet?.age != null ? String(pet.age) : "";
      const petAge = petAgeRaw.trim();
      const petAgeNumeric = petAge.replace(/\D/g, "");
      const petWeightRaw = pet?.weight != null ? String(pet.weight) : "";
      const petWeight = petWeightRaw.trim();
      const petWeightNumeric = petWeight.replace(/[^0-9]/g, "");

      if (!petAgeNumeric) {
        toast({
          title: "Validation Error",
          description: `Please provide age for pet ${i + 1}.`,
          variant: "destructive",
        });
        setCurrentStep(5);
        return;
      }
      if (!petWeightNumeric) {
        toast({
          title: "Validation Error",
          description: `Please provide weight for pet ${i + 1}.`,
          variant: "destructive",
        });
        setCurrentStep(5);
        return;
      }
    }

    // Helper function to normalize phone numbers for all applicants
    const normalizePhoneForApplicant = (phone: string): string => {
      if (!phone) return "";
      return formatPhoneE164(phone);
    };

    // Helper function to normalize SSN for all applicants
    const normalizeSSNForApplicant = (ssn: string, rawSSN?: string): string => {
      return (rawSSN || ssn || "").replace(/\D/g, ""); // Strip formatting
    };

    // Helper function to map addresses
    const mapAddresses = (current: any, previous?: any): any[] => {
      const addresses = [];
      if (current.street) {
        // Map duration values to proper display names, ensure it's never blank
        let durationValue = current.duration;
        if (durationValue === "0-2") {
          durationValue = "Less than 2 years";
        } else if (
          durationValue === "2+" ||
          durationValue === "2-5" ||
          durationValue === "5+"
        ) {
          durationValue = "More than 2 years";
        } else if (!durationValue) {
          durationValue = "Current"; // Default fallback if somehow empty
        }

        addresses.push({
          Street: current.street,
          City: current.city,
          State: current.state,
          Zip: current.zip,
          Duration: durationValue,
        });
      }
      if (previous?.street) {
        addresses.push({
          Street: previous.street,
          City: previous.city,
          State: previous.state,
          Zip: previous.zip,
          Duration: "Previous",
        });
      }
      return addresses;
    };

    // Helper function to map employers
    const mapEmployers = (employers: any[]): any[] => {
      return (employers || [])
        .filter((emp) => emp.name)
        .map((emp) => ({
          Employer: emp.name || "",
          Industry: emp.industry || "",
          Position: emp.position || "",
          Income: normalizeIncome(emp.income || ""),
          EmploymentStatus: emp.employmentStatus || "",
        }));
    };

    // Map primary applicant addresses
    const primaryAddresses = mapAddresses(
      {
        street: formData.currentStreet,
        city: formData.currentCity,
        state: formData.currentState,
        zip: formData.currentZip,
        duration: formData.currentDuration,
      },
      formData.currentDuration === "0-2" && formData.previousStreet
        ? {
            street: formData.previousStreet,
            city: formData.previousCity,
            state: formData.previousState,
            zip: formData.previousZip,
          }
        : undefined
    );

    // Map primary applicant employers
    const primaryEmployers = mapEmployers(formData.employers);

    // Map lease holders to SafeRent format with full structure
    const mappedLeaseHolders = formData.leaseHolders.map(
      (holder: any, index: number) => ({
        FirstName: holder.firstName || "",
        MiddleInitial: holder.middleInitial || "",
        LastName: holder.lastName || "",
        DOB: holder.dateOfBirth ? formatDOB(holder.dateOfBirth) : "",
        SSN: normalizeSSNForApplicant(holder.ssn, holderSSNStates[index]?.raw),
        Email: holder.email || "",
        Phone: normalizePhoneForApplicant(holder.phone),
        CitizenshipStatus: holder.isCitizen ? "Citizen" : "Non-Citizen",
        Addresses: mapAddresses(
          {
            street: holder.currentStreet,
            city: holder.currentCity,
            state: holder.currentState,
            zip: holder.currentZip,
            duration: holder.currentDuration,
          },
          holder.currentDuration === "0-2" && holder.previousStreet
            ? {
                street: holder.previousStreet,
                city: holder.previousCity,
                state: holder.previousState,
                zip: holder.previousZip,
              }
            : undefined
        ),
        Employers:
          holder.employers && holder.employers.length > 0
            ? mapEmployers(holder.employers)
            : [
                {
                  Employer: holder.employerName || "",
                  Industry: holder.industry || "",
                  Position: holder.position || "",
                  Income: normalizeIncome(holder.monthlyIncome || ""),
                  EmploymentStatus: holder.employmentStatus || "",
                },
              ].filter((emp) => emp.Employer),
      })
    );

    // Map guarantors to SafeRent format with full structure
    const mappedGuarantors = formData.guarantors.map(
      (guarantor: any, index: number) => ({
        FirstName: capitalizeName(guarantor.firstName || ""),
        MiddleInitial: guarantor.middleInitial || "",
        LastName: capitalizeName(guarantor.lastName || ""),
        DOB: guarantor.dateOfBirth ? formatDOB(guarantor.dateOfBirth) : "",
        SSN: normalizeSSNForApplicant(
          guarantor.ssn,
          guarantorSSNStates[index]?.raw
        ),
        Email: guarantor.email || "",
        Phone: normalizePhoneForApplicant(guarantor.phone),
        CitizenshipStatus: guarantor.isCitizen ? "Citizen" : "Non-Citizen",
        Addresses: mapAddresses(
          {
            street: guarantor.currentStreet,
            city: guarantor.currentCity,
            state: capitalizeState(guarantor.currentState),
            zip: guarantor.currentZip,
            duration: guarantor.currentDuration,
          },
          guarantor.currentDuration === "0-2" && guarantor.previousStreet
            ? {
                street: guarantor.previousStreet,
                city: guarantor.previousCity,
                state: capitalizeState(guarantor.previousState),
                zip: guarantor.previousZip,
              }
            : undefined
        ),
        Employers: guarantor.employers
          ? mapEmployers(guarantor.employers)
          : [
              {
                Employer: capitalizeName(guarantor.employerName || ""),
                Industry: guarantor.industry || "",
                Position: guarantor.position || "",
                Income: normalizeIncome(guarantor.monthlyIncome || ""),
                EmploymentStatus: guarantor.employmentStatus || "",
              },
            ].filter((emp) => emp.Employer),
      })
    );

    // Map additional occupants to SafeRent format with Age or DOB based on age
    const mappedAdditionalOccupants = formData.additionalOccupants.map(
      (occupant: any, index: number) => {
        const occupantData: any = {
          FirstName: occupant.firstName || "",
          MiddleInitial: occupant.middleInitial || "",
          LastName: occupant.lastName || "",
        };

        const occupantAge = occupant.age ? parseInt(occupant.age) : 0;

        // Include DOB if occupant is 18 or older and DOB is provided
        if (occupantAge >= 18 && occupant.dateOfBirth) {
          occupantData.DOB = formatDOB(occupant.dateOfBirth);
        }
        // Include Age if occupant is under 18
        else if (occupantAge > 0 && occupantAge < 18) {
          occupantData.Age = occupant.age;
        }

        return occupantData;
      }
    );

    // Map additional info section
    const additionalInfo = {
      Pets: formData.pets.map((pet) => {
        const ageStr = pet?.age != null ? String(pet.age) : "";
        const ageNumeric = ageStr.replace(/\D/g, "");
        const weightStr = pet?.weight != null ? String(pet.weight) : "";
        const weightNumeric = weightStr.replace(/[^0-9]/g, "");
        return {
          Type: pet.type || "",
          Breed: pet.breed || "",
          Age: ageNumeric,
          Weight: weightNumeric ? `${weightNumeric} lbs` : "",
        };
      }),
      Vehicles: formData.vehicles.map((vehicle) => ({
        Make: vehicle.make || "",
        Model: vehicle.model || "",
        Year: vehicle.year ? String(vehicle.year) : "",
        LicensePlate: vehicle.licensePlate || "",
      })),
      EmergencyContact: {
        Name: formData.emergencyContact.name || "",
        Phone: formData.emergencyContact.phone
          ? formatPhoneE164(formData.emergencyContact.phone)
          : "",
        Relation: formData.emergencyContact.relation || "",
      },
      Notes: formData.additionalInfo || "",
    };

    // Create SafeRent-ready JSON object with complete structure
    const saferentData = {
      // Primary Applicant with full structure
      FirstName: formData.firstName,
      MiddleInitial: formData.middleInitial || "",
      LastName: formData.lastName,
      Email: formData.email,
      Phone: formatPhoneE164(formData.phone),
      DOB: formatDOB(formData.dateOfBirth),
      SSN: (rawSSN || formData.ssn).replace(/\D/g, ""), // Strip formatting
      CitizenshipStatus: formData.isCitizen ? "Citizen" : "Non-Citizen",
      MoveInDate: formData.moveInDate,
      LeaseTerm: formData.desiredLeaseTerm,

      // Primary applicant addresses and employers
      Addresses: primaryAddresses,
      Employers: primaryEmployers,

      // Additional Applicants with full structure
      LeaseHolders: mappedLeaseHolders,
      Guarantors: mappedGuarantors,
      AdditionalOccupants: mappedAdditionalOccupants,

      // Additional Information
      AdditionalInfo: additionalInfo,
    };

    // Console log the SafeRent-ready JSON structure
    console.log("🔥🔥🔥 SAFERENT-READY JSON CAPTURED 🔥🔥🔥");
    console.log("SafeRent-ready JSON:", JSON.stringify(saferentData, null, 2));
    console.log("🔥🔥🔥 END SAFERENT JSON 🔥🔥🔥");

    // Show toast confirmation
    toast({
      title: "✅ Application JSON formatted for SafeRent",
      description:
        "Application JSON now includes vehicles with year, emergency contact relation, validated addresses and employers, and clearer section layout. All DOB fields are normalized to YYYY-MM-DD format.",
    });

    // Submit to Firebase
    try {
      const applicationData = {
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        ssn: formData.ssn,
        currentAddress: `${formData.currentStreet}, ${formData.currentCity}, ${formData.currentState} ${formData.currentZip}`,
        city: formData.currentCity,
        state: formData.currentState,
        zipCode: formData.currentZip,
        
        // Employment Information
        employer: formData.employers[0]?.name || '',
        jobTitle: formData.employers[0]?.position || '',
        employmentStatus: formData.employers[0]?.employmentStatus || '',
        annualIncome: parseFloat(formData.employers[0]?.income?.replace(/[^0-9.]/g, '') || '0'),
        employmentStartDate: formData.employers[0]?.startDate || '',
        
        // Rental History
        previousLandlordName: formData.previousLandlordName || '',
        previousLandlordPhone: formData.previousLandlordPhone || '',
        previousRentAmount: parseFloat(formData.previousRentAmount?.replace(/[^0-9.]/g, '') || '0'),
        rentalHistory: formData.rentalHistory || '',
        
        // References
        reference1Name: formData.references?.[0]?.name || '',
        reference1Phone: formData.references?.[0]?.phone || '',
        reference1Relationship: formData.references?.[0]?.relationship || '',
        reference2Name: formData.references?.[1]?.name || '',
        reference2Phone: formData.references?.[1]?.phone || '',
        reference2Relationship: formData.references?.[1]?.relationship || '',
        
        // Property Information
        propertyId: property?.id || 'general-application',
        propertyName: property?.name || 'General Application',
        unitId: selectedUnit?.id || null,
        unitNumber: selectedUnit?.unitNumber || null,
        
        // Additional fields
        notes: formData.notes || '',
        creditScore: formData.creditScore || 0,
        hasPets: formData.hasPets || false,
        petDetails: formData.pets?.map(pet => `${pet.type}: ${pet.name} (${pet.age} years, ${pet.weight} lbs)`).join(', ') || '',
        emergencyContactName: formData.emergencyContact?.name || '',
        emergencyContactPhone: formData.emergencyContact?.phone || '',
        emergencyContactRelationship: formData.emergencyContact?.relation || '',
        submittedBy: user?.uid || '',
      };

      const result = await submitApplicationWithDocuments(
        applicationData,
        formData.documents,
        user?.uid || ''
      );
      
      if (result.success) {
        toast({
          title: "Application Submitted Successfully",
          description: `Your application has been submitted to Firebase with ${result.documentsUploaded || 0} documents uploaded.`,
        });
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application to Firebase:', error);
      toast({
        title: "Firebase Submission Failed",
        description: "Application was formatted for SafeRent but failed to save to Firebase. Please try again.",
        variant: "destructive"
      });
    }

    // Original submit logic
    toast({
      title: "Application Submitted",
      description: "Your application has been submitted for processing.",
    });

    // Show matching process placeholder
    setShowMatchingProcess(true);
  };

  const handleMatchingResult = (hasHousing: boolean) => {
    if (hasHousing) {
      // Show congratulations and proceed to product selection
      const testBypassMode = !user;
      toast({
        title: testBypassMode
          ? "🧪 Test: Congratulations! 🎉"
          : "Congratulations! 🎉",
        description: testBypassMode
          ? "Test Bypass Mode: Housing simulation completed! You can now proceed to select products and test the payment flow."
          : "Housing is available! You can now proceed to select your products and finalize your application.",
      });

      // Mock qualified properties - only keep one
      const mockQualifiedProperties = [
        {
          id: 1,
          title: "Test Property - Luxury High-Rise Unit",
          address: "456 Oak Ave, Austin, TX 78704",
          rent: 2800,
          bedrooms: 2,
          bathrooms: 2.5,
          image: "/api/placeholder/400/300",
          availableDate: "2024-02-15",
        },
      ];
      setQualifiedProperties(mockQualifiedProperties);
      setShowMatchingProcess(false);
      setShowResults(true);
    } else {
      // Show message and return to dashboard
      toast({
        title: "No Housing Available",
        description:
          "Unfortunately, no housing options are available at this time. Please try again later or contact support for assistance.",
        variant: "destructive",
      });

      // Close modal and return to dashboard after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleScheduleTour = () => {
    setShowCalendarPlaceholder(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Enhanced Personal Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    handleFieldChange('firstName', e.target.value);
                  }}
                  placeholder="Enter first name"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('firstName')}`}
                  required
                />
                {getFieldError('firstName') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('firstName')}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    handleFieldChange('lastName', e.target.value);
                  }}
                  placeholder="Enter last name"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('lastName')}`}
                  required
                />
                {getFieldError('lastName') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('lastName')}</p>
                )}
              </div>
            </div>
            <div>
              <Label 
                htmlFor="middleInitial"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Middle Initial (Optional)
              </Label>
              <Input
                id="middleInitial"
                value={formData.middleInitial}
                onChange={(e) =>
                  setFormData({ ...formData, middleInitial: e.target.value })
                }
                placeholder="M"
                maxLength={1}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label 
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    handleFieldChange('email', e.target.value);
                  }}
                  placeholder="Enter email"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-gray-50/70 backdrop-blur-sm ${getFieldErrorStyle('email')}`}
                  required
                />
                {getFieldError('email') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
                )}
              </div>
              <div>
                <Label 
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData({ ...formData, phone: formatted });
                    handleFieldChange('phone', formatted);
                  }}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('phone')}`}
                  required
                />
                {getFieldError('phone') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label 
                  htmlFor="dateOfBirth"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    handleDOBChange(e.target.value);
                    handleFieldChange('dateOfBirth', e.target.value);
                  }}
                  onBlur={(e) => handleDOBBlur(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${
                    dobError || getFieldError('dateOfBirth') ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {(dobError || getFieldError('dateOfBirth')) && (
                  <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {dobError || getFieldError('dateOfBirth')}
                  </p>
                )}
              </div>
              <div>
                <Label 
                  htmlFor="ssn"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  SSN/TIN/EIN *
                </Label>
                <Input
                  id="ssn"
                  value={
                    ssnFocused
                      ? formatSSN(rawSSN)
                      : rawSSN
                      ? maskSSNDisplay(rawSSN)
                      : ""
                  }
                  onFocus={() => setSsnFocused(true)}
                  onBlur={() => setSsnFocused(false)}
                  onChange={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "");
                    setRawSSN(numbers);
                    setFormData({ ...formData, ssn: formatSSN(numbers) });
                    handleFieldChange('ssn', formatSSN(numbers));
                  }}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('ssn')}`}
                />
                {getFieldError('ssn') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('ssn')}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label 
                  htmlFor="moveInDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Desired Move-in Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white/50 backdrop-blur-sm",
                        !formData.moveInDate && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.moveInDate ? (
                        format(new Date(formData.moveInDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="z-50 w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-lg"
                    align="start"
                    sideOffset={8}
                  >
                    <Calendar
                      mode="single"
                      selected={
                        formData.moveInDate
                          ? new Date(formData.moveInDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setFormData((prev) => ({
                            ...prev,
                            moveInDate: date.toISOString().split("T")[0],
                          }));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label 
                  htmlFor="desiredLeaseTerm"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Desired Lease Term (months)
                </Label>
                <Select
                  value={formData.desiredLeaseTerm}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      desiredLeaseTerm: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select lease term" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} month{month !== 1 ? "s" : ""}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="isCitizen"
                checked={formData.isCitizen}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isCitizen: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
              <Label 
                htmlFor="isCitizen"
                className="block text-sm font-semibold text-gray-700"
              >
                Are you a U.S. citizen? {formData.isCitizen ? "Yes" : "No"}
              </Label>
            </div>
            {!formData.isCitizen && (
              <div className="text-sm text-blue-800 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                Additional documentation will be required for non-citizens.
              </div>
            )}
          </div>
        );

      case 1: // Financial Info
        return (
          <div className="space-y-6">
           
            <div>
              <Label
                htmlFor="employment"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Employment Status *
              </Label>
              <Select
                value={formData.employment}
                onValueChange={(value) => {
                  setFormData({ ...formData, employment: value });
                  handleFieldChange('employment', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                        <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('employment') && (
                <p className="text-red-500 text-sm mt-1">{getFieldError('employment')}</p>
              )}
            </div>

            {formData.employment !== "unemployed" && (
              <>
                <div>
                  <Label
                    htmlFor="employerName"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Primary Employer Name *
                  </Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => {
                      setFormData({ ...formData, employerName: e.target.value });
                      handleFieldChange('employerName', e.target.value);
                    }}
                    placeholder="Enter employer name"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('employerName')}`}
                  />
                  {getFieldError('employerName') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('employerName')}</p>
                  )}
                </div>

                {formData.employerName && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="primary-industry"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Industry *
                      </Label>
                      <Select
                        value={formData.employers[0]?.industry || ""}
                        onValueChange={(value) => {
                          const updated = [...formData.employers];
                          updated[0] = { ...updated[0], industry: value };
                          setFormData({ ...formData, employers: updated });
                          handleFieldChange('industry', value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                          {industryOptions.map((industry) => (
                            <SelectItem
                              key={industry}
                              value={industry.toLowerCase()}
                            >
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getFieldError('industry') && (
                        <p className="text-red-500 text-sm mt-1">{getFieldError('industry')}</p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="primary-position"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Position *
                      </Label>
                      <Select
                        value={formData.employers[0]?.position || ""}
                        onValueChange={(value) => {
                          const updated = [...formData.employers];
                          updated[0] = { ...updated[0], position: value };
                          setFormData({ ...formData, employers: updated });
                          handleFieldChange('position', value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                          {positionOptions.map((position) => (
                            <SelectItem
                              key={position}
                              value={position.toLowerCase()}
                            >
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getFieldError('position') && (
                        <p className="text-red-500 text-sm mt-1">{getFieldError('position')}</p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="primary-income"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Monthly Income *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="primary-income"
                          value={formData.employers[0]?.income || ""}
                          onChange={(e) => {
                            handleIncomeChange(e.target.value, 0);
                            handleFieldChange('monthlyIncome', e.target.value);
                          }}
                          onBlur={() => handleIncomeBlur(0)}
                          placeholder="20000"
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm pl-8 ${getFieldErrorStyle('monthlyIncome')}`}
                        />
                        {getFieldError('monthlyIncome') && (
                          <p className="text-red-500 text-sm mt-1">{getFieldError('monthlyIncome')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {formData.employment !== "unemployed" && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Additional Employers</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        employers: [
                          ...formData.employers,
                          {
                            name: "",
                            industry: "",
                            position: "",
                            income: "",
                            employmentStatus: "full-time",
                          },
                        ],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employer
                  </Button>
                </div>

                {formData.employers.slice(1).map((employer, index) => (
                  <Card key={index + 1} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Employer {index + 2}</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive"
                        onClick={() => {
                          const updated = formData.employers.filter(
                            (_, i) => i !== index + 1
                          );
                          setFormData({ ...formData, employers: updated });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Employer
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label
                          htmlFor={`employer-name-${index + 1}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Company Name *
                        </Label>
                        <Input
                          id={`employer-name-${index + 1}`}
                          value={employer.name}
                          onChange={(e) => {
                            const updated = [...formData.employers];
                            updated[index + 1] = {
                              ...updated[index + 1],
                              name: e.target.value,
                            };
                            setFormData({ ...formData, employers: updated });
                          }}
                          placeholder="Company name"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`employer-status-${index + 1}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Employment Status *
                        </Label>
                        <Select
                          value={employer.employmentStatus}
                          onValueChange={(value) => {
                            const updated = [...formData.employers];
                            updated[index + 1] = {
                              ...updated[index + 1],
                              employmentStatus: value,
                            };
                            setFormData({ ...formData, employers: updated });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="self-employed">
                              Self-employed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label
                          htmlFor={`employer-industry-${index + 1}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Industry *
                        </Label>
                        <Select
                          value={employer.industry}
                          onValueChange={(value) => {
                            const updated = [...formData.employers];
                            updated[index + 1] = {
                              ...updated[index + 1],
                              industry: value,
                            };
                            setFormData({ ...formData, employers: updated });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                            {industryOptions.map((industry) => (
                              <SelectItem
                                key={industry}
                                value={industry.toLowerCase()}
                              >
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor={`employer-position-${index + 1}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Position *
                        </Label>
                        <Select
                          value={employer.position}
                          onValueChange={(value) => {
                            const updated = [...formData.employers];
                            updated[index + 1] = {
                              ...updated[index + 1],
                              position: value,
                            };
                            setFormData({ ...formData, employers: updated });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                            {positionOptions.map((position) => (
                              <SelectItem
                                key={position}
                                value={position.toLowerCase()}
                              >
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor={`employer-income-${index + 1}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Monthly Income *
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id={`employer-income-${index + 1}`}
                            value={employer.income}
                            onChange={(e) =>
                              handleIncomeChange(e.target.value, index + 1)
                            }
                            onBlur={() => handleIncomeBlur(index + 1)}
                            placeholder="20000"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm pl-8"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasOtherIncome"
                  checked={formData.hasOtherIncome}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hasOtherIncome: checked })
                  }
                />
                <Label htmlFor="hasOtherIncome">
                  Do you have any other sources of income?{" "}
                  {formData.hasOtherIncome ? "Yes" : "No"}
                </Label>
              </div>
              {formData.hasOtherIncome && (
                <div className="ml-6 space-y-2">
                  <Label
                    htmlFor="otherIncomeDetails"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Please provide details
                  </Label>
                  <Textarea
                    id="otherIncomeDetails"
                    value={formData.otherIncomeDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otherIncomeDetails: e.target.value,
                      })
                    }
                    placeholder="Describe your other income sources (e.g., investments, part-time work, etc.)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: Documentation may be required to verify other sources
                    of income.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Housing History
        return (
          <div
            className="space-y-6 max-h-[60vh] overflow-y-auto"
          >
           
            {/* Current Address */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-lg">Current Address</h4>
              </div>
              <div>
                <Label
                  htmlFor="currentStreet"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  Current Street Address *
                </Label>
                <Input
                  id="currentStreet"
                  value={formData.currentStreet}
                  onChange={(e) => {
                    setFormData({ ...formData, currentStreet: e.target.value });
                    handleFieldChange('currentStreet', e.target.value);
                  }}
                  placeholder="123 Main Street, Apt 4B"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('currentStreet')}`}
                />
                {getFieldError('currentStreet') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('currentStreet')}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="currentCity"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    City
                  </Label>
                  <Input
                    id="currentCity"
                    value={formData.currentCity}
                    onChange={(e) => {
                      setFormData({ ...formData, currentCity: e.target.value });
                      handleFieldChange('currentCity', e.target.value);
                    }}
                    placeholder="City"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('currentCity')}`}
                  />
                  {getFieldError('currentCity') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('currentCity')}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="currentState"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    State
                  </Label>
                  <Input
                    id="currentState"
                    value={formData.currentState}
                    onChange={(e) => {
                      setFormData({ ...formData, currentState: e.target.value });
                      handleFieldChange('currentState', e.target.value);
                    }}
                    placeholder="State"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('currentState')}`}
                  />
                  {getFieldError('currentState') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('currentState')}</p>
                  )}
                </div>
              </div>
              <div>
                <Label
                  htmlFor="currentZip"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  ZIP Code *
                </Label>
                <Input
                  id="currentZip"
                  value={formData.currentZip}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setFormData({ ...formData, currentZip: value });
                    handleFieldChange('currentZip', value);
                  }}
                  placeholder="12345"
                  maxLength={5}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${getFieldErrorStyle('currentZip')}`}
                />
                {getFieldError('currentZip') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('currentZip')}</p>
                )}
              </div>
              <div className="w-64">
                <Label
                  htmlFor="currentDuration"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  How long have you lived at this address? *
                </Label>
                <Select
                  value={formData.currentDuration}
                  onValueChange={(value) => {
                    setFormData({ ...formData, currentDuration: value });
                    handleFieldChange('currentDuration', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                    <SelectItem value="0-2">Less than 2 years</SelectItem>
                    <SelectItem value="2+">More than 2 years</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError('currentDuration') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('currentDuration')}</p>
                )}
              </div>
            </div>

            {/* Previous Address (if lived at current address < 2 years) */}
            {formData.currentDuration === "0-2" && (
              <div className="space-y-4 border-t pt-4">
                <div className="border-b pb-2">
                  <h5 className="font-medium text-base">Previous Address</h5>
                </div>
                <div>
                  <Label
                    htmlFor="previousStreet"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Street Address
                  </Label>
                  <Input
                    id="previousStreet"
                    value={formData.previousStreet}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousStreet: e.target.value,
                      })
                    }
                    placeholder="Previous street address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="previousCity"
                      className="text-sm font-semibold text-gray-700 mb-2 block"
                    >
                      City
                    </Label>
                    <Input
                      id="previousCity"
                      value={formData.previousCity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          previousCity: e.target.value,
                        })
                      }
                      placeholder="City"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="previousState"
                      className="text-sm font-semibold text-gray-700 mb-2 block"
                    >
                      State
                    </Label>
                    <Input
                      id="previousState"
                      value={formData.previousState}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          previousState: e.target.value,
                        })
                      }
                      placeholder="State"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="previousZip"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    ZIP Code *
                  </Label>
                  <Input
                    id="previousZip"
                    value={formData.previousZip}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 5);
                      setFormData({ ...formData, previousZip: value });
                    }}
                    placeholder="12345"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Lease Holders & Guarantors (only for full application)
        return (
          <div className="space-y-6">
          
            {/* Lease Holders */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-bold text-xl">Lease Holders</h3>
              </div>
              {/* Primary Lease Holder Reference */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <h5 className="font-medium text-sm text-muted-foreground">
                  Primary Lease Holder
                </h5>
                <p className="font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
              </div>

              <h4 className="font-medium">Additional Lease Holders</h4>
              <p className="text-sm text-muted-foreground">
                Add other people who will be jointly responsible for the lease
                (roommates, partners, etc.).
              </p>

              {formData.leaseHolders.map((holder: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label
                          htmlFor={`holder-firstName-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          First Name *
                        </Label>
                        <Input
                          id={`holder-firstName-${index}`}
                          value={holder.firstName || ""}
                          onChange={(e) => {
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              firstName: e.target.value,
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                          placeholder="First name"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`holder-middleInitial-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          M.I.
                        </Label>
                        <Input
                          id={`holder-middleInitial-${index}`}
                          value={holder.middleInitial || ""}
                          onChange={(e) => {
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              middleInitial: e.target.value,
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                          placeholder="M"
                          maxLength={1}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`holder-lastName-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Last Name *
                        </Label>
                        <Input
                          id={`holder-lastName-${index}`}
                          value={holder.lastName || ""}
                          onChange={(e) => {
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              lastName: e.target.value,
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                          placeholder="Last name"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor={`holder-dob-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Date of Birth *
                        </Label>
                        <Input
                          id={`holder-dob-${index}`}
                          type="text"
                          value={holder.dateOfBirth || ""}
                          onChange={(e) =>
                            handleHolderDOBChange(e.target.value, index)
                          }
                          onBlur={(e) =>
                            handleHolderDOBBlur(e.target.value, index)
                          }
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                          required
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm ${
                            holderDobErrors[index] ? "border-destructive" : ""
                          }`}
                        />
                        {holderDobErrors[index] && (
                          <p className="text-sm text-destructive mt-1">
                            {holderDobErrors[index]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`holder-ssn-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          SSN/TIN/EIN *
                        </Label>
                        <Input
                          id={`holder-ssn-${index}`}
                          value={
                            holderSSNStates[index]?.focused
                              ? formatSSN(holderSSNStates[index]?.raw || "")
                              : holderSSNStates[index]?.raw
                              ? maskSSNDisplay(holderSSNStates[index]?.raw)
                              : ""
                          }
                          onFocus={() =>
                            setHolderSSNStates((prev) => ({
                              ...prev,
                              [index]: { ...prev[index], focused: true },
                            }))
                          }
                          onBlur={() =>
                            setHolderSSNStates((prev) => ({
                              ...prev,
                              [index]: { ...prev[index], focused: false },
                            }))
                          }
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, "");
                            setHolderSSNStates((prev) => ({
                              ...prev,
                              [index]: {
                                raw: numbers,
                                focused: prev[index]?.focused || false,
                              },
                            }));
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              ssn: formatSSN(numbers),
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                          placeholder="XXX-XX-XXXX"
                          maxLength={11}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor={`holder-email-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Email *
                        </Label>
                        <Input
                          id={`holder-email-${index}`}
                          type="email"
                          value={holder.email || ""}
                          onChange={(e) => {
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              email: e.target.value,
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                          placeholder="Email address"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`holder-phone-${index}`}
                          className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                          Phone *
                        </Label>
                        <Input
                          id={`holder-phone-${index}`}
                          value={holder.phone || ""}
                          onChange={(e) => {
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              phone: e.target.value,
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                          placeholder="Phone number"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring- bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4 border-t pt-4">
                      <h5 className="font-medium text-base">Current Address</h5>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id={`holder-sameAsPrimary-${index}`}
                          checked={holder.sameAsPrimary || false}
                          onCheckedChange={(checked) => {
                            const updated = [...formData.leaseHolders];
                            if (checked) {
                              updated[index] = {
                                ...updated[index],
                                sameAsPrimary: true,
                                currentStreet: formData.currentStreet,
                                currentCity: formData.currentCity,
                                currentState: formData.currentState,
                                currentZip: formData.currentZip,
                                currentDuration: formData.currentDuration,
                              };
                            } else {
                              updated[index] = {
                                ...updated[index],
                                sameAsPrimary: false,
                                currentStreet: "",
                                currentCity: "",
                                currentState: "",
                                currentZip: "",
                                currentDuration: "",
                              };
                            }
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                        />
                        <Label
                          htmlFor={`holder-sameAsPrimary-${index}`}
                          className="text-sm"
                        >
                          Same as primary applicant address
                        </Label>
                      </div>
                      {!holder.sameAsPrimary && (
                        <>
                          <div>
                            <Label htmlFor={`holder-currentStreet-${index}`}>
                              Street Address *
                            </Label>
                            <Input
                              id={`holder-currentStreet-${index}`}
                              value={holder.currentStreet || ""}
                              onChange={(e) => {
                                const updated = [...formData.leaseHolders];
                                updated[index] = {
                                  ...updated[index],
                                  currentStreet: e.target.value,
                                };
                                setFormData({
                                  ...formData,
                                  leaseHolders: updated,
                                });
                              }}
                              placeholder="123 Main Street"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`holder-currentCity-${index}`}>
                                City *
                              </Label>
                              <Input
                                id={`holder-currentCity-${index}`}
                                value={holder.currentCity || ""}
                                onChange={(e) => {
                                  const updated = [...formData.leaseHolders];
                                  updated[index] = {
                                    ...updated[index],
                                    currentCity: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    leaseHolders: updated,
                                  });
                                }}
                                placeholder="City"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`holder-currentState-${index}`}>
                                State *
                              </Label>
                              <Input
                                id={`holder-currentState-${index}`}
                                value={holder.currentState || ""}
                                onChange={(e) => {
                                  const updated = [...formData.leaseHolders];
                                  updated[index] = {
                                    ...updated[index],
                                    currentState: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    leaseHolders: updated,
                                  });
                                }}
                                placeholder="State"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`holder-currentZip-${index}`}>
                                ZIP Code *
                              </Label>
                              <Input
                                id={`holder-currentZip-${index}`}
                                value={holder.currentZip || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  const updated = [...formData.leaseHolders];
                                  updated[index] = {
                                    ...updated[index],
                                    currentZip: value,
                                  };
                                  setFormData({
                                    ...formData,
                                    leaseHolders: updated,
                                  });
                                }}
                                placeholder="12345"
                                maxLength={5}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`holder-currentDuration-${index}`}>
                              How long have you lived here? *
                            </Label>
                            <Select
                              value={holder.currentDuration || ""}
                              onValueChange={(value) => {
                                const updated = [...formData.leaseHolders];
                                updated[index] = {
                                  ...updated[index],
                                  currentDuration: value,
                                };
                                setFormData({
                                  ...formData,
                                  leaseHolders: updated,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                                <SelectItem value="0-2">
                                  Less than 2 years
                                </SelectItem>
                                <SelectItem value="2+">
                                  More than 2 years
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Employment Section */}
                    <div className="space-y-4 border-t pt-4">
                      <h5 className="font-medium text-base">
                        Employment Information
                      </h5>
                      <div>
                        <Label htmlFor={`holder-employment-status-${index}`}>
                          Employment Status
                        </Label>
                        <Select
                          value={holder.employmentStatus || ""}
                          onValueChange={(value) => {
                            const updated = [...formData.leaseHolders];
                            updated[index] = {
                              ...updated[index],
                              employmentStatus: value,
                            };
                            setFormData({ ...formData, leaseHolders: updated });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="self-employed">
                              Self-employed
                            </SelectItem>
                            <SelectItem value="unemployed">
                              Unemployed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {holder.employmentStatus !== "unemployed" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`holder-employer-${index}`}>
                            Employer Name *
                          </Label>
                          <Input
                            id={`holder-employer-${index}`}
                            value={holder.employerName || ""}
                            onChange={(e) => {
                              const updated = [...formData.leaseHolders];
                              updated[index] = {
                                ...updated[index],
                                employerName: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                leaseHolders: updated,
                              });
                            }}
                            placeholder="Employer name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`holder-industry-${index}`}>
                            Industry *
                          </Label>
                          <Select
                            value={holder.industry || ""}
                            onValueChange={(value) => {
                              const updated = [...formData.leaseHolders];
                              updated[index] = {
                                ...updated[index],
                                industry: value,
                              };
                              setFormData({
                                ...formData,
                                leaseHolders: updated,
                              });
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                              {industryOptions.map((industry) => (
                                <SelectItem
                                  key={industry}
                                  value={industry.toLowerCase()}
                                >
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    {holder.employmentStatus !== "unemployed" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`holder-position-${index}`}>
                            Position *
                          </Label>
                          <Select
                            value={holder.position || ""}
                            onValueChange={(value) => {
                              const updated = [...formData.leaseHolders];
                              updated[index] = {
                                ...updated[index],
                                position: value,
                              };
                              setFormData({
                                ...formData,
                                leaseHolders: updated,
                              });
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                              {positionOptions.map((position) => (
                                <SelectItem
                                  key={position}
                                  value={position.toLowerCase()}
                                >
                                  {position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`holder-income-${index}`}>
                            Monthly Income *
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id={`holder-income-${index}`}
                              value={holder.monthlyIncome || ""}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                const updated = [...formData.leaseHolders];
                                updated[index] = {
                                  ...updated[index],
                                  monthlyIncome: value,
                                };
                                setFormData({
                                  ...formData,
                                  leaseHolders: updated,
                                });
                              }}
                              placeholder="5,000"
                              className="pl-8"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <Switch
                        id={`holder-isCitizen-${index}`}
                        checked={holder.isCitizen ?? true}
                        onCheckedChange={(checked) => {
                          const updated = [...formData.leaseHolders];
                          updated[index] = {
                            ...updated[index],
                            isCitizen: checked,
                          };
                          setFormData({ ...formData, leaseHolders: updated });
                        }}
                      />
                      <Label htmlFor={`holder-isCitizen-${index}`}>
                        Are you a U.S. citizen?{" "}
                        {holder.isCitizen ?? true ? "Yes" : "No"}
                      </Label>
                    </div>
                    {!(holder.isCitizen ?? true) && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        Additional documentation will be required for
                        non-citizens.
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive"
                    onClick={() => {
                      const updated = formData.leaseHolders.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, leaseHolders: updated });
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Lease Holder
                  </Button>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    ...formData,
                    leaseHolders: [
                      ...formData.leaseHolders,
                      {
                        firstName: "",
                        middleInitial: "",
                        lastName: "",
                        dateOfBirth: "",
                        ssn: "",
                        monthlyIncome: "",
                        employerName: "",
                        employmentStatus: "full-time",
                        industry: "",
                        position: "",
                        email: "",
                        phone: "",
                        isCitizen: true,
                        sameAsPrimary: false,
                        currentStreet: "",
                        currentCity: "",
                        currentState: "",
                        currentZip: "",
                        currentDuration: "",
                      },
                    ],
                  });
                }}
              >
                Add Lease Holder
              </Button>
            </div>

            {/* Guarantors */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium">Guarantors</h4>
              <p className="text-sm text-muted-foreground">
                Add guarantors if required (parents, family members, or
                co-signers).
              </p>

              {formData.guarantors.map((guarantor: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`guarantor-firstName-${index}`}>
                          First Name *
                        </Label>
                        <Input
                          id={`guarantor-firstName-${index}`}
                          value={guarantor.firstName || ""}
                          onChange={(e) => {
                            const updated = [...formData.guarantors];
                            updated[index] = {
                              ...updated[index],
                              firstName: capitalizeName(e.target.value),
                            };
                            setFormData({ ...formData, guarantors: updated });
                          }}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guarantor-middleInitial-${index}`}>
                          M.I.
                        </Label>
                        <Input
                          id={`guarantor-middleInitial-${index}`}
                          value={guarantor.middleInitial || ""}
                          onChange={(e) => {
                            const updated = [...formData.guarantors];
                            updated[index] = {
                              ...updated[index],
                              middleInitial: e.target.value,
                            };
                            setFormData({ ...formData, guarantors: updated });
                          }}
                          placeholder="M"
                          maxLength={1}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guarantor-lastName-${index}`}>
                          Last Name *
                        </Label>
                        <Input
                          id={`guarantor-lastName-${index}`}
                          value={guarantor.lastName || ""}
                          onChange={(e) => {
                            const updated = [...formData.guarantors];
                            updated[index] = {
                              ...updated[index],
                              lastName: capitalizeName(e.target.value),
                            };
                            setFormData({ ...formData, guarantors: updated });
                          }}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`guarantor-dob-${index}`}>
                          Date of Birth *
                        </Label>
                        <Input
                          id={`guarantor-dob-${index}`}
                          type="text"
                          value={guarantor.dateOfBirth || ""}
                          onChange={(e) =>
                            handleGuarantorDOBChange(e.target.value, index)
                          }
                          onBlur={(e) =>
                            handleGuarantorDOBBlur(e.target.value, index)
                          }
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                          required
                          className={
                            guarantorDobErrors[index]
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {guarantorDobErrors[index] && (
                          <p className="text-sm text-destructive mt-1">
                            {guarantorDobErrors[index]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`guarantor-ssn-${index}`}>
                          SSN/TIN/EIN *
                        </Label>
                        <Input
                          id={`guarantor-ssn-${index}`}
                          value={
                            guarantorSSNStates[index]?.focused
                              ? formatSSN(guarantorSSNStates[index]?.raw || "")
                              : guarantorSSNStates[index]?.raw
                              ? maskSSNDisplay(guarantorSSNStates[index]?.raw)
                              : ""
                          }
                          onFocus={() =>
                            setGuarantorSSNStates((prev) => ({
                              ...prev,
                              [index]: { ...prev[index], focused: true },
                            }))
                          }
                          onBlur={() =>
                            setGuarantorSSNStates((prev) => ({
                              ...prev,
                              [index]: { ...prev[index], focused: false },
                            }))
                          }
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, "");
                            setGuarantorSSNStates((prev) => ({
                              ...prev,
                              [index]: {
                                raw: numbers,
                                focused: prev[index]?.focused || false,
                              },
                            }));
                            const updated = [...formData.guarantors];
                            updated[index] = {
                              ...updated[index],
                              ssn: formatSSN(numbers),
                            };
                            setFormData({ ...formData, guarantors: updated });
                          }}
                          placeholder="XXX-XX-XXXX"
                          maxLength={11}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`guarantor-email-${index}`}>
                          Email *
                        </Label>
                        <Input
                          id={`guarantor-email-${index}`}
                          type="email"
                          value={guarantor.email || ""}
                          onChange={(e) => {
                            const updated = [...formData.guarantors];
                            updated[index] = {
                              ...updated[index],
                              email: e.target.value,
                            };
                            setFormData({ ...formData, guarantors: updated });
                          }}
                          placeholder="Email address"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guarantor-phone-${index}`}>
                          Phone *
                        </Label>
                        <Input
                          id={`guarantor-phone-${index}`}
                          value={guarantor.phone || ""}
                          onChange={(e) => {
                            const updated = [...formData.guarantors];
                            updated[index] = {
                              ...updated[index],
                              phone: e.target.value,
                            };
                            setFormData({ ...formData, guarantors: updated });
                          }}
                          placeholder="Phone number"
                          required
                        />
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4 border-t pt-4">
                      <h5 className="font-medium text-base">Current Address</h5>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id={`guarantor-sameAsPrimary-${index}`}
                          checked={guarantor.sameAsPrimary || false}
                          onCheckedChange={(checked) => {
                            const updated = [...formData.guarantors];
                            if (checked) {
                              updated[index] = {
                                ...updated[index],
                                sameAsPrimary: true,
                                currentStreet: formData.currentStreet,
                                currentCity: formData.currentCity,
                                currentState: formData.currentState,
                                currentZip: formData.currentZip,
                                currentDuration: formData.currentDuration,
                              };
                            } else {
                              updated[index] = {
                                ...updated[index],
                                sameAsPrimary: false,
                                currentStreet: "",
                                currentCity: "",
                                currentState: "",
                                currentZip: "",
                                currentDuration: "",
                              };
                            }
                            setFormData({ ...formData, guarantors: updated });
                          }}
                        />
                        <Label
                          htmlFor={`guarantor-sameAsPrimary-${index}`}
                          className="text-sm"
                        >
                          Same as primary applicant address
                        </Label>
                      </div>
                      {!guarantor.sameAsPrimary && (
                        <>
                          <div>
                            <Label htmlFor={`guarantor-currentStreet-${index}`}>
                              Street Address *
                            </Label>
                            <Input
                              id={`guarantor-currentStreet-${index}`}
                              value={guarantor.currentStreet || ""}
                              onChange={(e) => {
                                const updated = [...formData.guarantors];
                                updated[index] = {
                                  ...updated[index],
                                  currentStreet: e.target.value,
                                };
                                setFormData({
                                  ...formData,
                                  guarantors: updated,
                                });
                              }}
                              placeholder="123 Main Street"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`guarantor-currentCity-${index}`}>
                                City *
                              </Label>
                              <Input
                                id={`guarantor-currentCity-${index}`}
                                value={guarantor.currentCity || ""}
                                onChange={(e) => {
                                  const updated = [...formData.guarantors];
                                  updated[index] = {
                                    ...updated[index],
                                    currentCity: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    guarantors: updated,
                                  });
                                }}
                                placeholder="City"
                                required
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`guarantor-currentState-${index}`}
                              >
                                State *
                              </Label>
                              <Input
                                id={`guarantor-currentState-${index}`}
                                value={guarantor.currentState || ""}
                                onChange={(e) => {
                                  const updated = [...formData.guarantors];
                                  updated[index] = {
                                    ...updated[index],
                                    currentState: capitalizeState(
                                      e.target.value
                                    ),
                                  };
                                  setFormData({
                                    ...formData,
                                    guarantors: updated,
                                  });
                                }}
                                placeholder="State"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`guarantor-currentZip-${index}`}>
                                ZIP Code *
                              </Label>
                              <Input
                                id={`guarantor-currentZip-${index}`}
                                value={guarantor.currentZip || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    ""
                                  );
                                  const updated = [...formData.guarantors];
                                  updated[index] = {
                                    ...updated[index],
                                    currentZip: value,
                                  };
                                  setFormData({
                                    ...formData,
                                    guarantors: updated,
                                  });
                                }}
                                placeholder="12345"
                                maxLength={5}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor={`guarantor-currentDuration-${index}`}
                            >
                              How long have you lived here? *
                            </Label>
                            <Select
                              value={guarantor.currentDuration || ""}
                              onValueChange={(value) => {
                                const updated = [...formData.guarantors];
                                updated[index] = {
                                  ...updated[index],
                                  currentDuration: value,
                                };
                                setFormData({
                                  ...formData,
                                  guarantors: updated,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                                <SelectItem value="0-2">
                                  Less than 2 years
                                </SelectItem>
                                <SelectItem value="2+">
                                  More than 2 years
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`guarantor-isCitizen-${index}`}
                        checked={guarantor.isCitizen ?? true}
                        onCheckedChange={(checked) => {
                          const updated = [...formData.guarantors];
                          updated[index] = {
                            ...updated[index],
                            isCitizen: checked,
                          };
                          setFormData({ ...formData, guarantors: updated });
                        }}
                      />
                      <Label htmlFor={`guarantor-isCitizen-${index}`}>
                        Are you a U.S. citizen?{" "}
                        {guarantor.isCitizen ?? true ? "Yes" : "No"}
                      </Label>
                    </div>
                    {!(guarantor.isCitizen ?? true) && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        Additional documentation will be required for
                        non-citizens.
                      </div>
                    )}
                    <div>
                      <Label htmlFor={`guarantor-employment-status-${index}`}>
                        Employment Status
                      </Label>
                      <Select
                        value={guarantor.employmentStatus || ""}
                        onValueChange={(value) => {
                          const updated = [...formData.guarantors];
                          updated[index] = {
                            ...updated[index],
                            employmentStatus: value,
                          };
                          setFormData({ ...formData, guarantors: updated });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="self-employed">
                            Self-employed
                          </SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {guarantor.employmentStatus !== "unemployed" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`guarantor-employer-${index}`}>
                            Employer Name *
                          </Label>
                          <Input
                            id={`guarantor-employer-${index}`}
                            value={guarantor.employerName || ""}
                            onChange={(e) => {
                              const updated = [...formData.guarantors];
                              updated[index] = {
                                ...updated[index],
                                employerName: capitalizeName(e.target.value),
                              };
                              setFormData({ ...formData, guarantors: updated });
                            }}
                            placeholder="Employer name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`guarantor-industry-${index}`}>
                            Industry *
                          </Label>
                          <Select
                            value={guarantor.industry || ""}
                            onValueChange={(value) => {
                              const updated = [...formData.guarantors];
                              updated[index] = {
                                ...updated[index],
                                industry: value,
                              };
                              setFormData({ ...formData, guarantors: updated });
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                              {industryOptions.map((industry) => (
                                <SelectItem
                                  key={industry}
                                  value={industry.toLowerCase()}
                                >
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    {guarantor.employmentStatus !== "unemployed" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`guarantor-position-${index}`}>
                            Position *
                          </Label>
                          <Select
                            value={guarantor.position || ""}
                            onValueChange={(value) => {
                              const updated = [...formData.guarantors];
                              updated[index] = {
                                ...updated[index],
                                position: value,
                              };
                              setFormData({ ...formData, guarantors: updated });
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                              {positionOptions.map((position) => (
                                <SelectItem
                                  key={position}
                                  value={position.toLowerCase()}
                                >
                                  {position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`guarantor-income-${index}`}>
                            Monthly Income *
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id={`guarantor-income-${index}`}
                              value={guarantor.monthlyIncome || ""}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                const updated = [...formData.guarantors];
                                updated[index] = {
                                  ...updated[index],
                                  monthlyIncome: value,
                                };
                                setFormData({
                                  ...formData,
                                  guarantors: updated,
                                });
                              }}
                              placeholder="5,000"
                              className="pl-8"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive"
                    onClick={() => {
                      const updated = formData.guarantors.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, guarantors: updated });
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Guarantor
                  </Button>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    ...formData,
                    guarantors: [
                      ...formData.guarantors,
                      {
                        firstName: "",
                        middleInitial: "",
                        lastName: "",
                        dateOfBirth: "",
                        ssn: "",
                        monthlyIncome: "",
                        employmentStatus: "full-time",
                        employerName: "",
                        industry: "",
                        position: "",
                        email: "",
                        phone: "",
                        isCitizen: true,
                        sameAsPrimary: false,
                        currentStreet: "",
                        currentCity: "",
                        currentState: "",
                        currentZip: "",
                        currentDuration: "",
                      },
                    ],
                  });
                }}
              >
                Add Guarantor
              </Button>
            </div>
          </div>
        );

      case 4: // Additional Occupants (only for full application)
        return (
          <div className="min-h-[600px] space-y-6">
           

            <div className="space-y-6">
              <div className="bg-secondary/5 p-4 rounded-lg border-l-4 border-secondary">
                <h4 className="font-semibold text-lg">Additional Occupants</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  List anyone else who will be living in the apartment with you.
                </p>
              </div>

              {formData.additionalOccupants.map(
                (occupant: any, index: number) => (
                  <Card key={index} className="p-6 border-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`occupant-firstName-${index}`}>
                            First Name *
                          </Label>
                          <Input
                            id={`occupant-firstName-${index}`}
                            value={occupant.firstName || ""}
                            onChange={(e) => {
                              const updated = [...formData.additionalOccupants];
                              updated[index] = {
                                ...updated[index],
                                firstName: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                additionalOccupants: updated,
                              });
                            }}
                            placeholder="First name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`occupant-middleInitial-${index}`}>
                            M.I.
                          </Label>
                          <Input
                            id={`occupant-middleInitial-${index}`}
                            value={occupant.middleInitial || ""}
                            onChange={(e) => {
                              const updated = [...formData.additionalOccupants];
                              updated[index] = {
                                ...updated[index],
                                middleInitial: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                additionalOccupants: updated,
                              });
                            }}
                            placeholder="M"
                            maxLength={1}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`occupant-lastName-${index}`}>
                            Last Name *
                          </Label>
                          <Input
                            id={`occupant-lastName-${index}`}
                            value={occupant.lastName || ""}
                            onChange={(e) => {
                              const updated = [...formData.additionalOccupants];
                              updated[index] = {
                                ...updated[index],
                                lastName: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                additionalOccupants: updated,
                              });
                            }}
                            placeholder="Last name"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`occupant-age-${index}`}>Age *</Label>
                          <Input
                            id={`occupant-age-${index}`}
                            value={occupant.age || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              const updated = [...formData.additionalOccupants];
                              const occupantUpdate = {
                                ...updated[index],
                                age: value,
                              };

                              // If age changes from 18+ to under 18, remove DOB and SSN
                              if (parseInt(value) < 18) {
                                delete occupantUpdate.dateOfBirth;
                                delete occupantUpdate.ssn;
                              }

                              updated[index] = occupantUpdate;
                              setFormData({
                                ...formData,
                                additionalOccupants: updated,
                              });
                            }}
                            placeholder="Age"
                            required
                          />
                        </div>
                        {occupant.age && parseInt(occupant.age) >= 18 && (
                          <div>
                            <Label htmlFor={`occupant-dob-${index}`}>
                              Date of Birth *
                            </Label>
                            <Input
                              id={`occupant-dob-${index}`}
                              type="text"
                              value={occupant.dateOfBirth || ""}
                              onChange={(e) => {
                                const maskedValue = formatDateInput(
                                  e.target.value
                                );
                                const updated = [
                                  ...formData.additionalOccupants,
                                ];
                                updated[index] = {
                                  ...updated[index],
                                  dateOfBirth: maskedValue,
                                };
                                setFormData({
                                  ...formData,
                                  additionalOccupants: updated,
                                });
                              }}
                              placeholder="MM/DD/YYYY"
                              maxLength={10}
                              required
                            />
                          </div>
                        )}
                      </div>
                      {occupant.age && parseInt(occupant.age) >= 18 && (
                        <div className="border-t pt-4">
                          <h6 className="font-medium mb-3">
                            18+ Occupant Requirements
                          </h6>
                          <div>
                            <Label htmlFor={`occupant-ssn-${index}`}>
                              SSN/TIN/EIN *
                            </Label>
                            <Input
                              id={`occupant-ssn-${index}`}
                              value={
                                occupantSSNStates[index]?.focused
                                  ? formatSSN(
                                      occupantSSNStates[index]?.raw || ""
                                    )
                                  : occupantSSNStates[index]?.raw
                                  ? maskSSNDisplay(
                                      occupantSSNStates[index]?.raw
                                    )
                                  : ""
                              }
                              onFocus={() =>
                                setOccupantSSNStates((prev) => ({
                                  ...prev,
                                  [index]: { ...prev[index], focused: true },
                                }))
                              }
                              onBlur={() =>
                                setOccupantSSNStates((prev) => ({
                                  ...prev,
                                  [index]: { ...prev[index], focused: false },
                                }))
                              }
                              onChange={(e) => {
                                const numbers = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                setOccupantSSNStates((prev) => ({
                                  ...prev,
                                  [index]: {
                                    raw: numbers,
                                    focused: prev[index]?.focused || false,
                                  },
                                }));
                                const updated = [
                                  ...formData.additionalOccupants,
                                ];
                                updated[index] = {
                                  ...updated[index],
                                  ssn: formatSSN(numbers),
                                };
                                setFormData({
                                  ...formData,
                                  additionalOccupants: updated,
                                });
                              }}
                              placeholder="XXX-XX-XXXX"
                              maxLength={11}
                              required
                            />
                          </div>
                          <div className="flex items-start gap-2 mt-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help flex-shrink-0 mt-0.5" />
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-64 text-xs"
                                side="top"
                                align="end"
                              >
                                All occupants aged 18 and older are required to
                                undergo criminal background checks as part of
                                the rental application process for security
                                purposes.
                              </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground flex-1">
                              All occupants 18+ require background checks for
                              security purposes.
                            </p>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive"
                        onClick={() => {
                          const updated = formData.additionalOccupants.filter(
                            (_, i) => i !== index
                          );
                          setFormData({
                            ...formData,
                            additionalOccupants: updated,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Occupant
                      </Button>
                    </div>
                  </Card>
                )
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    ...formData,
                    additionalOccupants: [
                      ...formData.additionalOccupants,
                      {
                        firstName: "",
                        middleInitial: "",
                        lastName: "",
                        age: "",
                        ssn: "",
                      },
                    ],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Additional Occupant
              </Button>
            </div>
          </div>
        );

      case 5: // Additional Info (only for full application)
        return (
          <div className="space-y-6">
          
            {/* Pet Information */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-lg">Pet Information</h4>
              </div>
              <div>
                <Label>Do you have any pets? *</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pets-yes"
                      name="hasPets"
                      checked={formData.hasPets === true}
                      onChange={() =>
                        setFormData({ ...formData, hasPets: true })
                      }
                      required
                    />
                    <Label htmlFor="pets-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pets-no"
                      name="hasPets"
                      checked={formData.hasPets === false}
                      onChange={() =>
                        setFormData({ ...formData, hasPets: false, pets: [] })
                      }
                      required
                    />
                    <Label htmlFor="pets-no">No</Label>
                  </div>
                </div>
              </div>

              {formData.hasPets && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Pet Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          pets: [
                            ...formData.pets,
                            {
                              type: "",
                              breed: "",
                              age: "",
                              weight: "",
                              isServiceAnimal: false,
                            },
                          ],
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Pet
                    </Button>
                  </div>

                  {formData.pets.map((pet, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Pet {index + 1}</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`pet-type-${index}`}>
                            Pet Type *
                          </Label>
                          <Select
                            value={pet.type}
                            onValueChange={(value) => {
                              const updated = [...formData.pets];
                              updated[index] = {
                                ...updated[index],
                                type: value,
                              };
                              setFormData({ ...formData, pets: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select pet type" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                              <SelectItem value="dog">Dog</SelectItem>
                              <SelectItem value="cat">Cat</SelectItem>
                              <SelectItem value="bird">Bird</SelectItem>
                              <SelectItem value="fish">Fish</SelectItem>
                              <SelectItem value="rabbit">Rabbit</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`pet-breed-${index}`}>Breed</Label>
                          <Input
                            id={`pet-breed-${index}`}
                            value={pet.breed}
                            onChange={(e) => {
                              const updated = [...formData.pets];
                              updated[index] = {
                                ...updated[index],
                                breed: e.target.value,
                              };
                              setFormData({ ...formData, pets: updated });
                            }}
                            placeholder="e.g., Golden Retriever"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`pet-age-${index}`}>Age</Label>
                          <Input
                            id={`pet-age-${index}`}
                            value={pet.age}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              const updated = [...formData.pets];
                              updated[index] = {
                                ...updated[index],
                                age: value,
                              };
                              console.log("🐾 Pet age changed", {
                                index,
                                value,
                              });
                              setFormData({ ...formData, pets: updated });
                            }}
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`pet-weight-${index}`}>
                            Weight Lbs
                          </Label>
                          <Input
                            id={`pet-weight-${index}`}
                            value={pet.weight}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              const updated = [...formData.pets];
                              updated[index] = {
                                ...updated[index],
                                weight: value,
                              };
                              console.log("🐾 Pet weight changed", {
                                index,
                                value,
                              });
                              setFormData({ ...formData, pets: updated });
                            }}
                            placeholder="45"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`isServiceAnimal-${index}`}
                          checked={pet.isServiceAnimal}
                          onCheckedChange={(checked) => {
                            const updated = [...formData.pets];
                            updated[index] = {
                              ...updated[index],
                              isServiceAnimal: checked,
                            };
                            setFormData({ ...formData, pets: updated });
                          }}
                        />
                        <Label htmlFor={`isServiceAnimal-${index}`}>
                          Is this a service animal?{" "}
                          {pet.isServiceAnimal ? "Yes" : "No"}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive"
                        onClick={() => {
                          const updated = formData.pets.filter(
                            (_, i) => i !== index
                          );
                          setFormData({ ...formData, pets: updated });
                        }}
                      >
                        Remove Pet
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4 border-t pt-4">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-lg">Vehicle Information</h4>
              </div>
              <div>
                <Label>Do you have any vehicles? *</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="vehicles-yes"
                      name="hasVehicles"
                      checked={formData.hasVehicles === true}
                      onChange={() =>
                        setFormData({ ...formData, hasVehicles: true })
                      }
                      required
                    />
                    <Label htmlFor="vehicles-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="vehicles-no"
                      name="hasVehicles"
                      checked={formData.hasVehicles === false}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          hasVehicles: false,
                          vehicles: [],
                        })
                      }
                      required
                    />
                    <Label htmlFor="vehicles-no">No</Label>
                  </div>
                </div>
              </div>

              {formData.hasVehicles && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Vehicle Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          vehicles: [
                            ...formData.vehicles,
                            {
                              type: "",
                              make: "",
                              model: "",
                              year: "",
                              color: "",
                              licensePlate: "",
                            },
                          ],
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </div>

                  {formData.vehicles.map((vehicle, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Vehicle {index + 1}</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`vehicle-type-${index}`}>
                            Type *
                          </Label>
                          <Select
                            value={vehicle.type}
                            onValueChange={(value) => {
                              const updated = [...formData.vehicles];
                              updated[index] = {
                                ...updated[index],
                                type: value,
                              };
                              setFormData({ ...formData, vehicles: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                              {vehicleTypes.map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type.toLowerCase()}
                                >
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`vehicle-make-${index}`}>
                            Make *
                          </Label>
                          <Input
                            id={`vehicle-make-${index}`}
                            value={vehicle.make}
                            onChange={(e) => {
                              const updated = [...formData.vehicles];
                              updated[index] = {
                                ...updated[index],
                                make: e.target.value,
                              };
                              setFormData({ ...formData, vehicles: updated });
                            }}
                            placeholder="e.g., Toyota"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`vehicle-model-${index}`}>
                            Model *
                          </Label>
                          <Input
                            id={`vehicle-model-${index}`}
                            value={vehicle.model}
                            onChange={(e) => {
                              const updated = [...formData.vehicles];
                              updated[index] = {
                                ...updated[index],
                                model: e.target.value,
                              };
                              setFormData({ ...formData, vehicles: updated });
                            }}
                            placeholder="e.g., Camry"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`vehicle-year-${index}`}>
                            Year *
                          </Label>
                          <Input
                            id={`vehicle-year-${index}`}
                            value={vehicle.year}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4);
                              const updated = [...formData.vehicles];
                              updated[index] = {
                                ...updated[index],
                                year: value,
                              };
                              setFormData({ ...formData, vehicles: updated });
                            }}
                            placeholder="2020"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`vehicle-color-${index}`}>
                            Color
                          </Label>
                          <Input
                            id={`vehicle-color-${index}`}
                            value={vehicle.color}
                            onChange={(e) => {
                              const updated = [...formData.vehicles];
                              updated[index] = {
                                ...updated[index],
                                color: e.target.value,
                              };
                              setFormData({ ...formData, vehicles: updated });
                            }}
                            placeholder="e.g., Blue"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`vehicle-license-${index}`}>
                            License Plate
                          </Label>
                          <Input
                            id={`vehicle-license-${index}`}
                            value={vehicle.licensePlate}
                            onChange={(e) => {
                              const updated = [...formData.vehicles];
                              updated[index] = {
                                ...updated[index],
                                licensePlate: e.target.value.toUpperCase(),
                              };
                              setFormData({ ...formData, vehicles: updated });
                            }}
                            placeholder="e.g., ABC123"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 text-muted-foreground border-muted-foreground/20 hover:text-destructive hover:border-destructive"
                        onClick={() => {
                          const updated = formData.vehicles.filter(
                            (_, i) => i !== index
                          );
                          setFormData({ ...formData, vehicles: updated });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Vehicle
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4 border-t pt-4">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-lg">Emergency Contact</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emergencyContactName">Name *</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactPhone">Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            phone: formatPhoneNumber(e.target.value),
                          },
                        })
                      }
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactEmail">Email</Label>
                    <Input
                      id="emergencyContactEmail"
                      type="email"
                      value={formData.emergencyContact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            email: e.target.value,
                          },
                        })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelation">Relation *</Label>
                  <Select
                    value={formData.emergencyContact.relation}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        emergencyContact: {
                          ...formData.emergencyContact,
                          relation: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 border-t pt-4">
              <div className="border-b pb-2">
                <h4 className="font-semibold text-lg">
                  Additional Information
                </h4>
              </div>
              <div>
                <Label htmlFor="additionalInfo">Additional Notes</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalInfo: e.target.value })
                  }
                  placeholder="Please provide any additional information you would like us to know about your application."
                />
              </div>
            </div>
          </div>
        );

      case 6: // Documents Upload
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
            >
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                All documents are secure and encrypted
              </span>
            </motion.div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Required Documents</h3>
                <p className="text-gray-600">Please upload your driver's license or ID to complete your application</p>
              </div>

              {/* ID Documents */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Government ID
                </h4>
                <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your driver's license, passport, or state ID</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    multiple
                    className="hidden"
                    id="id-upload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData({
                        ...formData,
                        documents: {
                          ...formData.documents,
                          id: [...formData.documents.id, ...files]
                        }
                      });
                    }}
                  />
                  <label
                    htmlFor="id-upload"
                    className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    Choose Files
                  </label>
                </div>
                {formData.documents.id.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded files:</p>
                    <div className="space-y-2">
                      {formData.documents.id.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            onClick={() => {
                              const newFiles = formData.documents.id.filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                documents: { ...formData.documents, id: newFiles }
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>


            </div>
          </div>
        );

      case 7: // Review & Submit (only for full application)
        return (
          <div className="space-y-6">
         
            <div className="text-center space-y-2">
              <FileText className="h-16 w-16 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Review Your Application</h3>
              <p className="text-muted-foreground">
                Please review your information before submitting your
                application
                {property && ` for ${property.title}`}.
              </p>
            </div>

            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(0)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Name:</span>
                  <span>
                    {formData.firstName}{" "}
                    {formData.middleInitial && formData.middleInitial + ". "}
                    {formData.lastName}
                  </span>
                  <span className="font-medium">Date of Birth:</span>
                  <span>
                    {new Date(formData.dateOfBirth).toLocaleDateString()}
                  </span>
                  <span className="font-medium">Email:</span>
                  <span>{formData.email}</span>
                  <span className="font-medium">Phone:</span>
                  <span>{formData.phone}</span>
                  <span className="font-medium">Move-in Date:</span>
                  <span>
                    {new Date(formData.moveInDate).toLocaleDateString()}
                  </span>
                  <span className="font-medium">SSN:</span>
                  <span>
                    {formData.ssn ? "***-**-" + formData.ssn.slice(-4) : ""}
                  </span>
                  <span className="font-medium">Citizenship:</span>
                  <span>
                    {formData.isCitizen ? "U.S. Citizen" : "Non-U.S. Citizen"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Financial Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Employment:</span>
                  <span>{formData.employment}</span>
                  {formData.employment !== "unemployed" && (
                    <>
                      <span className="font-medium">Primary Employer:</span>
                      <span>{formData.employerName}</span>
                      <span className="font-medium">Total Monthly Income:</span>
                      <span>
                        $
                        {formData.employers
                          .reduce((total, emp) => {
                            const income = emp.income
                              ? parseFloat(emp.income.replace(/,/g, ""))
                              : 0;
                            return total + income;
                          }, 0)
                          .toLocaleString()}
                      </span>
                    </>
                  )}
                  {formData.hasOtherIncome && (
                    <>
                      <span className="font-medium">Other Income:</span>
                      <span>{formData.otherIncomeDetails}</span>
                    </>
                  )}
                </div>
                {formData.employers.length > 0 &&
                  formData.employers.some((emp) => emp.name) && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Employment Details:</p>
                      {formData.employers.map(
                        (emp, index) =>
                          emp.name && (
                            <div
                              key={index}
                              className="ml-4 mb-2 p-3 bg-muted/30 rounded"
                            >
                              <p>
                                <strong>{emp.name}</strong> - {emp.position}
                              </p>
                              <p>Industry: {emp.industry}</p>
                              <p>Status: {emp.employmentStatus}</p>
                              <p>
                                Income: $
                                {(emp.income
                                  ? parseFloat(emp.income.replace(/,/g, ""))
                                  : 0
                                ).toLocaleString()}
                                /month
                              </p>
                            </div>
                          )
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Housing History */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Housing History</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <p className="font-medium mb-2">Current Address:</p>
                  <div className="ml-4">
                    <p>{formData.currentStreet}</p>
                    <p>
                      {formData.currentCity}, {formData.currentState}{" "}
                      {formData.currentZip}
                    </p>
                    <p>
                      Duration:{" "}
                      {formData.currentDuration === "0-2"
                        ? "Less than 2 years"
                        : "More than 2 years"}
                    </p>
                  </div>
                </div>
                {formData.currentDuration === "0-2" &&
                  formData.previousStreet && (
                    <div>
                      <p className="font-medium mb-2">Previous Address:</p>
                      <div className="ml-4">
                        <p>{formData.previousStreet}</p>
                        <p>
                          {formData.previousCity}, {formData.previousState}{" "}
                          {formData.previousZip}
                        </p>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Lease Holders & Guarantors */}
            {(formData.leaseHolders.length > 0 ||
              formData.guarantors.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Lease Holders & Guarantors
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(3)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {formData.leaseHolders.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Lease Holders:</p>
                      {formData.leaseHolders.map(
                        (holder: any, index: number) => (
                          <div
                            key={index}
                            className="ml-4 mb-2 p-3 bg-muted/30 rounded"
                          >
                            <p>
                              <strong>
                                {holder.firstName}{" "}
                                {holder.middleInitial &&
                                  holder.middleInitial + ". "}
                                {holder.lastName}
                              </strong>
                            </p>
                            <p>Email: {holder.email}</p>
                            <p>Phone: {holder.phone}</p>
                            <p>
                              DOB:{" "}
                              {new Date(
                                holder.dateOfBirth
                              ).toLocaleDateString()}
                            </p>
                            <p>SSN: ***-**-{holder.ssn?.slice(-4)}</p>
                            <p>
                              Citizenship:{" "}
                              {holder.isCitizen ?? true
                                ? "U.S. Citizen"
                                : "Non-U.S. Citizen"}
                            </p>
                            {/* Address Information */}
                            {holder.currentStreet && (
                              <div className="mt-2 text-xs">
                                <p>
                                  Current Address: {holder.currentStreet},{" "}
                                  {holder.currentCity}, {holder.currentState}{" "}
                                  {holder.currentZip}
                                </p>
                                <p>
                                  Duration:{" "}
                                  {holder.currentDuration === "0-2"
                                    ? "Less than 2 years"
                                    : "2+ years"}
                                </p>
                                {holder.currentDuration === "0-2" &&
                                  holder.previousStreet && (
                                    <p>
                                      Previous Address: {holder.previousStreet},{" "}
                                      {holder.previousCity},{" "}
                                      {holder.previousState}{" "}
                                      {holder.previousZip}
                                    </p>
                                  )}
                              </div>
                            )}
                            {holder.employmentStatus !== "unemployed" && (
                              <div className="mt-2 text-xs">
                                <p>Employment: {holder.employmentStatus}</p>
                                {holder.employerName && (
                                  <p>Employer: {holder.employerName}</p>
                                )}
                                {holder.industry && (
                                  <p>Industry: {holder.industry}</p>
                                )}
                                {holder.position && (
                                  <p>Position: {holder.position}</p>
                                )}
                                {holder.monthlyIncome && (
                                  <p>
                                    Income: $
                                    {(holder.monthlyIncome
                                      ? parseFloat(
                                          holder.monthlyIncome
                                            .toString()
                                            .replace(/,/g, "")
                                        )
                                      : 0
                                    ).toLocaleString()}
                                    /month
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {formData.guarantors.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Guarantors:</p>
                      {formData.guarantors.map(
                        (guarantor: any, index: number) => (
                          <div
                            key={index}
                            className="ml-4 mb-2 p-3 bg-muted/30 rounded"
                          >
                            <p>
                              <strong>
                                {guarantor.firstName}{" "}
                                {guarantor.middleInitial &&
                                  guarantor.middleInitial + ". "}
                                {guarantor.lastName}
                              </strong>
                            </p>
                            <p>Email: {guarantor.email}</p>
                            <p>Phone: {guarantor.phone}</p>
                            <p>
                              DOB:{" "}
                              {new Date(
                                guarantor.dateOfBirth
                              ).toLocaleDateString()}
                            </p>
                            <p>SSN: ***-**-{guarantor.ssn?.slice(-4)}</p>
                            <p>
                              Citizenship:{" "}
                              {guarantor.isCitizen ?? true
                                ? "U.S. Citizen"
                                : "Non-U.S. Citizen"}
                            </p>
                            {/* Address Information */}
                            {guarantor.currentStreet && (
                              <div className="mt-2 text-xs">
                                <p>
                                  Current Address: {guarantor.currentStreet},{" "}
                                  {guarantor.currentCity},{" "}
                                  {guarantor.currentState}{" "}
                                  {guarantor.currentZip}
                                </p>
                                <p>
                                  Duration:{" "}
                                  {guarantor.currentDuration === "0-2"
                                    ? "Less than 2 years"
                                    : "2+ years"}
                                </p>
                                {guarantor.currentDuration === "0-2" &&
                                  guarantor.previousStreet && (
                                    <p>
                                      Previous Address:{" "}
                                      {guarantor.previousStreet},{" "}
                                      {guarantor.previousCity},{" "}
                                      {guarantor.previousState}{" "}
                                      {guarantor.previousZip}
                                    </p>
                                  )}
                              </div>
                            )}
                            {guarantor.employmentStatus !== "unemployed" && (
                              <div className="mt-2 text-xs">
                                <p>Employment: {guarantor.employmentStatus}</p>
                                {guarantor.employerName && (
                                  <p>Employer: {guarantor.employerName}</p>
                                )}
                                {guarantor.industry && (
                                  <p>Industry: {guarantor.industry}</p>
                                )}
                                {guarantor.position && (
                                  <p>Position: {guarantor.position}</p>
                                )}
                                {guarantor.monthlyIncome && (
                                  <p>
                                    Income: $
                                    {(guarantor.monthlyIncome
                                      ? parseFloat(
                                          guarantor.monthlyIncome
                                            .toString()
                                            .replace(/,/g, "")
                                        )
                                      : 0
                                    ).toLocaleString()}
                                    /month
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Occupants */}
            {formData.additionalOccupants.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Additional Occupants
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(4)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  {formData.additionalOccupants.map(
                    (occupant: any, index: number) => {
                      const displayAge = occupant.age
                        ? parseInt(occupant.age)
                        : occupant.dateOfBirth
                        ? Math.floor(
                            (Date.now() -
                              new Date(occupant.dateOfBirth).getTime()) /
                              (1000 * 60 * 60 * 24 * 365.25)
                          )
                        : 0;
                      const isAdult = displayAge >= 18;

                      return (
                        <div
                          key={index}
                          className="mb-2 p-3 bg-muted/30 rounded"
                        >
                          <p>
                            <strong>
                              {occupant.firstName} {occupant.lastName}
                            </strong>
                          </p>
                          <p>Relationship: {occupant.relationship}</p>
                          <p>Age: {displayAge} years old</p>
                          {isAdult ? (
                            <>
                              {occupant.dateOfBirth && (
                                <p>
                                  DOB:{" "}
                                  {new Date(
                                    occupant.dateOfBirth
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              {occupant.ssn && (
                                <p>SSN: ***-**-{occupant.ssn?.slice(-4)}</p>
                              )}
                            </>
                          ) : null}
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            {(formData.pets.length > 0 ||
              formData.vehicles.length > 0 ||
              formData.emergencyContact.name ||
              formData.emergencyContact.phone ||
              formData.emergencyContact.email ||
              formData.additionalInfo) && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Additional Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(5)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {formData.pets.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Pets:</p>
                      {formData.pets.map((pet: any, index: number) => (
                        <div key={index} className="ml-4 mb-2">
                          <p>
                            {pet.type} - {pet.breed} ({pet.weight} lbs)
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.vehicles.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Vehicles:</p>
                      {formData.vehicles.map((vehicle: any, index: number) => (
                        <div key={index} className="ml-4 mb-2">
                          <p>
                            {vehicle.type} - {vehicle.make} {vehicle.model} (
                            {vehicle.color})
                          </p>
                          <p>License: {vehicle.licensePlate}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {(formData.emergencyContact.name ||
                    formData.emergencyContact.phone ||
                    formData.emergencyContact.email) && (
                    <div>
                      <p className="font-medium">Emergency Contact:</p>
                      <div className="ml-4">
                        {formData.emergencyContact.name && (
                          <p>Name: {formData.emergencyContact.name}</p>
                        )}
                        {formData.emergencyContact.phone && (
                          <p>Phone: {formData.emergencyContact.phone}</p>
                        )}
                        {formData.emergencyContact.email && (
                          <p>Email: {formData.emergencyContact.email}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {formData.additionalInfo && (
                    <div>
                      <p className="font-medium">Additional Information:</p>
                      <p className="ml-4">{formData.additionalInfo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Required Authorization */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg text-primary">
                  Required Authorizations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Switch
                      id="backgroundCheckPermission"
                      checked={formData.backgroundCheckPermission}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          backgroundCheckPermission: checked,
                        })
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="backgroundCheckPermission"
                        className="text-sm font-medium text-primary"
                      >
                        Background, Income, and Credit Authorization (Required)
                        *
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        I authorize background, income, and credit checks to be
                        performed as part of the application process. I
                        understand this is required for rental approval and
                        cannot be waived.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Switch
                      id="textMessagePermission"
                      checked={formData.textMessagePermission}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          textMessagePermission: checked,
                        })
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="textMessagePermission"
                        className="text-sm"
                      >
                        Text Message Communication (Optional)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        I authorize text message communication regarding my
                        application and rental updates.
                      </p>
                    </div>
                  </div>

                  {!formData.backgroundCheckPermission && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium">
                        Background check authorization is required to submit
                        your application.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResultsScreen = () => {
    if (qualifiedProperties.length > 0) {
      return (
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold text-green-600">
              Congratulations, You are Pre-qualified!
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your application, you qualify for the following
              properties. You can schedule a tour or secure a unit below.
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {qualifiedProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {property.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {property.address}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            {property.bedrooms} bed
                          </span>
                          <span className="text-sm">
                            {property.bathrooms} bath
                          </span>
                          <span className="text-sm">
                            Available: {property.availableDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${property.rent}/mo
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleScheduleTour}
                      >
                        Schedule Tour
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          // Set the selected property and unit from the first qualified property
                          if (
                            qualifiedProperties &&
                            qualifiedProperties.length > 0
                          ) {
                            setSelectedProperty(qualifiedProperties[0]);
                            // Create a mock unit object with the necessary data
                            setSelectedUnit({
                              id: "1",
                              unitNumber: "A1",
                              type: "2 Bedroom",
                              bedrooms: qualifiedProperties[0].bedrooms,
                              bathrooms: qualifiedProperties[0].bathrooms,
                              sqft: 1100,
                              rent: qualifiedProperties[0].rent,
                              available: true,
                              qualified: true,
                            });
                          }
                          // Navigate to product selection step
                          setCurrentProspectStep("products");
                        }}
                      >
                        Secure Unit
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
              onClose();
            }}
            className="mt-6"
          >
            Apply to More Properties
          </Button>
        </div>
      );
    } else {
      return (
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <Home className="h-20 w-20 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold">
              No Qualifying Properties Found
            </h2>
            <p className="text-lg text-muted-foreground">
              Unfortunately, we do not have any properties in your search
              criteria where you qualify to live. We are always adding
              properties to our platform. Please check back with us. Thank you.
            </p>
          </div>

          <Button
            onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
              onClose();
            }}
            className="mt-6"
          >
            Search Again
          </Button>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 bg-gradient-to-br from-green-50 to-blue-50">
        <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl mr-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white">
            {showResults
              ? "Pre-qualification Results"
              : type === "prequalify"
              ? "Get Pre-Qualified"
              : "Rental Application"}
          </DialogTitle>
                <p className="text-green-100 text-lg">
                  Fill out the form below to apply for your dream home
                </p>
              </div>
            </div>
           
          </div>
        </DialogHeader>

        {/* Step Navigation - Responsive design */}
        {!showResults && (
          <div className="flex-shrink-0 px-4 py-4 bg-white/90 backdrop-blur-md overflow-x-auto">
            <div className="flex items-center justify-start min-w-max space-x-1">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-shrink-0">
                  <div
                    className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition-all ${
                      index === currentStep
                        ? "bg-blue-600 text-white shadow-lg"
                        : index < currentStep
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {step.icon && (
                      <step.icon className={`h-3 w-3 ${
                        index === currentStep ? "text-white" : ""
                      }`} />
                    )}
                    <span className={`text-xs font-medium whitespace-nowrap ${
                      index === currentStep ? "text-white" : ""
                    }`}>
                      {/* Show abbreviated text for longer step names */}
                      {step.title === "Lease Holders & Guarantors" ? "Lease Holders" :
                       step.title === "Additional Occupants" ? "Occupants" :
                       step.title === "Additional Info" ? "Additional" :
                       step.title}
                  </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-2 h-0.5 bg-blue-300 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showCalendarPlaceholder ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Schedule Tour
              </h3>
              <p className="text-gray-600 mb-6">
                This is a placeholder to connect to the landlord's calendar. In
                production, this will integrate with the property owner's
                scheduling system to allow tenants to book tour appointments.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowCalendarPlaceholder(false)}
                  className="w-full"
                >
                  Back to Properties
                </Button>
              </div>
            </div>
          </div>
        ) : showMatchingProcess ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Matching Process
              </h3>
              <p className="text-gray-600 mb-6">
                This is a placeholder for the matching process. In production,
                this will connect to 3rd party services to run background checks
                and property matching.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => handleMatchingResult(true)}
                  className="w-full"
                >
                  Housing Available
                </Button>
                <Button
                  onClick={() => handleMatchingResult(false)}
                  variant="outline"
                  className="w-full"
                >
                  No Housing Available
                </Button>
              </div>
            </div>
          </div>
        ) : showResults ? (
          <div className="flex-1 overflow-y-auto p-6">
            {currentProspectStep === "qualified" && renderResultsScreen()}

            {currentProspectStep !== "qualified" && (
              <>
                {currentProspectStep === "lease_term" && (
                  <LeaseTermSelection
                    property={selectedProperty}
                    unit={selectedUnit}
                    onLeaseTermSelect={(leaseTerm) => {
                      setSelectedLeaseTerm(leaseTerm);
                      setCurrentProspectStep("products");
                    }}
                    onBack={() => setCurrentProspectStep("qualified")}
                  />
                )}

                {currentProspectStep === "products" && (
                  <ProductSelection
                    property={selectedProperty}
                    unit={selectedUnit}
                    selectedLeaseTerm={selectedLeaseTerm}
                    applicantData={formData}
                    onBack={() => setCurrentProspectStep("qualified")}
                    onPaymentProcess={(data) => {
                      setPaymentData(data);
                      setCurrentProspectStep("payment");
                    }}
                  />
                )}

                {currentProspectStep === "payment" && (
                  <PaymentProcess
                    paymentData={paymentData}
                    onBackToProducts={() => setCurrentProspectStep("products")}
                    onPaymentComplete={(success, details) => {
                      if (success) {
                        toast({
                          title: "Payment Successful!",
                          description: "Welcome to your new home!",
                        });
                      } else {
                        toast({
                          title: "Payment Failed",
                          description:
                            "Please try again with a different payment method.",
                          variant: "destructive",
                        });
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Step content - scrollable */}
            <div
              className="flex-1 overflow-y-auto bg-white/90 backdrop-blur-md"
            >
              <div className="p-6 space-y-6">
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {(() => {
                      const IconComponent = steps[currentStep]?.icon;
                      return IconComponent ? (
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : null;
                    })()}
                    <h2 className="text-xl font-bold text-gray-900">
                      {steps[currentStep].title}
                    </h2>
                  </div>
                  
                  {/* Security Banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      All personal information is secure and encrypted.
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                  {renderStepContent()}
                </div>
              </div>
            </div>

            {/* Navigation - fixed at bottom */}
            <div className="flex-shrink-0 flex justify-between items-center px-6 py-6 bg-white/90 backdrop-blur-md">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-6 py-3 border border-green-200 rounded-xl hover:bg-green-50 text-green-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Submit {type === "prequalify" ? "Pre-qualification" : "Application"}</span>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationProcess;
