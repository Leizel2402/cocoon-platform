import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserFilters {
  budget?: { min: number; max: number };
  location?: string[];
  bedrooms?: number;
  bathrooms?: number;
  pets?: boolean;
  petNames?: string[];
  lifestyle?: string[];
  timeline?: string;
  dealBreakers?: string[];
  musthaves?: string[];
  userName?: string;
  income?: number;
  creditScore?: string;
}

interface AddyChatProps {
  initialSearch?: string;
  onComplete?: (filters: UserFilters) => void;
}

export const AddyChat: React.FC<AddyChatProps> = ({ initialSearch, onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Auto-scroll to show new messages
    scrollToBottom();
    // Auto-focus input after messages update
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages]);


  useEffect(() => {
    if (initialSearch) {
      handleSendMessage(initialSearch);
    } else {
      // Start with a greeting
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi there! I'm Addy, and I'm here to help you find your perfect home. What kind of place are you looking for?",
        timestamp: new Date()
      }]);
    }
  }, [initialSearch]);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('addy-chat', {
        body: {
          messages: conversationMessages,
          userPreferences: userFilters
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update filters
      if (data.extractedFilters) {
        const newFilters = { ...userFilters, ...data.extractedFilters };
        setUserFilters(newFilters);
        
        // Update progress based on current filters and message count
        const newStep = calculateProgress(newFilters, messages.length + 2);
        setCurrentStep(newStep);
      }

      // Check if conversation is complete
      if (data.isComplete && data.nextAction === 'search') {
        setTimeout(() => {
          // Store filters in localStorage and navigate
          localStorage.setItem('housingFilters', JSON.stringify(data.extractedFilters));
          localStorage.setItem('searchLocation', data.extractedFilters.location?.[0] || 'Seattle');
          
          if (onComplete) {
            onComplete(data.extractedFilters);
          } else {
            navigate('/dashboard?view=dashboard');
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Can you try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue.trim());
    }
  };

  const handleSkipChat = () => {
    // Skip the chat and go directly to property search
    localStorage.setItem('searchLocation', initialSearch || 'Seattle');
    if (onComplete) {
      onComplete({ location: [initialSearch || 'Seattle'] });
    } else {
      navigate('/dashboard?view=dashboard');
    }
  };

  const handleQuickFilter = (filterType: string) => {
    const quickFilters = {
      budget: "I'm looking for something under $2000/month",
      location: "I want to live in a trendy neighborhood",
      pets: "I have a pet and need pet-friendly housing",
      timeline: "I need to move in within the next month"
    };
    
    const message = quickFilters[filterType as keyof typeof quickFilters];
    if (message) {
      handleSendMessage(message);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col w-full min-h-[300px] max-h-[350px] bg-white overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Addy</h3>
            <p className="text-sm text-gray-600">Your Housing Assistant</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkipChat}
          className="text-gray-500 hover:text-green-600 hover:bg-green-50 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
        >
          Skip
        </Button>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && !isLoading && (
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <p className="text-sm text-gray-600 mb-3 font-medium">Quick start:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('budget')}
              className="text-sm h-9 px-4 border border-gray-200 bg-white hover:bg-gradient-to-r hover:from-green-600   hover:to-emerald-600  text-white transition-all duration-200 rounded-lg font-medium"
            >
              💰 Budget-friendly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('pets')}
              className="text-sm h-9 px-4 border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 text-gray-700 hover:text-green-700 transition-all duration-200 rounded-lg font-medium"
            >
              🐾 Pet-friendly
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white chat-scrollbar"
        style={{
          maxHeight: '300px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#10b981 #f3f4f6'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start space-x-3 max-w-[60%]">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              )}
              <div className="flex flex-col">
                <div className={`rounded-lg px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                  <span className="text-sm text-gray-600">Addy is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full text-sm h-11 px-4 border border-gray-300 rounded-lg   bg-white transition-all duration-200"
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-blue-700 h-11 px-6 rounded-lg shadow-sm hover:shadow-md  transition-all duration-200 disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </form>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 font-medium">Progress</span>
          <span className="text-xs text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </div>
      </div>
   
  );
};