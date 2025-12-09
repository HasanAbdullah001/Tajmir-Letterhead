import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { DraggableText } from './DraggableText';
import { DraggableImage } from './DraggableImage';

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface TajmirTemplateProps {
  zoom: number;
  action: { type: string; payload?: any } | null;
  margins: Margins;
}

export const TajmirTemplate = forwardRef<HTMLDivElement, TajmirTemplateProps>(({ zoom, action, margins }, ref) => {
  // Draggable State
  const [textBlocks, setTextBlocks] = useState<Array<{ id: number, x: number, y: number }>>([]);
  const [imageBlocks, setImageBlocks] = useState<Array<{ id: number, src: string, x: number, y: number }>>([]);
  
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
    const loadContent = (key: string, ref: React.RefObject<HTMLElement | null>) => {
      const saved = localStorage.getItem(key);
      if (saved && ref.current) {
        ref.current.innerHTML = saved;
      }
    };

    loadContent('tajmir_doc_main_body', bodyRef);
    loadContent('tajmir_doc_header_h1', headerH1Ref);
    loadContent('tajmir_doc_header_h2', headerH2Ref);
    loadContent('tajmir_doc_header_sub', headerSubRef);
    loadContent('tajmir_doc_footer_title', footerTitleRef);
    loadContent('tajmir_doc_footer_addr1', footerAddr1Ref);
    loadContent('tajmir_doc_footer_addr2', footerAddr2Ref);
    loadContent('tajmir_doc_footer_phone', footerPhoneRef);

    // Load Draggables
    try {
      const savedTextBlocks = localStorage.getItem('tajmir_doc_draggables_text');
      if (savedTextBlocks) setTextBlocks(JSON.parse(savedTextBlocks));
      
      const savedImageBlocks = localStorage.getItem('tajmir_doc_draggables_img');
      if (savedImageBlocks) setImageBlocks(JSON.parse(savedImageBlocks));
    } catch(e) { console.error("Error loading blocks", e); }

  }, []);

  // Save Draggables when changed
  useEffect(() => {
    localStorage.setItem('tajmir_doc_draggables_text', JSON.stringify(textBlocks));
  }, [textBlocks]);

  useEffect(() => {
    localStorage.setItem('tajmir_doc_draggables_img', JSON.stringify(imageBlocks));
  }, [imageBlocks]);

  // Handle actions from App/Toolbar
  useEffect(() => {
    if (!action) return;

    if (action.type === 'ADD_TEXT') {
      const newId = Date.now();
      setTextBlocks(prev => [...prev, { id: newId, x: 50, y: 200 }]);
    }

    if (action.type === 'ADD_IMAGE' && action.payload) {
      const newId = Date.now();
      setImageBlocks(prev => [...prev, { id: newId, src: action.payload, x: 50, y: 200 }]);
    }
  }, [action]);

  const removeTextBlock = (id: number) => {
    setTextBlocks(prev => prev.filter(b => b.id !== id));
  };

  const removeImageBlock = (id: number) => {
    setImageBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Helper to persist edits
  const handleInput = (key: string, e: React.FormEvent<HTMLElement>) => {
    const target = e.currentTarget;
    localStorage.setItem(key, target.innerHTML);
  };

  return (
    <div 
      ref={ref}
      className="bg-[#fbfbfb] relative flex flex-col overflow-hidden shadow-sm"
      style={{
        width: '210mm',
        height: '297mm',
        boxSizing: 'border-box'
      }}
    >
      {/* ================= CORNER DESIGN (Top Left) ================= */}
      <div className="absolute top-0 left-0 z-0 pointer-events-none">
        <img 
          src="https://tajmir-images.pages.dev/letter%20d.png" 
          alt="Decorative Element" 
          className="w-64 h-auto object-contain opacity-100" 
          crossOrigin="anonymous"
        />
      </div>

      {/* ================= HEADER ================= */}
      <div className="pt-12 px-12 pb-2 relative z-10">
        <div className="flex items-center justify-end gap-6">
           
           {/* Logo */}
           <div className="relative flex-shrink-0">
             <img 
                src="https://tajmir-images.pages.dev/Logo%20black.png" 
                alt="Tajmir Group" 
                style={{ height: '100px', width: 'auto' }}
                className="object-contain"
                crossOrigin="anonymous"
              />
           </div>

           {/* Company Name & Subtext - EDITABLE */}
           <div className="text-left font-sans text-black flex flex-col justify-center">
              <h1 
                ref={headerH1Ref}
                onInput={(e) => handleInput('tajmir_doc_header_h1', e)}
                contentEditable
                suppressContentEditableWarning
                className="font-bold text-4xl tracking-wide leading-none mb-1 outline-none border border-transparent hover:border-gray-200"
              >
                TAJMIR GLOBAL
              </h1>
              <h2 
                ref={headerH2Ref}
                onInput={(e) => handleInput('tajmir_doc_header_h2', e)}
                contentEditable
                suppressContentEditableWarning
                className="text-2xl font-normal tracking-wide leading-none mb-2 outline-none border border-transparent hover:border-gray-200"
              >
                CORPORATION
              </h2>
              <p 
                ref={headerSubRef}
                onInput={(e) => handleInput('tajmir_doc_header_sub', e)}
                contentEditable
                suppressContentEditableWarning
                className="italic text-sm text-black outline-none border border-transparent hover:border-gray-200"
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
          onInput={(e) => handleInput('tajmir_doc_main_body', e)}
          className="w-full h-full outline-none font-serif text-[11pt] leading-relaxed text-[#2c2c2c] text-left empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          contentEditable
          suppressContentEditableWarning
          style={{ 
            whiteSpace: 'pre-wrap',
            minHeight: '400px'
          }}
          data-placeholder=""
        ></div>

        {/* Draggable Images Layer */}
        {imageBlocks.map(block => (
          <DraggableImage 
            key={block.id} 
            id={block.id} 
            src={block.src}
            initialX={block.x} 
            initialY={block.y} 
            zoom={zoom}
            onRemove={removeImageBlock}
          />
        ))}

        {/* Draggable Text Blocks Layer */}
        {textBlocks.map(block => (
          <DraggableText 
            key={block.id} 
            id={block.id} 
            initialX={block.x} 
            initialY={block.y} 
            zoom={zoom}
            onRemove={removeTextBlock}
          />
        ))}

      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-auto relative w-full z-10">
         
         {/* Footer Info Area - EDITABLE */}
         <div className="pb-10 pt-4 text-center relative flex flex-col items-center">
            <h2 
              ref={footerTitleRef}
              onInput={(e) => handleInput('tajmir_doc_footer_title', e)}
              contentEditable
              suppressContentEditableWarning
              className="text-[#2c2c2c] font-bold text-lg tracking-[0.15em] mb-2 uppercase outline-none border border-transparent hover:border-gray-200"
            >
              Tajmir Global Corporation
            </h2>
            <div className="text-[10px] font-serif font-medium text-gray-600 leading-normal uppercase tracking-wider flex flex-col items-center">
              <p 
                ref={footerAddr1Ref}
                onInput={(e) => handleInput('tajmir_doc_footer_addr1', e)}
                contentEditable 
                suppressContentEditableWarning 
                className="outline-none border border-transparent hover:border-gray-200"
              >
                950/B, Yakub-Ayub Building,
              </p>
              <p 
                ref={footerAddr2Ref}
                onInput={(e) => handleInput('tajmir_doc_footer_addr2', e)}
                contentEditable 
                suppressContentEditableWarning 
                className="outline-none border border-transparent hover:border-gray-200"
              >
                Amir Market, Khatungonj, Chattogram.
              </p>
              <p 
                ref={footerPhoneRef}
                onInput={(e) => handleInput('tajmir_doc_footer_phone', e)}
                contentEditable 
                suppressContentEditableWarning 
                className="mt-1 text-black font-bold text-xs tracking-widest outline-none border border-transparent hover:border-gray-200"
              >
                01843601712, 01755880400
              </p>
            </div>
         </div>

         {/* Decorative Bottom Horizontal Strip */}
         <div className="absolute bottom-0 left-0 w-full h-[25px] flex pointer-events-none">
            {/* Pattern: Green -> Gold -> Green -> Gold -> Green */}
            <div className="flex-1 bg-[#006400]"></div>
            <div className="flex-1 bg-[#b8860b]"></div>
            <div className="flex-1 bg-[#006400]"></div>
            <div className="flex-1 bg-[#b8860b]"></div>
            <div className="flex-1 bg-[#006400]"></div>
         </div>
      </div>
    </div>
  );
});

TajmirTemplate.displayName = 'TajmirTemplate';