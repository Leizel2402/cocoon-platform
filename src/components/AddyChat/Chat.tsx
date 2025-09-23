import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Send, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  const [userFilters, setUserFilters] = useState<UserFilters>({});
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const calculateProgress = (filters: UserFilters, messageCount: number) => {
    let step = 0;
    
    // Step 0: Name provided
    if (filters.userName || messageCount >= 2) step = 1;
    
    // Step 1: Initial search description provided  
    if ((filters.location?.length || filters.budget || filters.bedrooms) && messageCount >= 4) step = 2;
    
    // Step 2: Pets information provided
    if (filters.pets !== undefined && messageCount >= 6) step = 3;
    
    // Step 3: Household details (income and credit) provided
    if (filters.income && filters.creditScore) step = 4;
    
    return step;
  };

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
    <div className="flex flex-col h-full max-h-[350px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg flex-shrink-0">
        <div>
          <h3 className="font-semibold text-gray-900 text-xl">Addy</h3>
          <p className="text-xs text-gray-500">Your Housing Assistant</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkipChat}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          Skip
        </Button>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && !isLoading && (
        <div className="p-3 border-b bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-600 mb-2 ml-8">Quick start:</p>
          <div className="flex flex-wrap gap-1 ml-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('budget')}
              className="text-xs h-6 px-2"
            >
              Budget-friendly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('pets')}
              className="text-xs h-6 px-2"
            >
              Pet-friendly
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px] max-h-[150px]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start space-x-2 max-w-[85%]">
              {message.role === 'assistant' && (
                <Avatar className="h-6 w-6 bg-green-100 flex-shrink-0">
                  <AvatarFallback className="text-green-700 text-xs">A</AvatarFallback>
                </Avatar>
              )}
              <div>
                <Card className={`${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <CardContent className="p-2">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
                <p className="text-xs text-gray-400 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <Avatar className="h-6 w-6 bg-green-100">
                <AvatarFallback className="text-green-700 text-xs">A</AvatarFallback>
              </Avatar>
              <Card className="bg-gray-100">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-gray-600">Typing...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex-shrink-0">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 text-sm h-8"
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 h-8 px-3"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </form>

      {/* Progress Bar - Moved below input */}
      <div className="px-3 py-2 bg-gray-50 flex-shrink-0 rounded-b-lg">
        <Progress value={(currentStep / 4) * 100} className="h-1" />
      </div>
    </div>
  );
};