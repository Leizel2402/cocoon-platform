import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui/Button';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info, 
  Home, 
  FileText,
  Wrench,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property_deleted':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'application_cancelled':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'application_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'application_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'application_submitted':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'maintenance_cancelled':
        return <Wrench className="h-5 w-5 text-green-500" />;
      case 'maintenance_created':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case 'maintenance_resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'listing_removed':
        return <Home className="h-5 w-5 text-blue-500" />;
      // Landlord notification types
      case 'new_application':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'new_maintenance_request':
        return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'new_subscription':
        return <Bell className="h-5 w-5 text-purple-500" />;
      case 'property_viewed':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'application_withdrawn':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'maintenance_updated':
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'payment_received':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'payment_failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date | { seconds: number; nanoseconds: number }) => {
    const dateObj = date instanceof Date ? date : new Date(date.seconds * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return dateObj.toLocaleDateString();
  };


  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Dropdown Panel */}
      <div 
        className="absolute right-4 top-16 w-96 max-w-[calc(100vw-2rem)] max-h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full max-h-[460px]">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Notifications</h2>
                  <p className="text-green-100 text-xs">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading notifications...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h3>
                <p className="text-gray-600 text-center mb-4">{error}</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No notifications yet</h3>
                <p className="text-xs text-gray-500 text-center">
                  You'll see important updates here
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        !notification.isRead ? 'border-l-4 border-l-blue-500 shadow-sm' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        if (!notification.isRead) markAsRead(notification.id);
                        if (notification.actionUrl) {
                          onClose();
                          navigate(notification.actionUrl);
                        }
                      }}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`p-1.5 rounded-lg ${
                              !notification.isRead ? 'bg-blue-50' : 'bg-gray-50'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className={`text-sm font-semibold truncate ${
                                    notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                                <p className={`text-xs line-clamp-2 mb-1.5 ${
                                  notification.isRead ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(notification.createdAt)}
                                  </div>
                                  {notification.propertyName && (
                                    <div className="flex items-center gap-1 truncate">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{notification.propertyName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                                    title="Mark as read"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            {notification.actionRequired === true && notification.actionUrl && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-between text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                    navigate(notification.actionUrl!);
                                  }}
                                >
                                  <span>Take Action</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAll}
                className="w-full justify-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50"
              >
                View All Notifications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
