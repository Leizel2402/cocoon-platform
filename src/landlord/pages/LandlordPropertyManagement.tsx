import React, { useState } from 'react';
import PropertyForm from '../components/PropertyForm/PropertyForm';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Building, Plus, List, Settings, Users, DollarSign, TrendingUp } from 'lucide-react';

const LandlordPropertyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  // Mock data for demonstration
  const properties = [
    {
      id: '1',
      name: 'Downtown Apartments',
      address: '123 Main St, San Francisco, CA 94102',
      units: 12,
      occupied: 8,
      available: 4,
      totalRent: 45000,
      occupancyRate: 67
    },
    {
      id: '2',
      name: 'Garden View Complex',
      address: '456 Oak Ave, San Francisco, CA 94103',
      units: 8,
      occupied: 6,
      available: 2,
      totalRent: 32000,
      occupancyRate: 75
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'application',
      message: 'New application received for Unit 3A',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'maintenance',
      message: 'Maintenance request completed for Unit 5B',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'payment',
      message: 'Rent payment received from Unit 2C',
      time: '1 day ago',
      status: 'paid'
    }
  ];

  if (showPropertyForm) {
    return <PropertyForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600 mt-2">Manage your properties, units, and listings</p>
            </div>
            <Button
              onClick={() => setShowPropertyForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'properties', label: 'Properties', icon: Building },
              { id: 'units', label: 'Units', icon: List },
              { id: 'applications', label: 'Applications', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <List className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Units</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {properties.reduce((sum, p) => sum + p.units, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Occupied Units</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {properties.reduce((sum, p) => sum + p.occupied, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${properties.reduce((sum, p) => sum + p.totalRent, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Properties Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{property.name}</h3>
                          <p className="text-sm text-gray-600">{property.address}</p>
                          <p className="text-sm text-gray-500">
                            {property.occupied}/{property.units} units occupied ({property.occupancyRate}%)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${property.totalRent.toLocaleString()}/month
                          </p>
                          <p className="text-sm text-gray-500">
                            {property.available} available
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'pending' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Properties</h2>
              <Button onClick={() => setShowPropertyForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{property.name}</span>
                      <span className="text-sm font-normal text-gray-500">
                        {property.occupancyRate}% occupied
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{property.address}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Units</p>
                        <p className="font-semibold">{property.units}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Available</p>
                        <p className="font-semibold text-green-600">{property.available}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        ${property.totalRent.toLocaleString()}/mo
                      </span>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Units Tab */}
        {activeTab === 'units' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Units</h2>
              <Button onClick={() => setShowPropertyForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Unit management interface will be implemented here.
                  This will show all units across all properties with filtering and management options.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Applications</h2>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Application management interface will be implemented here.
                  This will show all rental applications with status tracking and review capabilities.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Settings</h2>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Landlord settings interface will be implemented here.
                  This will include account settings, notification preferences, and property management options.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordPropertyManagement;
