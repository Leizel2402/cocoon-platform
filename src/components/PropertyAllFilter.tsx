import React from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Search, X } from "lucide-react";
import { CalendarPopover } from "./CalendarPopover";

interface SearchFiltersProps {
  // Location and basic filters
  searchLocation: string;
  setSearchLocation: (value: string) => void;

  // Price filter
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;

  // Beds and baths
  selectedBeds: string[];
  setSelectedBeds: (value: string[]) => void;
  selectedBaths: string[];
  setSelectedBaths: (value: string[]) => void;

  // Home types
  selectedHomeTypes: string[];
  setSelectedHomeTypes: (value: string[]) => void;

  // Move in date
  moveInDate?: Date;
  setMoveInDate: (value: Date | undefined) => void;

  // Advanced filters
  selectedAmenities: string[];
  setSelectedAmenities: (value: string[]) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (value: string[]) => void;
  squareFootage: [number, number];
  setSquareFootage: (value: [number, number]) => void;
  yearBuilt: [number, number];
  setYearBuilt: (value: [number, number]) => void;
  showOnlyRentWise: boolean;
  setShowOnlyRentWise: (value: boolean) => void;

  // Control
  onClose?: () => void;
  showSearch?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchLocation,
  setSearchLocation,
  priceRange,
  setPriceRange,
  selectedBeds,
  setSelectedBeds,
  selectedBaths,
  setSelectedBaths,
  selectedHomeTypes,
  setSelectedHomeTypes,
  moveInDate,
  setMoveInDate,
  selectedAmenities,
  setSelectedAmenities,
  selectedFeatures,
  setSelectedFeatures,
  squareFootage,
  setSquareFootage,
  yearBuilt,
  setYearBuilt,
  showOnlyRentWise,
  setShowOnlyRentWise,
  onClose,
  showSearch = true,
}) => {
  // Filter options
  const bedOptions = ["Studio", "1", "2", "3", "4+"];
  const bathOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"];
  const homeTypeOptions = [
    "Apartment",
    "Condo",
    "Townhome",
    "House",
    "Loft",
    "Student Housing",
    "55+ Active Adult",
  ];

  const amenityOptions = [
    "Pool",
    "Gym",
    "Pet Friendly",
    "In Unit Laundry",
    "Parking",
    "Air Conditioning",
    "Dishwasher",
    "Walk-in Closets",
  ];
  const featureOptions = [
    "Hardwood Floors",
    "Updated Kitchen",
    "Balcony/Patio",
    "High Ceilings",
    "Fireplace",
    "Garden/Yard Access",
    "City Views",
    "Modern Appliances",
  ];

  const handleReset = () => {
    setPriceRange([500, 10000]);
    setSelectedBeds([]);
    setSelectedBaths([]);
    setSelectedHomeTypes([]);
    setMoveInDate(undefined);
    setSelectedAmenities([]);
    setSelectedFeatures([]);
    setSquareFootage([500, 3000]);
    setYearBuilt([1980, 2024]);
    setShowOnlyRentWise(false);
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm relative z-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Search Filters</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Location Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <Input
          placeholder="Enter a city, neighborhood, or address..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
      </div>

      <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-6">
        {/* Price Range */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Price Range</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                ${priceRange[0].toLocaleString()}
              </span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                ${priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000}
              min={500}
              step={100}
              className="w-full bg-blue-500 rounded-full h-3"
            />
          </div>
        </div>

        {/* Beds & Baths */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Beds & Baths</h4>
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-800 mb-2">
                Bedrooms
              </h5>
              <div className="flex flex-wrap gap-1">
                {bedOptions.map((bed) => (
                  <div key={bed} className="flex items-center space-x-1">
                    <Checkbox
                      id={`bed-${bed}`}
                      checked={selectedBeds.includes(bed)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBeds([...selectedBeds, bed]);
                        } else {
                          setSelectedBeds(
                            selectedBeds.filter((b) => b !== bed)
                          );
                        }
                      }}
                    />
                    <label htmlFor={`bed-${bed}`} className="text-xs">
                      {bed}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-800 mb-2">
                Bathrooms
              </h5>
              <div className="flex flex-wrap gap-1">
                {bathOptions.map((bath) => (
                  <div key={bath} className="flex items-center space-x-1">
                    <Checkbox
                      id={`bath-${bath}`}
                      checked={selectedBaths.includes(bath)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBaths([...selectedBaths, bath]);
                        } else {
                          setSelectedBaths(
                            selectedBaths.filter((b) => b !== bath)
                          );
                        }
                      }}
                    />
                    <label htmlFor={`bath-${bath}`} className="text-xs">
                      {bath}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Property Type</h4>
          <div className="space-y-2">
            {homeTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedHomeTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedHomeTypes([...selectedHomeTypes, type]);
                    } else {
                      setSelectedHomeTypes(
                        selectedHomeTypes.filter((t) => t !== type)
                      );
                    }
                  }}
                />
                <label htmlFor={`type-${type}`} className="text-sm">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Amenities</h4>
          <div className="space-y-2">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedAmenities([...selectedAmenities, amenity]);
                    } else {
                      setSelectedAmenities(
                        selectedAmenities.filter((a) => a !== amenity)
                      );
                    }
                  }}
                />
                <label htmlFor={`amenity-${amenity}`} className="text-sm">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Features</h4>
          <div className="space-y-2">
            {featureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFeatures([...selectedFeatures, feature]);
                    } else {
                      setSelectedFeatures(
                        selectedFeatures.filter((f) => f !== feature)
                      );
                    }
                  }}
                />
                <label htmlFor={`feature-${feature}`} className="text-sm">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Move In Date */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Move In Date</h4>
          <CalendarPopover
            selectedDate={moveInDate}
            onDateSelect={setMoveInDate}
            placeholder="Move-in Date"
            className="w-full justify-start text-left font-normal text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            disabled={(date) => date < new Date()}
          />
        </div>

        {/* Square Footage */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Square Footage</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{squareFootage[0]} sqft</span>
              <span>{squareFootage[1]} sqft</span>
            </div>
            <Slider
              value={squareFootage}
              onValueChange={setSquareFootage}
              max={3000}
              min={500}
              step={100}
              className="w-full bg-blue-500 rounded-full h-3"
            />
          </div>
        </div>

        {/* Year Built */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Year Built</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{yearBuilt[0]}</span>
              <span>{yearBuilt[1]}</span>
            </div>
            <Slider
              value={yearBuilt}
              onValueChange={setYearBuilt}
              max={2024}
              min={1980}
              step={5}
              className="w-full bg-blue-500 rounded-full h-3"
            />
          </div>
        </div>

        {/* RentWise Network */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Network</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rentwise-only"
              checked={showOnlyRentWise}
              onCheckedChange={(checked) => setShowOnlyRentWise(!!checked)}
            />
            <label htmlFor="rentwise-only" className="text-sm">
              RentWise Network Only
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 space-y-3 sm:space-y-0 sm:space-x-3">
        <Button
          variant="outline"
          onClick={handleReset}
          className="text-gray-600 border-gray-300 w-full sm:w-auto"
        >
          Reset Filters
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 w-full sm:w-auto">
          <Button
            variant="outline"
            className="text-blue-600 border-blue-300 bg-blue-50 w-full sm:w-auto"
          >
            ♡ Save Search
          </Button>

          {showSearch && (
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
