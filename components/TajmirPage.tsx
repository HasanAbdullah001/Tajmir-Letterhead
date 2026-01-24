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
  const headerH1Ref = useRef<HTMLHeadingElement>(null);
  const headerH2Ref = useRef<HTMLHeadingElement>(null);
  const headerSubRef = useRef<HTMLParagraphElement>(null);
  const footerTitleRef = useRef<HTMLHeadingElement>(null);
  const footerAddr1Ref = useRef<HTMLParagraphElement>(null);
  const footerAddr2Ref = useRef<HTMLParagraphElement>(null);
  const footerPhoneRef = useRef<HTMLParagraphElement>(null);

  // Load Content from LocalStorage on Mount
  useEffect(() => {
    // We share the HEADER and FOOTER content across all pages (or typically letterhead is same)
    // BUT the Body is unique per page.
    const loadSharedContent = (key: string, ref: React.RefObject<HTMLElement | null>) => {
      // Shared content uses a generic key
      const saved = localStorage.getItem(key);
      if (saved && ref.current) {
        ref.current.innerHTML = saved;
      }
    };

    const loadPageContent = (key: string, ref: React.RefObject<HTMLElement | null>) => {
      // Page specific content
      const saved = localStorage.getItem(key);
      if (saved && ref.current) {
        ref.current.innerHTML = saved;
      }
    };

    // Shared Header/Footer
    loadSharedContent('tajmir_doc_header_h1', headerH1Ref);
    loadSharedContent('tajmir_doc_header_h2', headerH2Ref);
    loadSharedContent('tajmir_doc_header_sub', headerSubRef);
    loadSharedContent('tajmir_doc_footer_title', footerTitleRef);
    loadSharedContent('tajmir_doc_footer_addr1', footerAddr1Ref);
    loadSharedContent('tajmir_doc_footer_addr2', footerAddr2Ref);
    loadSharedContent('tajmir_doc_footer_phone', footerPhoneRef);

    // Unique Body for this page
    loadPageContent(`tajmir_doc_body_${id}`, bodyRef);

    // Load Draggables - keeping unique per page
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

    // If shared content changes, we might want to update other pages in real-time?
    // For now, let's keep it simple. LocalStorage update is enough for persistence.
    // Real-time sync across pages would require lifting state up, but contentEditable is hard to control.
  };

  // Auto-focus logic when page becomes active
  useEffect(() => {
    if (isActive && onFocus && bodyRef.current) {
      // Only focus if we are not already focused on something else in this page?
      // Or blindly focus body if nothing is focused?
      // We generally want to focus the body when entering a new page via auto-flow.
      // But we don't want to steal focus if user clicked a specific element.
      // Let's assume onFocus prop handles "setting active", but internal focus is separate.

      // Actually, if isActive is true, and it wasn't before, we might want to focus the body.
      // We can pass a prop like 'shouldFocusOnMount' or just check if it's empty?
      // Let's rely on user click for focus usually, but for Auto-flow (new page), we want to focus.

      // Strategy: If isActive is true, we don't force focus unless it's a new page?
      // Let's add a mechanism.
    }
  }, [isActive]);

  // Actually, we can just expose a method or rely on the parent logic.
  // But simpler: If the user is typing and hits overflow, parent adds page.
  // Parent sets new page as active.
  // If we detect we just became active and we are the last page (highest ID?), we could focus.
  // Let's keep it simple: `useEffect` with `isActive`.
  useEffect(() => {
    if (isActive && bodyRef.current) {
      // Focus at start if empty, or end? 
      // When flowing, we want start.
      bodyRef.current.focus();
    }
  }, [isActive]);

  const checkOverflow = () => {
    if (!bodyRef.current || !onContentOverflow) return;

    // Use a small delay to let the DOM update
    requestAnimationFrame(() => {
      if (!bodyRef.current) return;

      // 1. Physical Overflow - check if content is taller than container
      const isPhysicalOverflow = bodyRef.current.scrollHeight > bodyRef.current.clientHeight;

      // 2. Line Count Overflow
      const style = window.getComputedStyle(bodyRef.current);
      const lineHeight = parseFloat(style.lineHeight) || 16;
      const currentLines = Math.floor(bodyRef.current.scrollHeight / lineHeight);

      // Trigger overflow if EITHER condition is met
      if (isPhysicalOverflow || currentLines > maxLines) {
        onContentOverflow(id);
      }
    });
  };

  const handleBodyInput = (e: React.FormEvent<HTMLElement>) => {
    handleInput(`tajmir_doc_body_${id}`, e);
    // Debounce overflow check?
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
        <div className="flex items-center justify-end gap-5">

          {/* Logo - Reduced Size */}
          <div className="relative flex-shrink-0">
            <img
              src="https://tajmir-images.pages.dev/Logo%20black.png"
              alt="Tajmir Group"
              style={{ height: '70px', width: 'auto' }}
              className="object-contain"
              crossOrigin="anonymous"
            />
          </div>

          {/* Company Name & Subtext - Reduced Size */}
          <div className="text-left font-sans text-black flex flex-col justify-center">
            <h1
              ref={headerH1Ref}
              onInput={(e) => handleInput('tajmir_doc_header_h1', e, true)}
              contentEditable
              suppressContentEditableWarning
              className="font-serif font-bold text-2xl leading-none mb-1 outline-none border border-transparent hover:border-gray-200"
            >
              TAJMIR GLOBAL
            </h1>
            <h2
              ref={headerH2Ref}
              onInput={(e) => handleInput('tajmir_doc_header_h2', e, true)}
              contentEditable
              suppressContentEditableWarning
              className="text-lg font-normal tracking-wide leading-none mb-1 outline-none border border-transparent hover:border-gray-200"
            >
              CORPORATION
            </h2>
            <p
              ref={headerSubRef}
              onInput={(e) => handleInput('tajmir_doc_header_sub', e, true)}
              contentEditable
              suppressContentEditableWarning
              className="italic text-xs text-black outline-none border border-transparent hover:border-gray-200"
            >
              A Concern of Tajmir Group
            </p>
          </div>

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
    </div>
  );
});

TajmirPage.displayName = 'TajmirPage';
