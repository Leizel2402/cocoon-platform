import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Wrench, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/lable';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { MaintenanceRequest, maintenanceService } from '../../services/maintenanceService';
import { toast } from '../../hooks/use-toast';
import { motion } from 'framer-motion';

interface ScheduleMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest | null;
  onSchedule: () => void;
}

const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({
  open,
  onClose,
  maintenanceRequest,
  onSchedule,
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState<MaintenanceRequest['status']>('submitted');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form to initial state
  const resetForm = () => {
    setScheduledDate('');
    setScheduledTime('');
    setStatus('submitted');
    setNotes('');
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (maintenanceRequest) {
      setStatus(maintenanceRequest.status);
      setNotes(maintenanceRequest.notes || '');
      
      // Set current scheduled date if exists
      if (maintenanceRequest.scheduledDate) {
        const date = new Date(maintenanceRequest.scheduledDate);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
      }
    } else {
      // Reset form when no maintenance request is provided
      resetForm();
    }
  }, [maintenanceRequest]);

  // Reset form when modal is closed
  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSchedule = async () => {
    if (!maintenanceRequest?.id) return;

    if (!scheduledDate) {
      toast({
        title: "Date Required",
        description: "Please select a scheduled date.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const dateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}`);
      
      // Update the scheduled date
      await maintenanceService.updateMaintenanceRequestSchedule(
        maintenanceRequest.id,
        dateTime,
        notes
      );

      // If status is 'submitted', automatically change to 'in_progress' when scheduled
      const newStatus = maintenanceRequest.status === 'submitted' ? 'in_progress' : status;
      
      // Update status if changed (skip transition validation since we're scheduling)
      if (newStatus !== maintenanceRequest.status) {
        await maintenanceService.updateMaintenanceRequestStatus(
          maintenanceRequest.id,
          newStatus,
          notes,
          true // Skip validation since we just set the scheduledDate
        );
      }

      toast({
        title: "Scheduled Successfully",
        description: `Maintenance request scheduled for ${dateTime.toLocaleDateString()} at ${dateTime.toLocaleTimeString()}.`,
      });

      // Reset form after successful submission
      resetForm();
      onSchedule();
      onClose();
    } catch (error) {
      console.error('Error scheduling maintenance request:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule maintenance request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: MaintenanceRequest['status']) => {
    if (!maintenanceRequest?.id) return;

    setIsLoading(true);
    try {
      await maintenanceService.updateMaintenanceRequestStatus(
        maintenanceRequest.id,
        newStatus,
        notes
      );

      setStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus.replace('_', ' ')}.`,
      });

      // Reset form after status change
      resetForm();
      onSchedule();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const getPriorityColor = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'emergency':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!maintenanceRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-green-50 to-blue-50">
        <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white">
                  Schedule Maintenance
                </DialogTitle>
                <p className="text-green-100 text-lg">
                  Schedule and manage maintenance requests efficiently
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="space-y-6">
            {/* Request Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Issue Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Title:</span>
                          <p className="text-sm text-gray-900 font-medium">{maintenanceRequest.title}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Description:</span>
                          <p className="text-sm text-gray-900">{maintenanceRequest.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Classification</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Priority:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(maintenanceRequest.priority)}`}>
                            {maintenanceRequest.priority.charAt(0).toUpperCase() + maintenanceRequest.priority.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Category:</span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {maintenanceRequest.category.charAt(0).toUpperCase() + maintenanceRequest.category.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Unit:</span>
                          <span className="text-sm text-gray-900">{maintenanceRequest.unitNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scheduling Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Schedule & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate" className="text-sm font-semibold text-gray-700">
                        Scheduled Date *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime" className="text-sm font-semibold text-gray-700">
                        Scheduled Time
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                      Status
                    </Label>
                    <Select 
                      value={status} 
                      onValueChange={(value: MaintenanceRequest['status']) => setStatus(value)}
                      disabled={maintenanceRequest?.status === 'completed' || maintenanceRequest?.status === 'cancelled'}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Only show valid status transitions */}
                        {(() => {
                          const currentStatus = maintenanceRequest?.status || 'submitted';
                          const validNextStatuses: MaintenanceRequest['status'][] = 
                            currentStatus === 'submitted' 
                              ? ['in_progress', 'cancelled']
                              : currentStatus === 'in_progress'
                              ? ['completed', 'cancelled']
                              : [];
                          
                          // Always show current status + valid next statuses
                          const statusesToShow: MaintenanceRequest['status'][] = [
                            currentStatus,
                            ...validNextStatuses.filter(s => s !== currentStatus)
                          ];
                          
                          const statusOptions = [
                            { value: 'submitted' as const, label: 'Submitted', color: 'bg-yellow-500' },
                            { value: 'in_progress' as const, label: 'In Progress', color: 'bg-blue-500' },
                            { value: 'completed' as const, label: 'Completed', color: 'bg-green-500' },
                            { value: 'cancelled' as const, label: 'Cancelled', color: 'bg-gray-500' }
                          ];
                          
                          return statusOptions
                            .filter(opt => statusesToShow.includes(opt.value))
                            .map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${opt.color}`}></div>
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ));
                        })()}
                      </SelectContent>
                    </Select>
                    {(maintenanceRequest?.status === 'completed' || maintenanceRequest?.status === 'cancelled') && (
                      <p className="text-xs text-gray-500 mt-1">
                        This request is in a final state and cannot be changed. Status updates are disabled.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes or instructions for the maintenance team..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5 text-teal-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('in_progress')}
                      disabled={isLoading || status === 'in_progress'}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 h-10 px-4"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start Work
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('completed')}
                      disabled={isLoading || status === 'completed'}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 h-10 px-4"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={isLoading || status === 'cancelled'}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 h-10 px-4"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Cancel Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 bg-white/90 backdrop-blur-md px-6 py-4 border-t border-gray-200">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 h-11 border-gray-200 hover:border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSchedule} 
              disabled={isLoading || !scheduledDate}
              className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {isLoading ? 'Saving...' : 'Schedule & Update'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMaintenanceModal;
