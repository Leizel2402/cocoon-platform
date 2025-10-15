import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle,
  Star,
  DollarSign,
  Home,
  Search,
  Bookmark,
  Download,
  User,
  Building,
  Briefcase,
  FileCheck,
  CreditCard,
  Scale,
  Settings,
  Share2,
  Copy,
  Mail,
  MessageSquare,
  Link,
  X,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'interactive' | 'guide';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'financial' | 'renting' | 'homeownership' | 'credit' | 'legal' | 'qualification' | 'documents' | 'property-management' | 'compliance';
  persona: 'prospect' | 'renter' | 'landlord' | 'employee';
  thumbnail?: string;
  completed: boolean;
  progress: number;
  rating: number;
  bookmarkCount: number;
  isBookmarked: boolean;
}

interface LearningCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  moduleCount: number;
  completedCount: number;
  personas: string[];
}

export function LearningCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [shareCenterModalOpen, setShareCenterModalOpen] = useState(false);

  // Map user roles to personas
  const getUserPersona = (userRole: string | undefined): string => {
    switch (userRole) {
      case 'prospect':
        return 'prospect';
      case 'renter':
        return 'renter';
      case 'landlord_admin':
      case 'landlord_employee':
        return 'landlord';
      case 'cocoon_admin':
      case 'cocoon_employee':
        return 'employee';
      default:
        return 'prospect';
    }
  };

  const getPersonaDisplayName = (persona: string): string => {
    const names = {
      prospect: 'Prospects',
      renter: 'Renters',
      landlord: 'Landlords',
      employee: 'Employees'
    };
    return names[persona] || persona;
  };

  // Mock data
  useEffect(() => {
    const mockCategories: LearningCategory[] = [
      // Prospect-focused categories
      {
        id: 'qualification',
        name: 'Qualification & Credit',
        description: 'How to qualify, improve credit, and prepare for renting',
        icon: CreditCard,
        color: 'bg-blue-100 text-blue-600',
        moduleCount: 6,
        completedCount: 2,
        personas: ['prospect']
      },
      {
        id: 'documents',
        name: 'Document Preparation',
        description: 'Essential documents and application preparation',
        icon: FileCheck,
        color: 'bg-green-100 text-green-600',
        moduleCount: 4,
        completedCount: 1,
        personas: ['prospect']
      },
      
      // Renter-focused categories
      {
        id: 'financial',
        name: 'Financial Literacy',
        description: 'Budgeting, saving, and financial planning',
        icon: DollarSign,
        color: 'bg-emerald-100 text-emerald-600',
        moduleCount: 8,
        completedCount: 3,
        personas: ['renter', 'prospect']
      },
      {
        id: 'renting',
        name: 'Renting 101',
        description: 'Everything you need to know about renting',
        icon: Home,
        color: 'bg-purple-100 text-purple-600',
        moduleCount: 12,
        completedCount: 5,
        personas: ['renter']
      },
      {
        id: 'legal',
        name: 'Renter\'s Rights',
        description: 'Know your rights and responsibilities',
        icon: Scale,
        color: 'bg-orange-100 text-orange-600',
        moduleCount: 5,
        completedCount: 2,
        personas: ['renter']
      },
      {
        id: 'homeownership',
        name: 'Path to Ownership',
        description: 'Transitioning from renting to homeownership',
        icon: TrendingUp,
        color: 'bg-cyan-100 text-cyan-600',
        moduleCount: 6,
        completedCount: 1,
        personas: ['renter']
      },
      
      // Landlord-focused categories
      {
        id: 'property-management',
        name: 'Property Management',
        description: 'Best practices for property management',
        icon: Building,
        color: 'bg-indigo-100 text-indigo-600',
        moduleCount: 7,
        completedCount: 1,
        personas: ['landlord']
      },
      
      // Employee-focused categories
      {
        id: 'compliance',
        name: 'Compliance & Processes',
        description: 'Internal process guides and compliance',
        icon: Settings,
        color: 'bg-gray-100 text-gray-600',
        moduleCount: 4,
        completedCount: 0,
        personas: ['employee']
      }
    ];

    const mockModules: LearningModule[] = [
      // PROSPECT MODULES
      // Qualification & Credit
      {
        id: '1',
        title: 'How to Qualify for Your First Rental',
        description: 'Learn the essential requirements and steps to qualify for your first rental property.',
        type: 'video',
        duration: 15,
        difficulty: 'beginner',
        category: 'qualification',
        persona: 'prospect',
        completed: false,
        progress: 0,
        rating: 4.8,
        bookmarkCount: 1247,
        isBookmarked: false
      },
      {
        id: '2',
        title: 'Improving Your Credit Score',
        description: 'Practical steps to boost your credit score and maintain good credit health.',
        type: 'interactive',
        duration: 25,
        difficulty: 'intermediate',
        category: 'qualification',
        persona: 'prospect',
        completed: false,
        progress: 0,
        rating: 4.9,
        bookmarkCount: 1563,
        isBookmarked: false
      },
      {
        id: '3',
        title: 'Understanding Credit Reports',
        description: 'Learn how to read your credit report and identify areas for improvement.',
        type: 'article',
        duration: 12,
        difficulty: 'beginner',
        category: 'qualification',
        persona: 'prospect',
        completed: false,
        progress: 0,
        rating: 4.7,
        bookmarkCount: 945,
        isBookmarked: false
      },
      
      // Document Preparation
      {
        id: '4',
        title: 'Essential Documents for Rental Applications',
        description: 'Complete guide to preparing all required documents for your rental application.',
        type: 'guide',
        duration: 12,
        difficulty: 'beginner',
        category: 'documents',
        persona: 'prospect',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 892,
        isBookmarked: false
      },
      {
        id: '5',
        title: 'Proof of Income Documentation',
        description: 'What landlords look for and how to present your income documentation effectively.',
        type: 'article',
        duration: 10,
        difficulty: 'beginner',
        category: 'documents',
        persona: 'prospect',
        completed: false,
        progress: 0,
        rating: 4.5,
        bookmarkCount: 678,
        isBookmarked: false
      },
      
      // RENTER MODULES
      // Financial Literacy
      {
        id: '6',
        title: 'Creating Your First Budget',
        description: 'Learn the basics of budgeting and how to create a budget that works for you.',
        type: 'video',
        duration: 15,
        difficulty: 'beginner',
        category: 'financial',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.8,
        bookmarkCount: 1247,
        isBookmarked: false
      },
      {
        id: '7',
        title: 'Building an Emergency Fund',
        description: 'Why emergency funds matter and how to build one step by step.',
        type: 'interactive',
        duration: 18,
        difficulty: 'intermediate',
        category: 'financial',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.7,
        bookmarkCount: 1089,
        isBookmarked: false
      },
      {
        id: '8',
        title: 'Managing Rent and Living Expenses',
        description: 'Strategies for balancing rent payments with other living expenses.',
        type: 'guide',
        duration: 14,
        difficulty: 'beginner',
        category: 'financial',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 934,
        isBookmarked: false
      },
      
      // Renting 101
      {
        id: '9',
        title: 'Understanding Your Lease Agreement',
        description: 'A comprehensive guide to reading and understanding lease agreements.',
        type: 'article',
        duration: 20,
        difficulty: 'intermediate',
        category: 'renting',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 892,
        isBookmarked: false
      },
      {
        id: '10',
        title: 'Move-In Checklist and Inspection',
        description: 'Protect yourself with a thorough move-in inspection and documentation.',
        type: 'guide',
        duration: 12,
        difficulty: 'beginner',
        category: 'renting',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.7,
        bookmarkCount: 765,
        isBookmarked: false
      },
      {
        id: '11',
        title: 'Maintenance Requests and Repairs',
        description: 'How to properly request repairs and understand landlord responsibilities.',
        type: 'video',
        duration: 15,
        difficulty: 'beginner',
        category: 'renting',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.5,
        bookmarkCount: 623,
        isBookmarked: false
      },
      
      // Renter's Rights
      {
        id: '12',
        title: 'Renter\'s Rights and Responsibilities',
        description: 'Know what you\'re entitled to and what\'s expected of you as a renter.',
        type: 'guide',
        duration: 18,
        difficulty: 'beginner',
        category: 'legal',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.7,
        bookmarkCount: 743,
        isBookmarked: false
      },
      {
        id: '13',
        title: 'Dealing with Disputes',
        description: 'How to handle disagreements with your landlord professionally.',
        type: 'article',
        duration: 16,
        difficulty: 'intermediate',
        category: 'legal',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 589,
        isBookmarked: false
      },
      
      // Path to Ownership
      {
        id: '14',
        title: 'Transitioning from Renting to Homeownership',
        description: 'Steps and strategies for making the transition from renter to homeowner.',
        type: 'video',
        duration: 22,
        difficulty: 'advanced',
        category: 'homeownership',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.5,
        bookmarkCount: 634,
        isBookmarked: false
      },
      {
        id: '15',
        title: 'Saving for a Down Payment',
        description: 'Practical strategies to save for your first home down payment.',
        type: 'interactive',
        duration: 20,
        difficulty: 'intermediate',
        category: 'homeownership',
        persona: 'renter',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 712,
        isBookmarked: false
      },
      
      // LANDLORD MODULES
      // Property Management
      {
        id: '16',
        title: 'Property Management Best Practices',
        description: 'Essential strategies for effective property management and tenant relations.',
        type: 'video',
        duration: 30,
        difficulty: 'intermediate',
        category: 'property-management',
        persona: 'landlord',
        completed: false,
        progress: 0,
        rating: 4.7,
        bookmarkCount: 456,
        isBookmarked: false
      },
      {
        id: '17',
        title: 'Tenant Screening and Selection',
        description: 'How to properly screen and select reliable tenants for your properties.',
        type: 'guide',
        duration: 18,
        difficulty: 'intermediate',
        category: 'property-management',
        persona: 'landlord',
        completed: false,
        progress: 0,
        rating: 4.8,
        bookmarkCount: 523,
        isBookmarked: false
      },
      {
        id: '18',
        title: 'Maintaining Positive Tenant Relationships',
        description: 'Communication strategies and best practices for landlord-tenant relations.',
        type: 'article',
        duration: 16,
        difficulty: 'beginner',
        category: 'property-management',
        persona: 'landlord',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 387,
        isBookmarked: false
      },
      {
        id: '19',
        title: 'Property Maintenance Scheduling',
        description: 'Create effective maintenance schedules to protect your investment.',
        type: 'guide',
        duration: 14,
        difficulty: 'intermediate',
        category: 'property-management',
        persona: 'landlord',
        completed: false,
        progress: 0,
        rating: 4.5,
        bookmarkCount: 298,
        isBookmarked: false
      },
      
      // EMPLOYEE MODULES
      // Compliance & Processes
      {
        id: '20',
        title: 'Compliance and Legal Requirements',
        description: 'Understanding compliance requirements and legal obligations in property management.',
        type: 'article',
        duration: 25,
        difficulty: 'advanced',
        category: 'compliance',
        persona: 'employee',
        completed: false,
        progress: 0,
        rating: 4.6,
        bookmarkCount: 234,
        isBookmarked: false
      },
      {
        id: '21',
        title: 'Internal Process Guidelines',
        description: 'Comprehensive guide to internal processes and standard operating procedures.',
        type: 'guide',
        duration: 20,
        difficulty: 'intermediate',
        category: 'compliance',
        persona: 'employee',
        completed: false,
        progress: 0,
        rating: 4.5,
        bookmarkCount: 189,
        isBookmarked: false
      },
      {
        id: '22',
        title: 'Fair Housing and Anti-Discrimination',
        description: 'Understanding fair housing laws and ensuring compliance in all interactions.',
        type: 'video',
        duration: 30,
        difficulty: 'advanced',
        category: 'compliance',
        persona: 'employee',
        completed: false,
        progress: 0,
        rating: 4.8,
        bookmarkCount: 312,
        isBookmarked: false
      },
      {
        id: '23',
        title: 'Data Privacy and Security',
        description: 'Best practices for handling sensitive tenant and property information.',
        type: 'interactive',
        duration: 22,
        difficulty: 'intermediate',
        category: 'compliance',
        persona: 'employee',
        completed: false,
        progress: 0,
        rating: 4.7,
        bookmarkCount: 267,
        isBookmarked: false
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setModules(mockModules);
      setLoading(false);
    }, 1000);
  }, []);

  const userPersona = getUserPersona(user?.role);

  // Filter categories based on persona
  const filteredCategories = categories.filter(category => {
    if (showAllTopics) return true;
    return category.personas?.includes(userPersona);
  });

  // Filter modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesType = selectedType === 'all' || module.type === selectedType;
    const matchesPersona = showAllTopics || module.persona === userPersona;
    
    return matchesSearch && matchesCategory && matchesType && matchesPersona;
  });

  const getTypeIcon = (type: LearningModule['type']) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'interactive':
        return <BookOpen className="h-4 w-4" />;
      case 'guide':
        return <Award className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: LearningModule['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPersonaColor = (persona: LearningModule['persona']) => {
    switch (persona) {
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'renter':
        return 'bg-green-100 text-green-800';
      case 'landlord':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPersonaIcon = (persona: LearningModule['persona']) => {
    switch (persona) {
      case 'prospect':
        return <User className="h-3 w-3" />;
      case 'renter':
        return <Home className="h-3 w-3" />;
      case 'landlord':
        return <Building className="h-3 w-3" />;
      case 'employee':
        return <Briefcase className="h-3 w-3" />;
    }
  };

  const handleBookmark = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isBookmarked: !module.isBookmarked, bookmarkCount: module.isBookmarked ? module.bookmarkCount - 1 : module.bookmarkCount + 1 }
        : module
    ));
    
    const module = modules.find(m => m.id === moduleId);
    toast({
      title: module?.isBookmarked ? "Bookmark removed" : "Bookmark added",
      description: module?.isBookmarked ? "Removed from your bookmarks" : "Added to your bookmarks",
    });
  };

  const handleStartModule = (module: LearningModule) => {
    toast({
      title: "Starting module",
      description: `Opening "${module.title}"`,
    });
  };

  const handleShareModule = (module: LearningModule) => {
    setSelectedModule(module);
    setShareModalOpen(true);
  };

  const handleCopyLink = async (module: LearningModule) => {
    const shareUrl = `${window.location.origin}/learning-center?module=${module.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Module link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    if (!selectedModule) return;
    const shareUrl = `${window.location.origin}/learning-center?module=${selectedModule.id}`;
    const subject = `Check out this learning module: ${selectedModule.title}`;
    const body = `Hi! I found this great learning module on Cocoon that might interest you:\n\n"${selectedModule.title}"\n\n${selectedModule.description}\n\nDuration: ${selectedModule.duration} minutes\nDifficulty: ${selectedModule.difficulty}\nCategory: ${selectedModule.category}\n\nCheck it out here: ${shareUrl}\n\nBest regards!`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    setShareModalOpen(false);
  };

  const handleTextShare = () => {
    if (!selectedModule) return;
    const shareUrl = `${window.location.origin}/learning-center?module=${selectedModule.id}`;
    const text = `Check out this learning module: "${selectedModule.title}" - ${selectedModule.description}\n\n${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: selectedModule.title,
        text: text,
        url: shareUrl,
      }).catch(console.log);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Text copied!",
          description: "Module text has been copied to your clipboard",
        });
      }).catch(console.error);
    }
    setShareModalOpen(false);
  };

  const handleModalCopyLink = async () => {
    if (!selectedModule) return;
    const shareUrl = `${window.location.origin}/learning-center?module=${selectedModule.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Module link has been copied to your clipboard",
      });
      setShareModalOpen(false);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareCenter = () => {
    setShareCenterModalOpen(true);
  };

  const handleCenterEmailShare = () => {
    const shareUrl = window.location.href;
    const subject = "Check out the Cocoon Learning Center";
    const body = `Hi! I wanted to share the Cocoon Learning Center with you. It's a comprehensive educational platform with tailored content for:\n\n• Prospects: How to qualify, improve credit, prepare documents\n• Renters: Financial literacy, renter's rights, transitioning to ownership\n• Landlords: Property management best practices\n• Employees: Compliance, internal process guides\n\nWith ${totalModules} learning modules covering various topics!\n\nCheck it out here: ${shareUrl}\n\nBest regards!`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    setShareCenterModalOpen(false);
  };

  const handleCenterTextShare = () => {
    const shareUrl = window.location.href;
    const text = `Check out the Cocoon Learning Center - Educational resources for prospects, renters, landlords, and employees! ${totalModules} learning modules available.\n\n${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Cocoon Learning Center",
        text: text,
        url: shareUrl,
      }).catch(console.log);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Text copied!",
          description: "Learning Center text has been copied to your clipboard",
        });
      }).catch(console.error);
    }
    setShareCenterModalOpen(false);
  };

  const handleCenterCopyLink = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Learning Center link has been copied to your clipboard",
      });
      setShareCenterModalOpen(false);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const totalModules = modules.filter(m => showAllTopics || m.persona === userPersona).length;
  const completedModules = modules.filter(m => m.completed && (showAllTopics || m.persona === userPersona)).length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <div className="text-lg font-semibold text-gray-700">Loading learning center...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold">Learning Center</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={handleShareCenter}
              title="Share Learning Center"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Learning Center</h1>
                <p className="text-sm text-green-50">
                  {showAllTopics 
                    ? "Explore all educational resources" 
                    : `Tailored content for ${getPersonaDisplayName(userPersona)}`
                  } • {completedModules}/{totalModules} modules completed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={handleShareCenter}
                title="Share Learning Center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</div>
                <div className="text-sm text-green-50">Overall Progress</div>
              </div>
            </div>
          </div>

          {/* Mobile Progress Info */}
          <div className="sm:hidden bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-50 text-sm">
                  {showAllTopics 
                    ? "Explore all educational resources" 
                    : `Tailored content for ${getPersonaDisplayName(userPersona)}`
                  }
                </p>
                <p className="text-green-100 text-xs">{completedModules}/{totalModules} modules completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</p>
                <p className="text-green-100 text-xs">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4"></div>

        {/* Categories */}
        {filteredCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20"
          >
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Learning Categories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white rounded-lg p-4 sm:p-6 shadow-sm border cursor-pointer hover:shadow-md transition-all duration-300 ${
                      selectedCategory === category.id ? 'border-green-300 shadow-green-200 bg-green-50/30' : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${category.color} flex items-center justify-center mb-3 sm:mb-4`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{category.description}</p>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">{category.moduleCount} modules</span>
                      <span className="text-green-600 font-medium">{category.completedCount} completed</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Search & Filter</h2>
            </div>
            <div className="flex items-center justify-between sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">Modules:</span>{" "}
                <span className="font-semibold text-blue-600">{filteredModules.length}</span>{" "}
                found
              </div>
              <div className="flex flex-col items-end">
                <Button
                  variant={showAllTopics ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAllTopics(!showAllTopics)}
                  className={showAllTopics 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-green-300 text-green-600 hover:bg-green-50"
                  }
                >
                  {showAllTopics ? "Show My Topics" : "Show All Topics"}
                </Button>
                <span className="text-xs text-gray-500 mt-1">
                  {showAllTopics ? "Viewing all personas" : `Viewing ${getPersonaDisplayName(userPersona)} content`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 bg-blue-50 p-1.5 sm:p-2 rounded-lg">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <Input
                  placeholder="Search learning modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 sm:pl-16 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="article">Articles</option>
                <option value="interactive">Interactive</option>
                <option value="guide">Guides</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Learning Modules */}
        {filteredModules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/20"
          >
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'No modules found' : 'No learning modules available'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'Check back soon for new educational content'
                }
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:border-green-300"
                  >
                    <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg text-green-600">
                            {getTypeIcon(module.type)}
                          </div>
                          <Badge className={`${getDifficultyColor(module.difficulty)} text-xs`}>
                            {module.difficulty}
                          </Badge>
                          {showAllTopics && (
                            <Badge className={`${getPersonaColor(module.persona)} text-xs`}>
                              <div className="flex items-center gap-1">
                                {getPersonaIcon(module.persona)}
                                <span className="hidden sm:inline">{module.persona}</span>
                              </div>
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(module.id)}
                          className={module.isBookmarked ? "text-yellow-500" : "text-gray-400"}
                        >
                          <Bookmark className={`h-4 w-4 ${module.isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {module.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                        {module.description}
                      </p>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span>{module.duration} min</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-yellow-400 fill-current" />
                          <span>{module.rating}</span>
                        </div>
                      </div>

                      {module.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-green-600 font-medium">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-2">
                          {module.completed ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              {module.progress > 0 ? 'In Progress' : 'Not Started'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50 text-xs sm:text-sm"
                            onClick={() => handleShareModule(module)}
                            title="Share module"
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-1">Share</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50 text-xs sm:text-sm"
                            onClick={() => handleCopyLink(module)}
                            title="Copy link"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-1">Copy</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStartModule(module)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 text-xs sm:text-sm"
                          >
                            {module.progress > 0 ? 'Continue' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Share Module Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-md mx-auto p-0 bg-white rounded-2xl shadow-2xl">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <Share2 className="h-5 w-5 text-white" />
                </motion.div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Share this module
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareModalOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedModule && (
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    {getTypeIcon(selectedModule.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {selectedModule.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {selectedModule.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 flex-wrap">
                      <Badge className={getDifficultyColor(selectedModule.difficulty)}>
                        {selectedModule.difficulty}
                      </Badge>
                      <Badge className={getPersonaColor(selectedModule.persona)}>
                        <div className="flex items-center gap-1">
                          {getPersonaIcon(selectedModule.persona)}
                          {selectedModule.persona}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pb-6">
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailShare}
                className="w-full flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">Send via email</div>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleTextShare}
                className="w-full flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Text Message</div>
                  <div className="text-sm text-gray-600">Send via text</div>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleModalCopyLink}
                className="w-full flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Link className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Copy link</div>
                  <div className="text-sm text-gray-600">Copy module link</div>
                </div>
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Learning Center Modal */}
      <Dialog open={shareCenterModalOpen} onOpenChange={setShareCenterModalOpen}>
        <DialogContent className="max-w-md mx-auto p-0 bg-white rounded-2xl shadow-2xl">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <BookOpen className="h-5 w-5 text-white" />
                </motion.div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Share Learning Center
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareCenterModalOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Cocoon Learning Center
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Educational resources for prospects, renters, landlords, and employees
                  </p>
                  <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                    <Badge className="bg-green-100 text-green-800">
                      {totalModules} Modules
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {Math.round(overallProgress)}% Complete
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCenterEmailShare}
                className="w-full flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">Send via email</div>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCenterTextShare}
                className="w-full flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Text Message</div>
                  <div className="text-sm text-gray-600">Send via text</div>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCenterCopyLink}
                className="w-full flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Link className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Copy link</div>
                  <div className="text-sm text-gray-600">Copy Learning Center link</div>
                </div>
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}