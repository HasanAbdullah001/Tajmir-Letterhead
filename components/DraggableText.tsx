import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface DraggableTextProps {
  id: number;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: number) => void;
}

export const DraggableText: React.FC<DraggableTextProps> = ({ id, initialX, initialY, zoom, onRemove }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false); 
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus on mount
  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;

      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      e.preventDefault(); // Prevent scrolling
      
      const touch = e.touches[0];
      const dx = (touch.clientX - dragStartRef.current.x) / zoom;
      const dy = (touch.clientY - dragStartRef.current.y) / zoom;

      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
             const target = e.target as HTMLElement;
             if (!target.closest('.control-btn')) {
                 setIsSelected(false);
             }
        }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDragging, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setIsSelected(true);
  };

  const showControls = isHovered || isDragging || isSelected;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: '80%',
        zIndex: isDragging || showControls ? 50 : 10,
      }}
      className="group pb-2" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleContainerClick}
      onTouchStart={handleContainerClick}
    >
      {/* Controls Container */}
      {showControls && (
        <div className="absolute -top-9 left-0 right-0 flex justify-between items-end pb-1 no-print h-9 z-50">
          <div 
            className="control-btn bg-blue-600 text-white px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider cursor-grab active:cursor-grabbing flex items-center gap-1 shadow-md select-none touch-manipulation"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Move</span>
          </div>
          <button
            onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
            }}
            onTouchEnd={(e) => {
                e.stopPropagation();
                onRemove(id);
            }}
            className="control-btn bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 shadow-md transition-colors touch-manipulation"
            title="Remove text"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editable Content */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`outline-none min-w-[200px] min-h-[1.5em] p-2 border ${showControls ? 'border-dashed border-blue-400 bg-blue-50/10' : 'border-transparent'} transition-colors text-[#2c2c2c] font-serif text-[11pt] leading-relaxed whitespace-pre-wrap text-left empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
        data-placeholder="Type content here..."
      />
    </div>
  );
};