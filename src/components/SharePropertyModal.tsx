import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Mail, 
  Link, 
  MessageSquare, 
  X, 
  Share2,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/Button';

interface SharePropertyModalProps {
  property: {
    id: string | number;
    name: string;
    address: string;
    priceRange: string;
    rent_amount?: number;
    beds: string;
    bedrooms?: number;
    bathrooms?: number;
    rating: number;
    propertyType: string;
    amenities: string[];
    image: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const SharePropertyModal = ({ property, isOpen, onClose }: SharePropertyModalProps) => {
  const { toast } = useToast();

  const propertyUrl = `${window.location.origin}/property-details/${property.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to your clipboard.",
      });
      onClose();
    } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleEmailShare = () => {
    const subject = `Check out this property: ${property.name}`;
    const body = `Hi! I found this amazing property and thought you might be interested:

${property.name}
${property.address}
${property.priceRange}
${property.beds}
Rating: ${property.rating}/5

${property.amenities.length > 0 ? `Amenities: ${property.amenities.join(', ')}` : ''}

Let me know what you think!`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    toast({
      title: "Email opened",
      description: "Your email client should open with the property details.",
    });
    onClose();
  };

  const handleTextShare = () => {
    const message = `Check out this property: ${property.name} - ${property.address} - ${property.priceRange}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
    toast({
      title: "Text message opened",
      description: "Your messaging app should open with the property details.",
    });
    onClose();
  };

  const shareOptions = [
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      description: 'Send via email',
      onClick: handleEmailShare
    },
    {
      id: 'link',
      icon: Link,
      label: 'Copy link',
      description: 'Copy property link',
      onClick: handleCopyLink
    },
    {
      id: 'text',
      icon: MessageSquare,
      label: 'Text Message',
      description: 'Send via text',
      onClick: handleTextShare
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md mx-auto p-0 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Share2 className="h-5 w-5 text-white" />
              </motion.div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Share this home
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Property Preview */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <img
                src={property.image}
                alt={property.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                  {property.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-1">
                  {property.address}
                </p>
                <p className="text-sm font-bold text-green-600 mt-1">
                  {property.priceRange}
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <Home className="h-3 w-3 mr-1" />
                    {property.beds}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={option.onClick}
                  className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 group-hover:bg-blue-500 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePropertyModal;
