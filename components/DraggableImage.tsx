import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowsPointingOutIcon, 
  ArrowPathIcon,
  SparklesIcon,
  ScissorsIcon
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
  const [threshold, setThreshold] = useState(0); // 0 = no removal, 100 = aggressive
  const [crop, setCrop] = useState({ t: 0, r: 0, b: 0, l: 0 }); // Percentages

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

    // Simple threshold algorithm: If pixel is light enough, make it transparent
    const thresh = 255 - (threshold * 2.55); // Convert 0-100 slider to 255-0 range
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Brightness calculation
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
      if (isDragging && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
      
      if (isResizing && startDimRef.current && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        setSize({
          width: Math.max(50, startDimRef.current.w + dx),
          height: Math.max(50, startDimRef.current.h + dy)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragStartRef.current = null;
      startDimRef.current = null;
    };

    const handleClickOutside = (e: MouseEvent) => {
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
      window.addEventListener('mouseup', handleMouseUp);
    }
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', (e) => {
         // rudimentary touch click-outside
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
             const target = e.target as HTMLElement;
             if (!target.closest('.control-btn') && !target.closest('.tool-panel')) {
                 setIsSelected(false);
             }
        }
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDragging, isResizing, zoom]);

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
  
  const handleContainerClick = (e: React.MouseEvent) => {
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
        zIndex: isDragging || isResizing || showControls ? 40 : 10,
      }}
      className="group"
      onClick={handleContainerClick}
    >
      {/* ============ CONTROLS TOOLBAR ============ */}
      {showControls && (
        <div className="absolute -top-10 left-0 flex flex-col items-start no-print z-50">
           
           {/* Top Bar Buttons */}
           <div className="flex gap-1 bg-white p-1 rounded shadow-lg border border-gray-200">
             <button 
                className="control-btn bg-blue-600 text-white p-1.5 rounded text-xs cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                title="Move"
             >
                <ArrowsPointingOutIcon className="w-4 h-4" />
             </button>
             
             {/* Magic Wand (Remove Background) */}
             <button 
                className={`control-btn p-1.5 rounded text-xs transition-colors ${showMagic ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={(e) => { e.stopPropagation(); setShowMagic(!showMagic); setShowCrop(false); }}
                title="Remove Background (Air Signature)"
             >
                <SparklesIcon className="w-4 h-4" />
             </button>

             {/* Crop */}
             <button 
                className={`control-btn p-1.5 rounded text-xs transition-colors ${showCrop ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={(e) => { e.stopPropagation(); setShowCrop(!showCrop); setShowMagic(false); }}
                title="Crop"
             >
                <ScissorsIcon className="w-4 h-4" />
             </button>
           
             <div className="w-px bg-gray-300 mx-0.5"></div>

             <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="control-btn hover:bg-red-100 text-red-500 p-1.5 rounded transition-colors"
              title="Remove"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
           </div>

           {/* Magic Wand Panel */}
           {showMagic && (
              <div className="tool-panel mt-1 bg-white p-2 rounded shadow-lg border border-gray-200 flex flex-col gap-1 w-48">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Remove White Background</label>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={threshold} 
                   onChange={(e) => setThreshold(Number(e.target.value))}
                   className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                 />
                 <span className="text-[9px] text-gray-400 text-right">{threshold}%</span>
              </div>
           )}

           {/* Crop Panel */}
           {showCrop && (
              <div className="tool-panel mt-1 bg-white p-2 rounded shadow-lg border border-gray-200 grid grid-cols-2 gap-2 w-48">
                 <div className="col-span-2 text-[10px] font-bold text-gray-500 uppercase text-center border-b pb-1">Crop Image</div>
                 
                 <div className="flex flex-col">
                   <label className="text-[9px] text-gray-400">Top</label>
                   <input type="number" min="0" max="50" value={crop.t} onChange={e => setCrop({...crop, t: Number(e.target.value)})} className="border rounded px-1 text-xs w-full" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[9px] text-gray-400">Bottom</label>
                   <input type="number" min="0" max="50" value={crop.b} onChange={e => setCrop({...crop, b: Number(e.target.value)})} className="border rounded px-1 text-xs w-full" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[9px] text-gray-400">Left</label>
                   <input type="number" min="0" max="50" value={crop.l} onChange={e => setCrop({...crop, l: Number(e.target.value)})} className="border rounded px-1 text-xs w-full" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[9px] text-gray-400">Right</label>
                   <input type="number" min="0" max="50" value={crop.r} onChange={e => setCrop({...crop, r: Number(e.target.value)})} className="border rounded px-1 text-xs w-full" />
                 </div>
              </div>
           )}
        </div>
      )}

      {/* Image Container with Crop Mask */}
      <div 
        className={`w-full h-full border-2 ${showControls ? 'border-blue-400 border-dashed' : 'border-transparent'} bg-transparent overflow-hidden`}
        style={{
            // Apply crop via clip-path
            clipPath: `inset(${crop.t}% ${crop.r}% ${crop.b}% ${crop.l}%)`
        }}
      >
        <img 
          src={processedSrc} 
          alt="Asset" 
          className="w-full h-full pointer-events-none select-none object-fill"
        />
      </div>

      {/* Resize Handle */}
      {showControls && (
        <div 
          className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-nwse-resize z-50 rounded-tl shadow-md flex items-center justify-center no-print touch-manipulation"
          onMouseDown={handleResizeStart}
        >
          <ArrowPathIcon className="w-3 h-3 text-white transform rotate-90" />
        </div>
      )}
    </div>
  );
};