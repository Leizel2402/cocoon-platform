import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { MapPin, Bed, Bath, Calendar, Globe, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslations';
import { AddySearchBox } from '../components/AddySearch/AddySearchBox';
import { AddyChat } from '../components/AddyChat/Chat';
import heroImage from '@/assets/luxury-apartments-hero.jpg';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';

const PropertySearch = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'ES' | 'FR' | 'DE'>('EN');
  const [langOpen, setLangOpen] = useState(false);
  const [showAddyChat, setShowAddyChat] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const { t } = useTranslation(selectedLanguage);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      // Store search location and navigate to dashboard with dashboard view
      localStorage.setItem('searchLocation', searchLocation);
      navigate('/dashboard?view=dashboard');
    }
  };

  const featuredProperties = [
    {
      id: 1,
      image: property1,
      title: "Modern Downtown Loft",
      location: "Downtown District, Seattle",
      price: "$2,850",
      beds: 2,
      baths: 2,
      sqft: "1,200",
      available: "Available Now"
    },
    {
      id: 2,
      image: property2,
      title: "Luxury High-Rise Apartment",
      location: "Capitol Hill, Seattle",
      price: "$3,200",
      beds: 1,
      baths: 1,
      sqft: "850",
      available: "Dec 15"
    },
    {
      id: 3,
      image: property3,
      title: "Cozy Garden Apartment",
      location: "Fremont, Seattle",
      price: "$2,400",
      beds: 2,
      baths: 1,
      sqft: "1,050",
      available: "Jan 1"
    },
    {
      id: 4,
      image: property4,
      title: "Penthouse Suite",
      location: "Belltown, Seattle",
      price: "$4,500",
      beds: 3,
      baths: 2,
      sqft: "1,800",
      available: "Available Now"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Sticky Header - Same as Dashboard */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('back')}
              </Button>
              <div 
                className="text-3xl font-bold text-green-600 cursor-pointer hover:text-green-700"
                onClick={() => navigate('/')}
              >
                🏠 RentWise
              </div>
            </div>
            
            {/* Centered Prequalified Button */}
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold"
            >
              Get Prequalified
            </Button>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6">
                {/* Property Search Link - Points to current dashboard */}
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-muted"
                  onClick={() => navigate('/property-search')}
                >
                  Property Search
                </Button>
                
                {/* Language Selector - Subtle */}
                <Popover open={langOpen} onOpenChange={setLangOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-500 px-2">
                      <Globe className="h-4 w-4 mr-1" />
                      {selectedLanguage}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-2 bg-white border shadow-lg z-[60]">
                    <div className="space-y-1">
                      {(['EN', 'ES', 'FR', 'DE'] as const).map((lang) => (
                        <Button
                          key={lang}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left hover:bg-gray-100"
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setLangOpen(false);
                          }}
                        >
                          {lang === 'EN' && t('english')}
                          {lang === 'ES' && t('spanish')}
                          {lang === 'FR' && t('french')}
                          {lang === 'DE' && t('german')}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-muted"
                  onClick={() => {
                    localStorage.setItem('portal_context', 'manager');
                    navigate('/signin');
                  }}
                >
                  Manager Portal
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-muted"
                  onClick={() => {
                    localStorage.setItem('portal_context', 'renter');
                    navigate('/auth');
                  }}
                >
                  Renter Portal
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-muted"
                  onClick={() => navigate('/faq')}
                >
                  FAQs
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-muted"
                  onClick={() => navigate('/')}
                >
                  Sign In / Sign Up
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Beautiful apartment buildings" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Green line at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center text-center px-4">
          <div style={{ paddingTop: "12vh" }}>
            <h1 className="text-white mb-8" style={{ fontSize: "64px", fontWeight: "bold", lineHeight: "1.1" }}>
              Forget everything you know about Renting
            </h1>
          </div>
          <div style={{ paddingTop: "8vh", width: "100%", maxWidth: 900 }}>
            {!showAddyChat ? (
              <>
                <AddySearchBox onStartConversation={(q) => { setChatQuery(q); setShowAddyChat(true); }} />
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard?view=dashboard')}
                    className="text-white hover:text-green-200 text-sm underline"
                  >
                    Skip questions - Browse properties directly
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                  <AddyChat initialSearch={chatQuery} onComplete={(filters) => {
                    localStorage.setItem('housingFilters', JSON.stringify(filters));
                    navigate('/dashboard?view=dashboard');
                  }} />
                </div>
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard?view=dashboard')}
                    className="text-white hover:text-green-200 text-sm underline"
                  >
                    Skip remaining questions - Browse properties now
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-2">Featured Properties</h2>
            <p className="text-lg text-muted-foreground">Discover amazing places to call home</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {property.available}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-xl mb-2">{property.title}</h3>
                  <p className="text-muted-foreground text-lg mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl font-bold text-primary">
                      {property.price}<span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-lg text-muted-foreground">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.beds} bed{property.beds > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.baths} bath{property.baths > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {property.sqft} sqft
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;