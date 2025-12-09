import React, { useRef, useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { LetterheadWorkspace } from './components/LetterheadWorkspace';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Toast } from './components/Toast';

export default function App() {
  const [zoom, setZoom] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Generic Action State used to communicate from Toolbar to Workspace
  const [action, setAction] = useState<{ type: string; payload?: any } | null>(null);
  
  // Margins in pixels (Default approx 25.4mm = 1 inch = 96px, adjusting to 96)
  // Load from LocalStorage if available
  const [margins, setMargins] = useState(() => {
    try {
      const saved = localStorage.getItem('tajmir_settings_margins');
      return saved ? JSON.parse(saved) : { top: 96, right: 96, bottom: 96, left: 96 };
    } catch (e) {
      return { top: 96, right: 96, bottom: 96, left: 96 };
    }
  });

  // Save margins when changed
  useEffect(() => {
    localStorage.setItem('tajmir_settings_margins', JSON.stringify(margins));
  }, [margins]);

  // Reference to the actual A4 DOM element
  const pageRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.2));
  const handleZoomReset = () => setZoom(1);
  const handleZoomFit = () => {
    const containerWidth = window.innerWidth;
    const fitScale = (containerWidth - 32) / 794; // 794px is roughly 210mm at 96dpi, -32 for padding
    setZoom(Math.min(Math.max(fitScale, 0.2), 2.0));
  };

  // Initial auto-fit for mobile/small screens
  useEffect(() => {
    if (window.innerWidth < 1024) {
      handleZoomFit();
    }
  }, []);

  const handleAddText = () => {
    setAction({ type: 'ADD_TEXT', payload: Date.now() });
    showToast("Text block added");
  };

  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAction({ type: 'ADD_IMAGE', payload: e.target.result });
        showToast("Image added");
      }
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportPDF = async () => {
    if (!pageRef.current) return;
    setIsProcessing(true);
    
    // Store current zoom to restore later
    const originalZoom = zoom;
    
    try {
      // 1. Temporarily reset zoom to 1. 
      // html2canvas often calculates text positioning incorrectly if the source element 
      // or its parents are transformed (scaled). Resetting to 1:1 scale fixes overlapping text.
      setZoom(1);
      
      // Wait for React render + browser layout reflow
      await new Promise(resolve => setTimeout(resolve, 300));

      // 2. Capture canvas
      const canvas = await html2canvas(pageRef.current, {
        scale: 4, // Higher scale for better text quality
        useCORS: true,
        backgroundColor: '#fbfbfb',
        logging: false,
        onclone: (clonedDoc) => {
           // Ensure the cloned element is visible and clean
           const element = clonedDoc.querySelector('[data-html2canvas-ignore]');
           if (element) element.remove();
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.90);
      
      // 3. Generate PDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('tajmir-group-document.pdf');
      showToast("PDF Downloaded successfully");

    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF");
    } finally {
      // 4. Restore original zoom
      setZoom(originalZoom);
      setIsProcessing(false);
    }
  };

  const handleCopyImage = async () => {
    if (!pageRef.current) return;
    setIsProcessing(true);
    const originalZoom = zoom;

    try {
      // Same zoom fix for image copy to ensure high quality
      setZoom(1);
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(pageRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fbfbfb'
      });
      
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas is empty");
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          showToast("Copied to clipboard!");
        }).catch(() => {
          showToast("Clipboard write failed (browser limitation)");
        });
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to copy image");
    } finally {
      setZoom(originalZoom);
      setIsProcessing(false);
    }
  };

  const handleNewPage = () => {
    if (confirm("Are you sure? This will remove all text and images and reset the document.")) {
      // Clear all document content from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('tajmir_doc_')) {
          localStorage.removeItem(key);
        }
      });
      // Note: We do NOT clear 'tajmir_settings_' (like margins) as per typical user expectation,
      // but if the user wants a full hard reset, they can clear browser data.
      // The prompt asked to "remember the previous input tax and settings used" on reload,
      // but "New" usually implies clearing the doc.
      window.location.reload(); 
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#333] overflow-hidden font-sans">
      <Toolbar 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onZoomReset={handleZoomReset}
        onExportPDF={handleExportPDF}
        onCopyImage={handleCopyImage}
        onNewPage={handleNewPage}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        isProcessing={isProcessing}
        margins={margins}
        onSetMargins={setMargins}
      />
      
      <LetterheadWorkspace 
        zoom={zoom} 
        ref={pageRef}
        onSetZoom={setZoom}
        action={action}
        margins={margins}
      />

      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}