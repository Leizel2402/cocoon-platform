import { useState } from "react";
import { Search, Filter, X, MapPin } from "lucide-react";
import { SearchFilters } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  onSearch,
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const cities = [
    "San Francisco",
    "Austin",
    "New York",
    "Miami",
    "Boston",
    "Seattle",
    "Los Angeles",
    "Chicago",
    "Denver",
    "Atlanta",
    "Portland",
    "Dallas",
    "Houston",
    "Philadelphia",
    "Washington D.C.",
    "San Diego",
    "Aspen",
    "Orlando",
    "Nashville",
    "Charlotte",
    "Minneapolis",
    "Raleigh",
    "Salt Lake City",
    "Phoenix",
    "Ann Arbor",
    "Tampa",
    "Sacramento",
    "San Jose",
    "Columbus",
    "Cleveland",
    "Pittsburgh",
    "Richmond",
    "Louisville",
    "Indianapolis",
    "Kansas City",
    "Cincinnati",
    "Milwaukee",
    "St. Louis",
    "Jacksonville",
    "Memphis",
    "Oklahoma City",
    "New Orleans",
    "Albuquerque",
    "Buffalo",
    "Birmingham",
    "Des Moines",
    "Fresno",
    "Greensboro",
    "Huntsville",
    "Little Rock",
    "Omaha",
    "Reno",
    "Spokane",
    "Wichita",
    "Tulsa",
    "Anchorage",
    "Boise",
    "Charleston",
    "Chattanooga",
    "Durham",
    "Eugene",
    "Fayetteville",
    "Fort Collins",
    "Gainesville",
    "Harrisburg",
    "Irvine",
    "Jersey City",
    "Knoxville",
    "Lafayette",
    "Lansing",
    "Madison",
    "Naples",
    "Pensacola",
    "Quincy",
    "Rochester",
    "Salem",
    "Tallahassee",
    "Ventura",
    "Wilmington",
    "Yuma",
  ];

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);

    // Don’t overwrite filters.city unless explicitly chosen
    if (
      filters.city &&
      !value.toLowerCase().includes(filters.city.toLowerCase())
    ) {
      onFiltersChange({
        ...filters,
        city: "", // clear city if user typed something unrelated
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    const resetFilters: SearchFilters = {
      city: "",
      minRent: 0,
      maxRent: 10000,
      beds: 0,
      baths: 0,
    };
    onFiltersChange(resetFilters);
    onSearch(resetFilters); // 👈 trigger search with reset filters
    setShowFilters(false);
  };

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      keyword: searchTerm,
    };
    onFiltersChange(updatedFilters);
    onSearch(updatedFilters); // 👈 pass updated filters
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-50 p-2 rounded-lg">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            placeholder="Search by city, property name, or location..."
            className="w-full pl-16 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => {
                handleSearchTermChange("");
                const resetFilters = { ...filters, keyword: "", city: "" };
                onFiltersChange(resetFilters);
                onSearch(resetFilters); // 👈 trigger search after clearing
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border ${
              showFilters
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
            }`}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Search
          </motion.button>
        </div>
      </div>

      {/* City Filter Pills */}
      {searchTerm && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {cities
              .filter((city) =>
                city.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((city) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm(city);
                    onFiltersChange({
                      ...filters,
                      keyword: city, // 👈 search by keyword
                      city: city, // optional: still set city explicitly
                    });
                  }}
                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {city}
                </motion.button>
              ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200/50 pt-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Min Rent
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.minRent || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "minRent",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Max Rent
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.maxRent === 10000 ? "" : filters.maxRent}
                    onChange={(e) =>
                      handleFilterChange(
                        "maxRent",
                        parseInt(e.target.value) || 10000
                      )
                    }
                    placeholder="10,000"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Beds */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bedrooms
                </label>
                <select
                  value={filters.beds}
                  onChange={(e) =>
                    handleFilterChange("beds", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                >
                  <option value={0}>Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>
              </div>

              {/* Baths */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bathrooms
                </label>
                <select
                  value={filters.baths}
                  onChange={(e) =>
                    handleFilterChange("baths", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                >
                  <option value={0}>Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/50">
              <div className="text-sm text-gray-600">
                {filters.city && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 mr-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {filters.city}
                  </span>
                )}
                {(filters.minRent > 0 || filters.maxRent < 10000) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 mr-2">
                    ${filters.minRent.toLocaleString()} - $
                    {filters.maxRent.toLocaleString()}
                  </span>
                )}
                {filters.beds > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 mr-2">
                    {filters.beds}+ beds
                  </span>
                )}
                {filters.baths > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 mr-2">
                    {filters.baths}+ baths
                  </span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="flex items-center px-6 py-3 text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
