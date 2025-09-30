import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface RevenueCalculation {
  monthlyRevenue: number;
  totalProperties: number;
  occupiedUnits: number;
  averageRent: number;
  occupancyRate: number;
  revenueBreakdown: {
    rent: number;
    fees: number;
    other: number;
  };
}

// Calculate monthly revenue based on properties and applications
export const calculateMonthlyRevenue = async (landlordId?: string): Promise<RevenueCalculation> => {
  try {
    // Get all properties (you might want to filter by landlordId in the future)
    const propertiesResponse = await fetch('/data/properties.json');
    const properties = await propertiesResponse.json();
    
    // Get approved applications (these represent occupied units)
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('status', '==', 'approved'),
      orderBy('submittedAt', 'desc')
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const approvedApplications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate revenue metrics
    const totalProperties = properties.length;
    const occupiedUnits = approvedApplications.length;
    const occupancyRate = totalProperties > 0 ? (occupiedUnits / totalProperties) * 100 : 0;
    
    // Calculate average rent from properties
    const totalRent = properties.reduce((sum: number, property: any) => sum + (property.rent || 0), 0);
    const averageRent = totalProperties > 0 ? totalRent / totalProperties : 0;
    
    // Calculate monthly revenue
    // This is a simplified calculation - you can make it more complex
    const monthlyRevenue = occupiedUnits * averageRent;
    
    // Add some additional fees (10% of rent as management fees, utilities, etc.)
    const fees = monthlyRevenue * 0.1;
    const other = monthlyRevenue * 0.05; // Other income sources
    
    const revenueBreakdown = {
      rent: monthlyRevenue,
      fees: fees,
      other: other
    };

    return {
      monthlyRevenue: Math.round(monthlyRevenue + fees + other),
      totalProperties,
      occupiedUnits,
      averageRent: Math.round(averageRent),
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      revenueBreakdown
    };

  } catch (error) {
    console.error('Error calculating revenue:', error);
    
    // Return default values if calculation fails
    return {
      monthlyRevenue: 0,
      totalProperties: 0,
      occupiedUnits: 0,
      averageRent: 0,
      occupancyRate: 0,
      revenueBreakdown: {
        rent: 0,
        fees: 0,
        other: 0
      }
    };
  }
};

// Get revenue trends (monthly comparison)
export const getRevenueTrends = async (months: number = 6): Promise<Array<{month: string, revenue: number}>> => {
  try {
    // This would typically come from a more complex calculation
    // For now, we'll return mock data that simulates trends
    const trends = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Simulate revenue growth (you can replace this with real calculations)
      const baseRevenue = 35000;
      const growth = (months - i) * 0.05; // 5% growth each month
      const revenue = Math.round(baseRevenue * (1 + growth));
      
      trends.push({
        month: monthName,
        revenue: revenue
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error getting revenue trends:', error);
    return [];
  }
};

// Calculate revenue per property
export const getRevenuePerProperty = async (): Promise<Array<{propertyName: string, revenue: number, occupancy: boolean}>> => {
  try {
    const propertiesResponse = await fetch('/data/properties.json');
    const properties = await propertiesResponse.json();
    
    // Get approved applications to check occupancy
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('status', '==', 'approved')
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const approvedApplications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return properties.map((property: any) => {
      const isOccupied = approvedApplications.some(app => app.propertyId === property.id);
      return {
        propertyName: property.name || property.title || 'Unknown Property',
        revenue: isOccupied ? (property.rent || 0) : 0,
        occupancy: isOccupied
      };
    });
  } catch (error) {
    console.error('Error getting revenue per property:', error);
    return [];
  }
};
