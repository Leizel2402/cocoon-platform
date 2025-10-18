import React from 'react';
import { Button } from './ui/Button';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onImageSelect?: (index: number) => void;
  unitNumber?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrevious,
  onNext,
  onImageSelect,
  unitNumber = "Unit"
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];

  // Reset zoom and position when image changes
  React.useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onPrevious();
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onNext();
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.5, 3));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 0.5, 0.5));
          break;
        case '0':
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onPrevious, onNext]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    setZoom(newZoom);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `${unitNumber}-image-${currentIndex + 1}.jpg`;
    link.click();
  };


  if (!isOpen || !currentImage) {
    return null;
  }


  // Fallback modal if Dialog doesn't work
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">
                {unitNumber} - Image {currentIndex + 1} of {images.length}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newZoom = Math.max(zoom - 0.5, 0.5);
                    setZoom(newZoom);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newZoom = Math.min(zoom + 0.5, 3);
                    setZoom(newZoom);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="text-white hover:bg-white/20 ml-2"
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 bg-black/50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {currentIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 bg-black/50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </>
        )}

        {/* Image Container */}
        <div 
          className="flex items-center justify-center h-full w-full overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            key={currentIndex}
            src={currentImage}
            alt={`${unitNumber} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              transformOrigin: 'center center'
            }}
            draggable={false}
          />
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onImageSelect) {
                      onImageSelect(index);
                    }
                  }}
                  className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all duration-200 ${
                    index === currentIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:border-white/50 hover:scale-105'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="text-white/70 text-sm">
                Click thumbnails to navigate • {currentIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-white/70 text-xs">
          <p>Use mouse wheel to zoom • Drag to pan • Arrow keys to navigate • ESC to close</p>
        </div>
      </div>
    </div>
  );
};
