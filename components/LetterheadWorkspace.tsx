import React, { forwardRef, useEffect, useRef } from 'react';
import { TajmirTemplate } from './TajmirTemplate';

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface WorkspaceProps {
  zoom: number;
  action: { type: string; payload?: any } | null;
  onSetZoom: (z: number) => void;
  margins: Margins;
}

export const LetterheadWorkspace = forwardRef<HTMLDivElement, WorkspaceProps>(({ zoom, action, onSetZoom, margins }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pinch to zoom logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDistance: number | null = null;
    let initialZoom = zoom;

    const getDistance = (e: TouchEvent) => {
      return Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e);
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e);
        const scaleFactor = currentDistance / initialDistance;
        const newZoom = Math.min(Math.max(initialZoom * scaleFactor, 0.2), 3.0);
        onSetZoom(newZoom);
      }
    };

    const handleTouchEnd = () => {
      initialDistance = null;
    };

    // Wheel Zoom (Ctrl + Scroll)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(zoom + delta, 0.2), 3.0);
        onSetZoom(newZoom);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, onSetZoom]);

  return (
    <div 
      ref={containerRef}
      id="zoom-container"
      className="flex-grow overflow-auto bg-[#404040] p-8 text-center touch-none flex items-start justify-center"
      style={{
        backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <div 
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease-out'
        }}
        className="shadow-2xl inline-block ring-1 ring-black/10"
      >
        <TajmirTemplate ref={ref} zoom={zoom} action={action} margins={margins} />
      </div>
    </div>
  );
});

LetterheadWorkspace.displayName = 'LetterheadWorkspace';