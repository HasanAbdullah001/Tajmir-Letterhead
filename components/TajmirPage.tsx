import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { DraggableText } from './DraggableText';
import { DraggableImage } from './DraggableImage';

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface TajmirPageProps {
  id: string; // Unique Page ID
  pageNumber: number;
  zoom: number;
  action: { type: string; payload?: any } | null;
  margins: Margins;
  onContentOverflow?: (pageId: string) => void;
  isActive?: boolean;
  onFocus?: () => void;
  maxLines: number;
}

export const TajmirPage = forwardRef<HTMLDivElement, TajmirPageProps>(({
  id,
  pageNumber,
  zoom,
  action,
  margins,
  onContentOverflow,
  isActive,
  onFocus,
  maxLines
}, ref) => {
  // Draggable State - Local to each page for now
  const [textBlocks, setTextBlocks] = useState<Array<{ id: number, x: number, y: number, content?: string }>>([]);
  const [imageBlocks, setImageBlocks] = useState<Array<{ id: number, src: string, x: number, y: number, width?: number, height?: number, crop?: any }>>([]);

  // Refs for persistent content
  const bodyRef = useRef<HTMLDivElement>(null);

  // Footer Refs
  const footerTitleRef = useRef<HTMLHeadingElement>(null);
  const footerAddr1Ref = useRef<HTMLParagraphElement>(null);

  // Load Content from LocalStorage on Mount
  useEffect(() => {
    const loadSharedContent = (key: string, ref: React.RefObject<HTMLElement | null>) => {
      const saved = localStorage.getItem(key);
      if (saved && ref.current) {
        ref.current.innerHTML = saved;
      }
    };

    const loadPageContent = (key: string, ref: React.RefObject<HTMLElement | null>) => {
      const saved = localStorage.getItem(key);
      if (saved && ref.current) {
        ref.current.innerHTML = saved;
      }
    };

    // Shared Footer
    loadSharedContent('tajmir_doc_footer_title', footerTitleRef);
    loadSharedContent('tajmir_doc_footer_unified', footerAddr1Ref);

    // Unique Body for this page
    loadPageContent(`tajmir_doc_body_${id}`, bodyRef);

    // Load Draggables
    try {
      const savedTextBlocks = localStorage.getItem(`tajmir_doc_draggables_text_${id}`);
      if (savedTextBlocks) setTextBlocks(JSON.parse(savedTextBlocks));

      const savedImageBlocks = localStorage.getItem(`tajmir_doc_draggables_img_${id}`);
      if (savedImageBlocks) setImageBlocks(JSON.parse(savedImageBlocks));
    } catch (e) { console.error("Error loading blocks", e); }

  }, [id]);

  // Save Draggables when changed
  useEffect(() => {
    localStorage.setItem(`tajmir_doc_draggables_text_${id}`, JSON.stringify(textBlocks));
  }, [textBlocks, id]);

  useEffect(() => {
    localStorage.setItem(`tajmir_doc_draggables_img_${id}`, JSON.stringify(imageBlocks));
  }, [imageBlocks, id]);

  // Handle actions from App/Toolbar - ONLY IF ACTIVE PAGE
  useEffect(() => {
    if (!action || !isActive) return;

    if (action.type === 'ADD_TEXT') {
      const newId = Date.now();
      setTextBlocks(prev => [...prev, { id: newId, x: 50, y: 200 }]);
    }

    if (action.type === 'ADD_IMAGE' && action.payload) {
      const newId = Date.now();
      setImageBlocks(prev => [...prev, { id: newId, src: action.payload, x: 50, y: 200 }]);
    }
  }, [action, isActive]);

  const removeTextBlock = (id: number) => {
    setTextBlocks(prev => prev.filter(b => b.id !== id));
  };

  const removeImageBlock = (id: number) => {
    setImageBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateText = (id: number, data: any) => {
    setTextBlocks(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const handleUpdateImage = (id: number, data: any) => {
    setImageBlocks(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  // Helper to persist edits
  const handleInput = (key: string, e: React.FormEvent<HTMLElement>, isShared: boolean = false) => {
    const target = e.currentTarget;
    localStorage.setItem(key, target.innerHTML);
  };

  // Auto-focus logic
  useEffect(() => {
    if (isActive && bodyRef.current) {
      bodyRef.current.focus();
    }
  }, [isActive]);

  const checkOverflow = () => {
    if (!bodyRef.current || !onContentOverflow) return;
    requestAnimationFrame(() => {
      if (!bodyRef.current) return;
      const isPhysicalOverflow = bodyRef.current.scrollHeight > bodyRef.current.clientHeight;
      const style = window.getComputedStyle(bodyRef.current);
      const lineHeight = parseFloat(style.lineHeight) || 16;
      const currentLines = Math.floor(bodyRef.current.scrollHeight / lineHeight);
      if (isPhysicalOverflow || currentLines > maxLines) {
        onContentOverflow(id);
      }
    });
  };

  const handleBodyInput = (e: React.FormEvent<HTMLElement>) => {
    handleInput(`tajmir_doc_body_${id}`, e);
    checkOverflow();
  };

  return (
    <div
      ref={ref}
      className={`bg-white relative flex flex-col overflow-hidden shadow-lg transition-transform duration-200 ease-out origin-top ${isActive ? 'ring-2 ring-blue-400' : ''}`}
      style={{
        width: '210mm',
        height: '297mm',
        boxSizing: 'border-box',
        breakAfter: 'page'
      }}
      onClick={onFocus} // Valid
    >
      {/* ================= CORNER DESIGN (Top Left) ================= */}
      <div className="absolute top-0 left-0 z-0 pointer-events-none">
        <img
          src="https://tajmir-images.pages.dev/letter%20d.png"
          alt="Decorative Element"
          className="w-48 h-auto object-contain opacity-100"
          crossOrigin="anonymous"
        />
      </div>

      {/* ================= HEADER ================= */}
      <div className="pt-10 px-12 pb-2 relative z-10">
        <div className="flex items-center justify-end">
          <img
            src="/tajmir-header-new.png"
            alt="Tajmir Global Corporation"
            style={{ height: '90px', width: 'auto' }}
            className="object-contain"
            crossOrigin="anonymous"
          />
        </div>
      </div>

      {/* ================= BODY (Main Editor + Draggable Layers) ================= */}
      <div
        className="flex-grow relative flex flex-col z-10"
        style={{
          paddingTop: `${margins.top}px`,
          paddingRight: `${margins.right}px`,
          paddingBottom: `${margins.bottom}px`,
          paddingLeft: `${margins.left}px`
        }}
      >

        {/* Main Document Editor */}
        <div
          ref={bodyRef}
          onInput={handleBodyInput}
          className="w-full h-full outline-none font-serif text-[11pt] leading-relaxed text-[#2c2c2c] text-left empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          contentEditable
          suppressContentEditableWarning
          style={{
            whiteSpace: 'pre-wrap',
            overflow: 'hidden' // Hide scrollbars so we use clientHeight constraint
          }}
          data-placeholder={pageNumber === 1 ? "Start typing..." : ""}
        ></div>

        {/* Draggable Images Layer */}
        {imageBlocks.map(block => (
          <DraggableImage
            key={block.id}
            id={block.id}
            src={block.src}
            initialX={block.x}
            initialY={block.y}
            initialWidth={block.width}
            initialHeight={block.height}
            initialCrop={block.crop}
            zoom={zoom}
            onRemove={removeImageBlock}
            onUpdate={handleUpdateImage}
          />
        ))}

        {/* Draggable Text Blocks Layer */}
        {textBlocks.map(block => (
          <DraggableText
            key={block.id}
            id={block.id}
            initialX={block.x}
            initialY={block.y}
            initialContent={block.content}
            zoom={zoom}
            onRemove={removeTextBlock}
            onUpdate={handleUpdateText}
          />
        ))}

      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-auto relative w-full z-10 flex-shrink-0">

        {/* Footer Info Area - Shared content */}
        {/* Footer Info Area - Shared content */}
        <div className="pb-5 pt-2 text-center relative flex flex-col items-center">
          <p
            ref={footerTitleRef}
            onInput={(e) => handleInput('tajmir_doc_footer_title', e, true)}
            contentEditable
            suppressContentEditableWarning
            className="text-[9px] font-serif font-bold text-gray-600 leading-tight mb-0.5 outline-none border border-transparent hover:border-gray-200"
          >
            TAJMIR GLOBAL CORPORATION
          </p>
          <p
            ref={footerAddr1Ref}
            onInput={(e) => handleInput('tajmir_doc_footer_unified', e, true)}
            contentEditable
            suppressContentEditableWarning
            className="text-[9px] font-serif font-medium text-gray-600 leading-tight outline-none border border-transparent hover:border-gray-200 text-center px-8"
          >
            950/B, Yakub-Ayub Building Amir Market, Khatungonj, Chattogram, 01843601712 or 01755880400
          </p>
        </div>

        {/* Decorative Bottom Horizontal Strip - Pinned Absolute */}
        <div className="absolute bottom-0 left-0 w-full h-[12px] flex pointer-events-none">
          <div className="flex-1" style={{ backgroundColor: 'rgb(47, 91, 16)' }}></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(166, 138, 63)' }}></div>
          <div className="flex-1 bg-[#006400]"></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(166, 138, 63)' }}></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(47, 91, 16)' }}></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(166, 138, 63)' }}></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(0, 100, 0)' }}></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(166, 138, 63)' }}></div>
          <div className="flex-1" style={{ backgroundColor: 'rgb(47, 91, 16)' }}></div>
        </div>
      </div>
    </div >
  );
});

TajmirPage.displayName = 'TajmirPage';
