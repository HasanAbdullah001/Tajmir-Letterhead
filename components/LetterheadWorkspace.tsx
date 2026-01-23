import React, { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { TajmirPage } from './TajmirPage';

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

  // Manage pages. Each page has a unique ID.
  // We initialize with one page if no saved state.
  const [pages, setPages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tajmir_doc_pages_list');
      return saved ? JSON.parse(saved) : [Date.now().toString()];
    } catch {
      return [Date.now().toString()];
    }
  });

  const [activePageId, setActivePageId] = useState<string>(pages[0]);

  useEffect(() => {
    localStorage.setItem('tajmir_doc_pages_list', JSON.stringify(pages));
  }, [pages]);

  // Expose the container ref to parent (App.tsx)
  useImperativeHandle(ref, () => containerRef.current!);

  const addPage = () => {
    const newId = Date.now().toString();
    setPages(prev => [...prev, newId]);
    setActivePageId(newId);
    // Scroll to new page after render?
    setTimeout(() => {
      const el = document.getElementById(`page-${newId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Listen to actions that might be global, e.g., "Add Page" button from toolbar?
  // Currently "New Page" in toolbar is "Reset". 
  // We might want to add a specific "Add Page" button in Toolbar later or handle it here.
  // For now, overflow triggers it.

  const handleOverflow = (pageId: string) => {
    // Only add a new page if the overflowing page is the last one
    if (pageId === pages[pages.length - 1]) {
      addPage();
    }
  };

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

  // Mobile Pinch Zoom Logic
  const touchDistanceRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - touchDistanceRef.current;

      if (Math.abs(delta) > 10) {
        const zoomDelta = delta * 0.005;
        onSetZoom(Math.max(0.2, Math.min(3.0, zoom + zoomDelta)));
        touchDistanceRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      id="zoom-container"
      className="flex-grow overflow-auto bg-[#404040] p-8 text-center touch-pan-y flex items-start justify-center"
      style={{
        backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Deselect logic
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px', // Visible gap between pages
          paddingBottom: '100px'
        }}
      >
        {pages.map((id, index) => (
          <div id={`page-${id}`} key={id} className="shadow-2xl ring-1 ring-black/10 relative group">
            {/* Remove Page Button - corner hover */}
            {pages.length > 1 && (
              <button
                onClick={() => {
                  if (confirm('Delete this page?')) {
                    setPages(prev => prev.filter(p => p !== id));
                    // If deleting active, move to previous
                    if (activePageId === id) {
                      setActivePageId(pages[Math.max(0, index - 1)]);
                    }
                  }
                }}
                className="absolute -right-12 top-0 bg-red-100 text-red-600 p-2 rounded-full shadow hover:bg-red-200 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity no-print z-50"
                title="Delete Page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}

            <TajmirPage
              id={id}
              pageNumber={index + 1}
              zoom={zoom}
              action={action}
              margins={margins}
              isActive={activePageId === id}
              onFocus={() => setActivePageId(id)}
              onContentOverflow={handleOverflow}
            />
          </div>
        ))}

        {/* Helper "Add Page" button at bottom of workspace */}
        <button
          onClick={addPage}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-colors mx-auto no-print"
        >
          + Add Page
        </button>
      </div>
    </div>
  );
});

LetterheadWorkspace.displayName = 'LetterheadWorkspace';