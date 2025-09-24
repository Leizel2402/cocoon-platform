// // DashboardMapWrapper.tsx
// import React, { useEffect, useState } from "react";
// import DashboardMap from "./DashboardMap";

// interface Property {
//   id: string | number;
//   name: string;
//   address: string;
//   priceRange: string;
//   beds: string;
//   rating: number;
//   coordinates: [number, number];
//   rent_amount?: number;
//   bedrooms?: number;
//   bathrooms?: number;
//   propertyType?: string;
//   isRentWiseNetwork?: boolean;
//   amenities?: string[];
//   image?: string;
// }

// interface PropertyMapProps {
//   properties: Property[];
//   isPrequalified?: boolean;
//   onPropertySelect?: (property: Property) => void;
//   language?: "EN" | "ES" | "FR" | "DE";
// }

// const DashboardMapWrapper: React.FC<PropertyMapProps> = (props) => {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     // Ensure the component is mounted on the client side
//     setMounted(true);
//   }, []);

//   // Show loading state until component is mounted
//   if (!mounted) {
//     return (
//       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center p-8 max-w-md">
//           <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-4">Loading Map</h3>
//           <p className="text-gray-600">Initializing interactive property map...</p>
//         </div>
//       </div>
//     );
//   }

//   return <DashboardMap {...props} />;
// };

// export default DashboardMapWrapper;

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = defaultIcon;

export default function DashboardMapWrapper() {
  // Example property data
  const properties = [
    { id: 1, name: "Luxury Apartment", lat: 40.73061, lng: -73.935242 },
    { id: 2, name: "Cozy Studio", lat: 40.741895, lng: -73.989308 },
    { id: 3, name: "Family Home", lat: 40.712776, lng: -74.005974 },
  ];

  return (
    <div className="w-full h-[500px]">
      <MapContainer
        center={[40.73061, -73.935242]} // Initial position
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap free tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show markers for properties */}
        {properties.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <h3 className="font-bold">{p.name}</h3>
              <p>Great rental option!</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

