import React, { useRef, useState } from 'react';
import { 
  DocumentPlusIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  ListBulletIcon as ListNumberIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  ArrowsPointingInIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomReset: () => void;
  onExportPDF: () => void;
  onCopyImage: () => void;
  onNewPage: () => void;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  isProcessing: boolean;
  margins: Margins;
  onSetMargins: (m: Margins) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomReset,
  onExportPDF,
  onCopyImage,
  onNewPage,
  onAddText,
  onAddImage,
  isProcessing,
  margins,
  onSetMargins
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMobileMargins, setShowMobileMargins] = useState(false);

  const handleFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFormat('fontSize', e.target.value);
  };

  const handleMarginChange = (key: keyof Margins, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onSetMargins({ ...margins, [key]: num });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddImage(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const Btn = ({ 
    cmd, 
    arg, 
    icon: Icon, 
    title, 
    active = false 
  }: { 
    cmd: string, 
    arg?: string, 
    icon: React.ElementType, 
    title: string,
    active?: boolean 
  }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        handleFormat(cmd, arg);
      }}
      className={`p-1.5 md:p-2 rounded transition-colors cursor-pointer ${active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-700'}`}
      title={title}
      type="button"
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );

  return (
    <div className="flex-shrink-0 bg-[#f3f4f6] border-b border-[#e5e7eb] shadow-sm z-50 flex flex-col no-print select-none relative">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Row 1: Main Actions */}
      <div className="flex flex-wrap items-center justify-between p-1.5 md:p-2 border-b border-gray-200 bg-white gap-2">
        
        {/* Left Group: File & Insert */}
        <div className="flex items-center gap-1 md:gap-2">
           <button 
            onClick={onNewPage}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer"
            title="New Page"
          >
            <DocumentPlusIcon className="w-5 h-5 text-blue-600" />
            <span className="hidden lg:inline">New</span>
          </button>
          
          <div className="h-5 w-px bg-gray-300 mx-1 hidden md:block"></div>

           <button 
             onClick={onAddText}
             className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 hover:bg-green-100 text-green-800 px-2 py-1.5 rounded-md text-xs font-semibold shadow-sm cursor-pointer"
             title="Add Text"
           >
             <PencilSquareIcon className="w-5 h-5" />
             <span className="hidden sm:inline">Text</span>
           </button>
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center justify-center gap-1 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-800 px-2 py-1.5 rounded-md text-xs font-semibold shadow-sm cursor-pointer"
             title="Add Image"
           >
             <PhotoIcon className="w-5 h-5" />
             <span className="hidden sm:inline">Image</span>
           </button>

           <div className="h-5 w-px bg-gray-300 mx-1 hidden md:block"></div>

          <button 
            onClick={onExportPDF}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer"
            title="Export PDF"
          >
            <DocumentArrowDownIcon className="w-5 h-5 text-red-600" />
            <span className="hidden sm:inline">{isProcessing ? 'Saving...' : 'PDF'}</span>
          </button>
        </div>

        {/* Right Group: Zoom & Margins */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
           {/* Desktop Margins */}
           <div className="hidden xl:flex items-center gap-1 text-xs text-black bg-white px-2 py-1 rounded border border-gray-300 shadow-sm">
              <span className="font-semibold text-[10px] text-gray-500 uppercase">Margin:</span>
              {['top', 'right', 'bottom', 'left'].map((m) => (
                <div key={m} className="flex items-center">
                  <span className="text-[9px] text-gray-400 uppercase mr-0.5">{m[0]}</span>
                  <input 
                    type="number" 
                    value={margins[m as keyof Margins]} 
                    onChange={e => handleMarginChange(m as keyof Margins, e.target.value)} 
                    className="w-8 p-0.5 border border-gray-300 rounded text-center outline-none bg-white text-black text-[10px]" 
                  />
                </div>
              ))}
           </div>
           
           {/* Mobile Margins Toggle */}
           <button 
             onClick={() => setShowMobileMargins(!showMobileMargins)}
             className={`xl:hidden flex items-center justify-center p-1.5 rounded border ${showMobileMargins ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
             title="Margins"
           >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
           </button>

           <div className="flex items-center gap-0.5 text-xs text-black">
              <button onClick={onZoomOut} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 font-bold bg-white text-base cursor-pointer">-</button>
              <button onClick={onZoomFit} className="flex px-1.5 h-7 items-center justify-center hover:bg-gray-100 rounded border border-gray-200 bg-white cursor-pointer text-[10px] sm:text-xs" title="Fit to Screen">
                <span className="sm:hidden"><ArrowsPointingInIcon className="w-4 h-4"/></span>
                <span className="hidden sm:inline">Fit</span>
              </button>
              <button onClick={onZoomIn} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 font-bold bg-white text-base cursor-pointer">+</button>
           </div>
        </div>
      </div>

      {/* Mobile Margins Popover */}
      {showMobileMargins && (
        <div className="xl:hidden bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-center gap-4 animate-in slide-in-from-top-2">
            <span className="font-semibold text-xs text-gray-500 uppercase">Margins:</span>
            <div className="flex gap-2">
              {['top', 'right', 'bottom', 'left'].map((m) => (
                <div key={m} className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-400 uppercase mb-0.5">{m}</span>
                  <input 
                    type="number" 
                    value={margins[m as keyof Margins]} 
                    onChange={e => handleMarginChange(m as keyof Margins, e.target.value)} 
                    className="w-10 p-1 border border-gray-300 rounded text-center outline-none bg-white text-black text-xs" 
                  />
                </div>
              ))}
            </div>
        </div>
      )}

      {/* Row 2: Formatting - Condensed */}
      <div className="flex items-center px-2 py-1.5 gap-1.5 overflow-x-auto bg-[#f9fafb] no-scrollbar">
        <select 
          onChange={handleFontSizeChange} 
          defaultValue="3" 
          className="h-7 pl-1 pr-6 border border-gray-300 rounded text-xs text-gray-700 bg-white cursor-pointer w-20 md:w-24"
        >
          <option value="1">Tiny</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Medium</option>
          <option value="5">Large</option>
          <option value="6">XL</option>
          <option value="7">Huge</option>
        </select>

        <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 shadow-sm">
          <Btn cmd="bold" icon={BoldIcon} title="Bold" />
          <Btn cmd="italic" icon={ItalicIcon} title="Italic" />
          <Btn cmd="underline" icon={UnderlineIcon} title="Underline" />
        </div>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0"></div>

        <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 shadow-sm">
          <Btn cmd="justifyLeft" icon={Bars3BottomLeftIcon} title="Left" />
          <Btn cmd="justifyCenter" icon={Bars3Icon} title="Center" />
          <Btn cmd="justifyRight" icon={Bars3BottomRightIcon} title="Right" />
        </div>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0"></div>

        <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 shadow-sm">
          <Btn cmd="insertUnorderedList" icon={ListBulletIcon} title="Bullets" />
          <Btn cmd="insertOrderedList" icon={ListNumberIcon} title="Numbers" />
        </div>
      </div>
    </div>
  );
};