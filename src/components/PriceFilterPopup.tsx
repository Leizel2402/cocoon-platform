import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface PriceFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: [number, number];
  onApply: (minPrice: number, maxPrice: number) => void;
}

const PriceFilterPopup: React.FC<PriceFilterPopupProps> = ({
  isOpen,
  onClose,
  priceRange,
  onApply
}) => {
  const [minPrice, setMinPrice] = useState<number>(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState<number>(priceRange[1]);
  const [showMinDropdown, setShowMinDropdown] = useState(false);
  const [showMaxDropdown, setShowMaxDropdown] = useState(false);
  const [isMaxInputFocused, setIsMaxInputFocused] = useState(false);
  
  const popupRef = useRef<HTMLDivElement>(null);
  const minDropdownRef = useRef<HTMLDivElement>(null);
  const maxDropdownRef = useRef<HTMLDivElement>(null);

  // Predefined price options
  const priceOptions = [
    0, 500, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3500, 4000, 4500, 5000
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (minDropdownRef.current && !minDropdownRef.current.contains(event.target as Node)) {
        setShowMinDropdown(false);
      }
      if (maxDropdownRef.current && !maxDropdownRef.current.contains(event.target as Node)) {
        setShowMaxDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Update local state when priceRange prop changes
  useEffect(() => {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
  }, [priceRange]);

  const handleMinPriceSelect = (price: number) => {
    setMinPrice(price);
    setShowMinDropdown(false);
  };

  const handleMaxPriceSelect = (price: number) => {
    setMaxPrice(price);
    setShowMaxDropdown(false);
  };

  const handleApply = () => {
    onApply(minPrice, maxPrice);
    onClose();
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'No Min';
    return `$${price.toLocaleString()}`;
  };

  const formatMaxPrice = (price: number) => {
    return price.toLocaleString();
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setMaxPrice(0);
    } else {
      setMaxPrice(parseInt(value));
    }
  };

  const incrementMaxPrice = () => {
    setMaxPrice(prev => Math.min(prev + 100, 5000));
  };

  const decrementMaxPrice = () => {
    setMaxPrice(prev => Math.max(prev - 100, 0));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={popupRef}
        className="bg-white rounded-xl shadow-2xl p-6 w-80 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Price Range</h3>

        {/* Price Inputs */}
        <div className="space-y-4">
          {/* Minimum Price */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
            <div className="relative">
              <button
                onClick={() => setShowMinDropdown(!showMinDropdown)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-left text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {formatPrice(minPrice)}
              </button>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              {/* Minimum Dropdown */}
              {showMinDropdown && (
                <div 
                  ref={minDropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                >
                  {priceOptions.map((price) => (
                    <button
                      key={price}
                      onClick={() => handleMinPriceSelect(price)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        minPrice === price ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {formatPrice(price)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Maximum Price */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
            <div className="relative">
              <input
                type="text"
                value={formatMaxPrice(maxPrice)}
                onChange={handleMaxPriceChange}
                onFocus={() => {
                  setIsMaxInputFocused(true);
                  setShowMaxDropdown(false);
                }}
                onBlur={() => setIsMaxInputFocused(false)}
                className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isMaxInputFocused ? 'border-blue-500' : 'border-gray-300'
                }`}
                placeholder="Enter amount"
              />
              
              {/* Spinner Controls */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                <button
                  onClick={incrementMaxPrice}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={decrementMaxPrice}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Maximum Dropdown */}
              {showMaxDropdown && (
                <div 
                  ref={maxDropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                >
                  {priceOptions.map((price) => (
                    <button
                      key={price}
                      onClick={() => handleMaxPriceSelect(price)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        maxPrice === price ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      ${price.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-6">
          <button
            onClick={handleApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceFilterPopup;
