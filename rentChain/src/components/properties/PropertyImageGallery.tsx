// src/components/properties/PropertyImageGallery.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { PropertyImage } from '@/types/property.types';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  onDelete?: (imageId: number) => void;
  canDelete?: boolean;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  onDelete,
  canDelete = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalImageRef = useRef<HTMLImageElement>(null);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    resetZoom();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      setPan({ x: newPanX, y: newPanY });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
      case 'Escape':
        e.preventDefault();
        closeModal();
        break;
      case '+':
      case '=':
        e.preventDefault();
        zoomIn();
        break;
      case '-':
        e.preventDefault();
        zoomOut();
        break;
      case '0':
        e.preventDefault();
        resetZoom();
        break;
    }
  };

  React.useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div className="relative w-full h-170 bg-gray-100 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(selectedIndex)}>
          <img
            src={images[selectedIndex].imageUrl}
            alt={images[selectedIndex].caption || `Property image ${selectedIndex + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 dark:bg-white/20 dark:text-foreground dark:hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 dark:bg-white/20 dark:text-foreground dark:hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Delete Button */}
          {canDelete && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(images[selectedIndex].id);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Click to zoom hint */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs dark:bg-white/20 dark:text-foreground">
            Click to zoom
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => openModal(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer hover:scale-105 transition-transform ${
                  index === selectedIndex ? 'border-primary' : 'border-border'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={image.caption || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm dark:bg-white/20 dark:text-foreground">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeModal}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={zoomIn}
              disabled={zoom >= 5}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={resetZoom}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative max-w-full max-h-full overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: zoom > 1 ? 'move' : 'default' }}
          >
            <img
              ref={modalImageRef}
              src={images[selectedIndex].imageUrl}
              alt={images[selectedIndex].caption || `Property image ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                transformOrigin: 'center center',
              }}
              draggable={false}
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium">
                {selectedIndex + 1} of {images.length}
              </div>
              {images[selectedIndex].caption && (
                <div className="text-xs text-gray-300 mt-1">
                  {images[selectedIndex].caption}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Use mouse wheel to zoom • Drag to pan • Arrow keys to navigate • Esc to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};