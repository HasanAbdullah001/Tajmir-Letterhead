import React, { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  SparklesIcon,
  ScissorsIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

interface DraggableImageProps {
  id: number;
  src: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onRemove: (id: number) => void;
}

export const DraggableImage: React.FC<DraggableImageProps> = ({ id, src, initialX, initialY, zoom, onRemove }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: 200, height: 200 });
  const [processedSrc, setProcessedSrc] = useState(src);

  // Controls state
  const [showMagic, setShowMagic] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [crop, setCrop] = useState({ t: 0, r: 0, b: 0, l: 0 });
  const [lockAspect, setLockAspect] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const startDimRef = useRef<{ w: number, h: number, x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(new Image());

  // Initialize original image
  useEffect(() => {
    originalImageRef.current.src = src;
    originalImageRef.current.crossOrigin = "anonymous";
    // Auto-set aspect ratio?
    originalImageRef.current.onload = () => {
      const ar = originalImageRef.current.naturalWidth / originalImageRef.current.naturalHeight;
      if (ar) setSize(prev => ({ ...prev, height: prev.width / ar }));
    };
  }, [src]);

  // Process Image (Signature "Air" Mode)
  useEffect(() => {
    if (threshold === 0) {
      setProcessedSrc(src);
      return;
    }

    const img = originalImageRef.current;
    if (!img.complete) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Simple threshold algorithm
    const thresh = 255 - (threshold * 2.55);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > thresh) {
        data[i + 3] = 0; // Alpha = 0
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setProcessedSrc(canvas.toDataURL());

  }, [threshold, src]);

  // Dragging & Interaction Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;

      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      } else if (isResizing && startDimRef.current) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;

        let newWidth = Math.max(50, startDimRef.current.w + dx);
        let newHeight = Math.max(50, startDimRef.current.h + dy);

        if (lockAspect) {
          const ratio = startDimRef.current.w / startDimRef.current.h;
          // Use the larger delta to drive the size
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth / ratio;
          } else {
            newWidth = newHeight * ratio;
          }
        }

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current) return;

      if (isDragging || isResizing) {
        e.preventDefault();
      }

      const touch = e.touches[0];

      if (isDragging) {
        const dx = (touch.clientX - dragStartRef.current.x) / zoom;
        const dy = (touch.clientY - dragStartRef.current.y) / zoom;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      } else if (isResizing && startDimRef.current) {
        const dx = (touch.clientX - dragStartRef.current.x) / zoom;
        const dy = (touch.clientY - dragStartRef.current.y) / zoom;

        let newWidth = Math.max(50, startDimRef.current.w + dx);
        let newHeight = Math.max(50, startDimRef.current.h + dy);

        if (lockAspect) {
          const ratio = startDimRef.current.w / startDimRef.current.h;
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth / ratio;
          } else {
            newWidth = newHeight * ratio;
          }
        }

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragStartRef.current = null;
      startDimRef.current = null;
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.control-btn') && !target.closest('.tool-panel')) {
          setIsSelected(false);
          setShowMagic(false);
          setShowCrop(false);
        }
      }
    };

    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, zoom, lockAspect]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Handle High DPI
      const dpr = window.devicePixelRatio || 1;
      // We align canvas size to the container size
      // We need to measure the container or trust the css w/h?
      // Since size is controlled by 'size' state:
      canvas.width = size.width * zoom * dpr; // Actually canvas is inside the scaled container? 
      // Wait, 'size' is the CSS size. The canvas is w-full h-full.
      // We should use clientWidth from the element itself if possible, but it might be 0 if hidden?
      // Let's rely on 'size' state.

      // Best approach: set canvas dims to match natural image aspect or container aspect?
      // CSS handles display size. We set internal resolution.
      canvas.width = size.width * 2;
      canvas.height = size.height * 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const sx = w * (crop.l / 100);
      const sy = h * (crop.t / 100);
      const sw = w * (1 - (crop.l + crop.r) / 100);
      const sh = h * (1 - (crop.t + crop.b) / 100);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };
    img.src = processedSrc;
  }, [processedSrc, crop, size, zoom]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startDimRef.current = { w: size.width, h: size.height, x: position.x, y: position.y };
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    startDimRef.current = { w: size.width, h: size.height, x: position.x, y: position.y };
  };

  const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const showControls = isDragging || isResizing || isSelected;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: showControls ? 50 : 20, // Increased z-index
      }}
      className="group"
      onClick={handleContainerClick}
      onTouchStart={handleContainerClick}
    >
      {/* ============ CONTROLS TOOLBAR ============ */}
      {showControls && (
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex flex-col items-center no-print z-50">

          {/* Top Bar Buttons - Glassmorphism */}
          <div className="flex gap-2 bg-black/80 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/20">
            <button
              className="control-btn bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-full transition-all active:scale-95"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              title="Move"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </button>

            <div className="w-px bg-white/20 mx-0.5"></div>

            <button
              className={`control-btn p-2 rounded-full transition-all active:scale-95 ${showMagic ? 'bg-purple-500 text-white' : 'hover:bg-white/20 text-white'}`}
              onClick={(e) => { e.stopPropagation(); setShowMagic(!showMagic); setShowCrop(false); }}
              onTouchEnd={(e) => { e.stopPropagation(); setShowMagic(!showMagic); setShowCrop(false); }}
              title="Remove Background"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>

            <button
              className={`control-btn p-2 rounded-full transition-all active:scale-95 ${showCrop ? 'bg-green-500 text-white' : 'hover:bg-white/20 text-white'}`}
              onClick={(e) => { e.stopPropagation(); setShowCrop(!showCrop); setShowMagic(false); }}
              onTouchEnd={(e) => { e.stopPropagation(); setShowCrop(!showCrop); setShowMagic(false); }}
              title="Crop"
            >
              <ScissorsIcon className="w-5 h-5" />
            </button>

            <button
              className={`control-btn p-2 rounded-full transition-all active:scale-95 ${lockAspect ? 'bg-orange-500 text-white' : 'hover:bg-white/20 text-white'}`}
              onClick={(e) => { e.stopPropagation(); setLockAspect(!lockAspect); }}
              onTouchEnd={(e) => { e.stopPropagation(); setLockAspect(!lockAspect); }}
              title={lockAspect ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
            >
              {lockAspect ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
            </button>

            <div className="w-px bg-white/20 mx-0.5"></div>

            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              onTouchEnd={(e) => { e.stopPropagation(); onRemove(id); }}
              className="control-btn bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-all active:scale-95"
              title="Remove"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Panels (Below Toolar) */}
          {showMagic && (
            <div className="tool-panel mt-2 bg-black/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 w-56 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase mb-2 block">Remove White Background</label>
              <input
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="text-[10px] text-gray-400 text-right mt-1">{threshold}%</div>
            </div>
          )}

          {showCrop && (
            <div className="tool-panel mt-2 bg-black/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 grid grid-cols-2 gap-3 w-56 animate-in slide-in-from-top-2">
              <div className="col-span-2 text-[10px] font-bold text-gray-300 uppercase text-center border-b border-white/10 pb-1">Crop Image</div>

              {['Top', 'Bottom', 'Left', 'Right'].map((side) => (
                <div key={side} className="flex flex-col">
                  <label className="text-[9px] text-gray-400 mb-0.5">{side}</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={crop[side.toLowerCase()[0] as keyof typeof crop]}
                    onChange={e => setCrop({ ...crop, [side.toLowerCase()[0]]: Number(e.target.value) })}
                    className="bg-gray-800 border-none text-white rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Container with Crop Mask */}
      {/* Image Container - Using Canvas for correct PDF export of Crop */}
      <div
        className={`w-full h-full transition-all duration-200 ${showControls ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : 'hover:ring-1 hover:ring-blue-300/50'} overflow-hidden`}
      >
        <canvas
          ref={(c) => {
            if (!c) return;
            // Draw image with crop
            const img = new Image();
            img.onload = () => {
              c.width = c.clientWidth * 2; // High DPI
              c.height = c.clientHeight * 2;
              const ctx = c.getContext('2d');
              if (!ctx) return;

              const w = img.naturalWidth;
              const h = img.naturalHeight;

              // Calculate source rect based on crop percentages
              const sx = w * (crop.l / 100);
              const sy = h * (crop.t / 100);
              const sw = w * (1 - (crop.l + crop.r) / 100);
              const sh = h * (1 - (crop.t + crop.b) / 100);

              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
            };
            img.src = processedSrc; // This is the source (potentially magic-wanded)
          }}
          className="w-full h-full pointer-events-none select-none"
        />
      </div>

      {/* Resize Handle - Larger for Mobile */}
      {showControls && (
        <div
          className="absolute -bottom-3 -right-3 w-8 h-8 bg-blue-500 text-white cursor-nwse-resize z-50 rounded-full shadow-lg flex items-center justify-center no-print touch-manipulation border-2 border-white active:scale-110 transition-transform"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeTouchStart}
        >
          {/* Visual indicator */}
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};