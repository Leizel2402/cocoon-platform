import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info, 
  Home, 
  FileText,
  Wrench,
  Search,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Trash,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteMultipleNotifications,
    deleteAllNotifications,
    refetch
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'property_deleted':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'application_cancelled':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'application_approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'application_rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'application_submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance_cancelled':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'maintenance_created':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance_resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'listing_removed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

  // Handle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Handle single delete confirmation
  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setShowDeleteConfirm(true);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteClick = () => {
    if (selectedNotifications.length > 0) {
      setShowBulkDeleteConfirm(true);
    }
  };

  // Confirm single delete
  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteNotification(notificationToDelete);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setNotificationToDelete(null);
    }
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    setIsDeleting(true);
    try {
      await deleteMultipleNotifications(selectedNotifications);
      setSelectedNotifications([]);
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  // Cancel delete operations
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setShowBulkDeleteConfirm(false);
    setNotificationToDelete(null);
  };

  // Handle refresh with cleanup
  const handleRefresh = async () => {
    // Clear selections and reset filters
    setSelectedNotifications([]);
    setSearchTerm('');
    setFilter('all');
    
    // Fetch fresh data
    await refetch();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) || 
      (filter === 'read' && notification.isRead);
    
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Notifications</h3>
          <p className="text-gray-600">Please wait while we fetch your notifications...</p>
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
              <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                size="sm"
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-sm text-green-50">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-semibold transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  variant="outline"
                  className=" bg-white text-red-600 hover:bg-red-50 font-semibold transition-all duration-200 shadow-lg"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Notifications</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Unread</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {unreadCount}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Read</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">This Week</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {notifications.filter(n => {
                    const date = n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt.seconds * 1000);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date > weekAgo;
                  }).length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200 w-full"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'read', label: 'Read', count: notifications.length - unreadCount }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption.key as 'all' | 'unread' | 'read')}
                  className={`text-xs sm:text-sm ${filter === filterOption.key 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-gray-200 hover:bg-green-50 text-gray-700"
                  }`}
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>

            {/* Bulk Actions */}
            {filteredNotifications.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="text-xs sm:text-sm border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedNotifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    className="text-xs sm:text-sm border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Selected ({selectedNotifications.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              {searchTerm ? 'No notifications found' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 text-sm sm:text-lg mb-4 sm:mb-8 max-w-md mx-auto px-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'You\'ll see important updates and notifications here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1 h-4 w-4 !text-green-600 focus:ring-blue-500 !border-green-300 rounded "
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-2 truncate">{notification.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 flex rounded-full text-xs font-semibold ${getNotificationTypeColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                            <span className="ml-1 capitalize">{notification.type.replace('_', ' ')}</span>
                          </span>
                          {!notification.isRead && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{notification.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 flex rounded-full text-xs font-semibold ${getNotificationTypeColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                                <span className="ml-1 capitalize">{notification.type.replace('_', ' ')}</span>
                              </span>
                              {!notification.isRead && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{notification.propertyName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 ml-4">
                        <div className="flex items-center justify-end mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-end">
                          {notification.isRead ? (
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-1"></div>
                          )}
                          <span>{notification.isRead ? 'Read' : 'Unread'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <Bell className="h-3 w-3 mr-1 inline" />
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-600 hover:text-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(notification.id)}
                        className="text-gray-600 hover:text-red-600"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <AnimatePresence>
        {/* Single Delete Confirmation */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Notification</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Bulk Delete Confirmation */}
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedNotifications.length > 0 ? 'Delete Selected Notifications' : 'Delete All Notifications'}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                {selectedNotifications.length > 0 
                  ? `Are you sure you want to delete ${selectedNotifications.length} selected notification${selectedNotifications.length > 1 ? 's' : ''}? This action cannot be undone.`
                  : 'Are you sure you want to delete all notifications? This action cannot be undone.'
                }
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={selectedNotifications.length > 0 ? confirmBulkDelete : () => {
                    setIsDeleting(true);
                    deleteAllNotifications().finally(() => setIsDeleting(false));
                    setShowBulkDeleteConfirm(false);
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {selectedNotifications.length > 0 ? 'Selected' : 'All'}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
