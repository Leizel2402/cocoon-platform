import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface UserNotification {
  id: string;
  userId: string;
  type: 'property_deleted' | 'application_cancelled' | 'application_approved' | 'application_rejected' | 'application_submitted' | 'maintenance_cancelled' | 'maintenance_created' | 'maintenance_resolved' | 'listing_removed' | 'new_application' | 'new_maintenance_request' | 'new_subscription' | 'property_viewed' | 'application_withdrawn' | 'maintenance_updated' | 'payment_received' | 'payment_failed';
  title: string;
  message: string;
  propertyId: string;
  propertyName: string;
  isRead: boolean;
  createdAt: Date | { seconds: number; nanoseconds: number };
  actionRequired?: boolean;
  actionUrl?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications for the current user
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(notificationsQuery);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserNotification[];

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Update all unread notifications in batch
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true
        })
      );

      await Promise.all(updatePromises);

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user?.uid, notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'notifications', notificationId));
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  }, [notifications]);

  // Delete multiple notifications
  const deleteMultipleNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      // Delete from Firebase in batch
      const deletePromises = notificationIds.map(id => deleteDoc(doc(db, 'notifications', id)));
      await Promise.all(deletePromises);
      
      // Update local state
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      setUnreadCount(prev => {
        const deletedUnreadCount = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.isRead
        ).length;
        return Math.max(0, prev - deletedUnreadCount);
      });
    } catch (err) {
      console.error('Error deleting notifications:', err);
      setError('Failed to delete notifications');
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      const allNotificationIds = notifications.map(n => n.id);
      await deleteMultipleNotifications(allNotificationIds);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      setError('Failed to delete all notifications');
    }
  }, [notifications, deleteMultipleNotifications]);

  // Set up real-time listener
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserNotification[];

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    }, (err) => {
      console.error('Error in notifications listener:', err);
      setError('Failed to load notifications');
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultipleNotifications,
    deleteAllNotifications,
    refetch: fetchNotifications
  };
}
