import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDown, DollarSign, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriceRangePopoverProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function PriceRangePopover({
  priceRange,
  onPriceRangeChange,
  min = 0,
  max = 10000,
  step = 100,
  className
}: PriceRangePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localRange, setLocalRange] = useState<[number, number]>(priceRange);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState({ x: 0, value: 0 });

  // Predefined price ranges for quick selection
  const quickRanges = [
    { label: "Budget", range: [0, 1000] as [number, number], icon: TrendingDown },
    { label: "Mid-range", range: [1000, 3000] as [number, number], icon: DollarSign },
    { label: "Premium", range: [3000, 5000] as [number, number], icon: TrendingUp },
    { label: "Luxury", range: [5000, 10000] as [number, number], icon: Zap },
  ];

  useEffect(() => {
    setLocalRange(priceRange);
  }, [priceRange]);

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const value = Math.round(min + percentage * (max - min));
    
    // Determine which handle is closer
    const minDistance = Math.abs(value - localRange[0]);
    const maxDistance = Math.abs(value - localRange[1]);
    
    if (minDistance < maxDistance) {
      const newMin = Math.min(value, localRange[1] - step);
      setLocalRange([newMin, localRange[1]]);
    } else {
      const newMax = Math.max(value, localRange[0] + step);
      setLocalRange([localRange[0], newMax]);
    }
  };

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handle);
    setDragStart({ x: e.clientX, value: localRange[handle === 'min' ? 0 : 1] });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaValue = Math.round((deltaX / rect.width) * (max - min));
    const newValue = Math.max(min, Math.min(max, dragStart.value + deltaValue));
    
    if (isDragging === 'min') {
      const newMin = Math.min(newValue, localRange[1] - step);
      setLocalRange([newMin, localRange[1]]);
    } else {
      const newMax = Math.max(newValue, localRange[0] + step);
      setLocalRange([localRange[0], newMax]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, localRange, handleMouseMove]);

  const handleInputChange = (index: 0 | 1, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    
    if (index === 0) {
      const newMin = Math.min(clampedValue, localRange[1] - step);
      setLocalRange([newMin, localRange[1]]);
    } else {
      const newMax = Math.max(clampedValue, localRange[0] + step);
      setLocalRange([localRange[0], newMax]);
    }
  };

  const handleQuickRange = (range: [number, number]) => {
    setLocalRange(range);
  };

  const handleApply = () => {
    onPriceRangeChange(localRange);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalRange([min, max]);
  };

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const getRangeLabel = () => {
    const range = localRange[1] - localRange[0];
    if (range <= 1000) return "Narrow Range";
    if (range <= 3000) return "Moderate Range";
    if (range <= 5000) return "Wide Range";
    return "Very Wide Range";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200",
            className
          )}
        >
          Price <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-6 bg-white border-2 border-gray-200 shadow-2xl rounded-xl z-50">
        <div className="space-y-6">
          {/* Header with Range Info */}
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800 text-lg">
              Price Range
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getRangeLabel()}
            </span>
          </div>

          {/* Quick Range Buttons */}
          {/* <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">Quick Select:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((quickRange, index) => {
                const Icon = quickRange.icon;
                const isActive = 
                  localRange[0] === quickRange.range[0] && 
                  localRange[1] === quickRange.range[1];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickRange(quickRange.range)}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200",
                      isActive
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{quickRange.label}</span>
                  </button>
                );
              })}
            </div>
          </div> */}

          {/* Current Range Display */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Current Range:</span>
              <span className="text-xs text-green-600 font-semibold">
                ${(localRange[1] - localRange[0]).toLocaleString()} range
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(localRange[0])}
                </div>
                <div className="text-xs text-gray-500">Min</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-green-200 rounded-full">
                  <div 
                    className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{
                      width: `${getPercentage(localRange[1]) - getPercentage(localRange[0])}%`,
                      marginLeft: `${getPercentage(localRange[0])}%`
                    }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(localRange[1])}
                </div>
                <div className="text-xs text-gray-500">Max</div>
              </div>
            </div>
          </div>

          {/* Interactive Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Adjust Range:</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newMin = Math.max(min, localRange[0] - step);
                    setLocalRange([newMin, localRange[1]]);
                  }}
                  disabled={localRange[0] <= min}
                  className="h-8 w-8 p-0 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newMax = Math.min(max, localRange[1] + step);
                    setLocalRange([localRange[0], newMax]);
                  }}
                  disabled={localRange[1] >= max}
                  className="h-8 w-8 p-0 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
                >
                  +
                </Button>
              </div>
            </div>
            
            <div 
              ref={sliderRef}
              className="relative h-3 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleSliderClick}
            >
              <div
                className="absolute h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                style={{
                  left: `${getPercentage(localRange[0])}%`,
                  width: `${getPercentage(localRange[1]) - getPercentage(localRange[0])}%`,
                }}
              />
              
              {/* Min Handle */}
              <div
                className="absolute w-6 h-6 bg-white border-3 border-green-500 rounded-full shadow-lg cursor-pointer transform -translate-y-1.5 hover:scale-110 transition-transform"
                style={{
                  left: `calc(${getPercentage(localRange[0])}% - 12px)`,
                }}
                onMouseDown={handleMouseDown('min')}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Max Handle */}
              <div
                className="absolute w-6 h-6 bg-white border-3 border-green-500 rounded-full shadow-lg cursor-pointer transform -translate-y-1.5 hover:scale-110 transition-transform"
                style={{
                  left: `calc(${getPercentage(localRange[1])}% - 12px)`,
                }}
                onMouseDown={handleMouseDown('max')}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </div>

          {/* Manual Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Min Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="0"
                  value={localRange[0]}
                  onChange={(e) => handleInputChange(0, e.target.value)}
                  className="h-10 pl-10 pr-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Max Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="10000"
                  value={localRange[1]}
                  onChange={(e) => handleInputChange(1, e.target.value)}
                  className="h-10 pl-10 pr-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-sm px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Reset
            </Button>
            <Button
              onClick={handleApply}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
