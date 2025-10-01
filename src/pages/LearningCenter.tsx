import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle,
  Star,
  TrendingUp,
  DollarSign,
  Home,
  Shield,
  Users,
  Search,
  Filter,
  Bookmark,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'interactive' | 'guide';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'financial' | 'renting' | 'homeownership' | 'credit' | 'legal';
  thumbnail?: string;
  completed: boolean;
  progress: number; // 0-100
  rating: number;
  bookmarkCount: number;
  isBookmarked: boolean;
}

interface LearningCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  moduleCount: number;
  completedCount: number;
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

  // Mock data - in real app, this would come from Firebase
  useEffect(() => {
    const mockCategories: LearningCategory[] = [
      {
        id: 'financial',
        name: 'Financial Literacy',
        description: 'Learn about budgeting, saving, and financial planning',
        icon: DollarSign,
        color: 'bg-green-100 text-green-600',
        moduleCount: 8,
        completedCount: 3
      },
      {
        id: 'renting',
        name: 'Renting 101',
        description: 'Everything you need to know about renting',
        icon: Home,
        color: 'bg-blue-100 text-blue-600',
        moduleCount: 12,
        completedCount: 5
      },
      {
        id: 'credit',
        name: 'Credit & Credit Scores',
        description: 'Understanding and improving your credit',
        icon: TrendingUp,
        color: 'bg-purple-100 text-purple-600',
        moduleCount: 6,
        completedCount: 2
      },
      {
        id: 'legal',
        name: 'Legal Rights & Responsibilities',
        description: 'Know your rights as a renter',
        icon: Shield,
        color: 'bg-orange-100 text-orange-600',
        moduleCount: 4,
        completedCount: 1
      }
    ];

    const mockModules: LearningModule[] = [
      {
        id: '1',
        title: 'Creating Your First Budget',
        description: 'Learn the basics of budgeting and how to create a budget that works for you.',
        type: 'video',
        duration: 15,
        difficulty: 'beginner',
        category: 'financial',
        completed: true,
        progress: 100,
        rating: 4.8,
        bookmarkCount: 1247,
        isBookmarked: true
      },
      {
        id: '2',
        title: 'Understanding Your Lease Agreement',
        description: 'A comprehensive guide to reading and understanding lease agreements.',
        type: 'article',
        duration: 20,
        difficulty: 'intermediate',
        category: 'renting',
        completed: false,
        progress: 60,
        rating: 4.6,
        bookmarkCount: 892,
        isBookmarked: false
      },
      {
        id: '3',
        title: 'Improving Your Credit Score',
        description: 'Practical steps to boost your credit score and maintain good credit health.',
        type: 'interactive',
        duration: 25,
        difficulty: 'intermediate',
        category: 'credit',
        completed: false,
        progress: 30,
        rating: 4.9,
        bookmarkCount: 1563,
        isBookmarked: true
      },
      {
        id: '4',
        title: 'Renter\'s Rights and Responsibilities',
        description: 'Know what you\'re entitled to and what\'s expected of you as a renter.',
        type: 'guide',
        duration: 18,
        difficulty: 'beginner',
        category: 'legal',
        completed: true,
        progress: 100,
        rating: 4.7,
        bookmarkCount: 743,
        isBookmarked: false
      },
      {
        id: '5',
        title: 'Saving for Your First Home',
        description: 'Strategies and tips for saving money to buy your first home.',
        type: 'video',
        duration: 22,
        difficulty: 'advanced',
        category: 'financial',
        completed: false,
        progress: 0,
        rating: 4.5,
        bookmarkCount: 634,
        isBookmarked: false
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setModules(mockModules);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesType = selectedType === 'all' || module.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
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

  const totalModules = modules.length;
  const completedModules = modules.filter(m => m.completed).length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading learning center...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Learning Center
              </h1>
              <p className="text-gray-600 mt-2">
                Expand your knowledge with our educational resources
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{completedModules}/{totalModules}</div>
              <div className="text-sm text-gray-600">Modules Completed</div>
              <Progress value={overallProgress} className="w-32 mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{category.moduleCount} modules</span>
                  <span className="text-green-600 font-medium">{category.completedCount} completed</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search learning modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-200"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="article">Articles</option>
                <option value="interactive">Interactive</option>
                <option value="guide">Guides</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Modules */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {filteredModules.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No modules found' : 'No learning modules available'}
            </h3>
            <p className="text-gray-600 text-lg">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Check back soon for new educational content'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Module Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        {getTypeIcon(module.type)}
                      </div>
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty}
                      </Badge>
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

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{module.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                      <span>{module.rating}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
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

                {/* Module Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {module.completed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {module.progress > 0 ? 'In Progress' : 'Not Started'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStartModule(module)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {module.progress > 0 ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
