import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Home,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function AddyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Addy, your AI rental assistant. I can help you find the perfect rental property, answer questions about the application process, and guide you through your rental journey. What can I help you with today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response (placeholder)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're looking for rental assistance. This is a placeholder response - the full Addy AI functionality will be implemented later with Firebase Cloud Functions and advanced AI capabilities.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Home, text: "Find Properties", action: "Show me available rental properties" },
    { icon: DollarSign, text: "Rent Budget", action: "Help me determine my rent budget" },
    { icon: MapPin, text: "Location", action: "What areas should I consider?" },
    { icon: Calendar, text: "Application", action: "How do I apply for a rental?" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg shadow-lg mr-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Chat with Addy AI
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Your intelligent rental assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Online
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Addy AI Assistant</h3>
                  <p className="text-white/80 text-sm">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/80 text-sm">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-xs lg:max-w-md ${message.isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 ${message.isUser ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isUser 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}>
                      {message.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInputText(action.action)}
                    className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <action.icon className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">{action.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Addy anything about rentals..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon: Advanced AI Features</h3>
            <p className="text-gray-600">Addy AI will be powered by Firebase Cloud Functions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h4>
              <p className="text-sm text-gray-600">AI-powered property matching based on your preferences</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Application Guidance</h4>
              <p className="text-sm text-gray-600">Step-by-step help with rental applications</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-sm text-gray-600">Always available to answer your rental questions</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
