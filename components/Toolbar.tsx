import React, { useRef, useState } from 'react';
import {
  DocumentPlusIcon, // New
  PhotoIcon,
  ArrowDownTrayIcon,
  Square2StackIcon,
  ArrowsPointingOutIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon
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
  onMergePDF: (file: File) => void;
  onCopyImage: () => void;
  onNewPage: () => void;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  isProcessing: boolean;
  margins: Margins;
  onSetMargins: (m: Margins) => void;
  maxLines: number;
  onSetMaxLines: (lines: number) => void;
  onSaveLetter: () => void;
  onLetterList: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomReset,
  onExportPDF,
  onMergePDF,
  onCopyImage,
  onNewPage,
  onAddText,
  onAddImage,
  isProcessing,
  margins,
  onSetMargins,
  maxLines,
  onSetMaxLines,
  onSaveLetter,
  onLetterList
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
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
    // reset
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMergeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onMergePDF(e.target.files[0]);
    }
    if (mergeInputRef.current) mergeInputRef.current.value = '';
  };

  return (
    <div className="flex-shrink-0 bg-[#f3f4f6] border-b border-[#e5e7eb] shadow-sm z-50 flex flex-col no-print select-none relative">

      {/* Row 1: Main Actions */}
      <div className="flex flex-wrap items-center justify-between p-1.5 md:p-2 border-b border-gray-200 bg-white gap-2">

        {/* Left Group: File & Insert */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={onNewPage}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer"
            title="New Document"
          >
            <DocumentPlusIcon className="w-5 h-5 text-blue-600" />
            <span className="hidden lg:inline">New</span>
          </button>

          <button
            onClick={onSaveLetter}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs md:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 cursor-pointer"
            title="Save Letter to Cloud"
          >
            💾
            <span className="hidden lg:inline">Save</span>
          </button>

          <button
            onClick={onLetterList}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer"
            title="Letter List"
          >
            📋
            <span className="hidden lg:inline">Letters</span>
          </button>

          <div className="h-5 w-px bg-gray-300 mx-1 hidden md:block"></div>

          <button
            onClick={onAddText}
            className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 hover:bg-green-100 text-green-800 px-2 py-1.5 rounded-md text-xs font-semibold shadow-sm cursor-pointer"
            title="Add Text Block"
          >
            <span className="font-serif font-bold text-lg leading-none">T</span>
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="h-5 w-px bg-gray-300 mx-1 hidden md:block"></div>

          <button
            onClick={() => mergeInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 px-2 py-1.5 rounded-md text-xs font-semibold shadow-sm cursor-pointer"
            title="Merge PDF"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Square2StackIcon className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Merge</span>
          </button>
          <input
            ref={mergeInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleMergeUpload}
          />

          <button
            onClick={onExportPDF}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 px-2 py-1.5 rounded-md text-xs font-semibold shadow-sm cursor-pointer"
            title="Export PDF"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownTrayIcon className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Save PDF</span>
          </button>
        </div>

        {/* Right Group: Zoom & Margins */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Max Lines */}
          <div className="hidden xl:flex items-center gap-1 text-xs text-black bg-white px-2 py-1 rounded border border-gray-300 shadow-sm">
            <span className="font-semibold text-[10px] text-gray-500 uppercase">Lines:</span>
            <input
              type="number"
              value={maxLines}
              onChange={(e) => onSetMaxLines(parseInt(e.target.value) || 29)}
              className="w-10 p-0.5 border border-gray-300 rounded text-center outline-none bg-white text-black text-[10px]"
            />
          </div>

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
                  className="w-10 p-0.5 border border-gray-300 rounded text-center outline-none bg-white text-black text-[10px]"
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
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-0.5 text-xs text-black">
            <button onClick={onZoomOut} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 font-bold bg-white text-base cursor-pointer"><MinusIcon className="w-4 h-4" /></button>
            <button onClick={onZoomFit} className="flex px-1.5 h-7 items-center justify-center hover:bg-gray-100 rounded border border-gray-200 bg-white cursor-pointer text-[10px] sm:text-xs" title="Fit to Screen">
              <span className="sm:hidden"><ArrowsPointingOutIcon className="w-4 h-4" /></span>
              <span className="hidden sm:inline">Fit</span>
            </button>
            <button onClick={onZoomReset} className="px-1.5 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 text-gray-500 font-mono text-[10px] bg-white cursor-pointer">100%</button>
            <button onClick={onZoomIn} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 font-bold bg-white text-base cursor-pointer"><PlusIcon className="w-4 h-4" /></button>
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
                  className="w-12 p-1 border border-gray-300 rounded text-center outline-none bg-white text-black text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 2: Formatting - Condensed */}
      <div className="flex items-center px-2 py-1.5 gap-1.5 overflow-x-auto bg-[#f9fafb] no-scrollbar border-b border-gray-200">
        <select
          onChange={handleFontSizeChange}
          defaultValue="3"
          className="h-7 pl-1 pr-6 border border-gray-300 rounded text-xs text-gray-700 bg-white cursor-pointer w-20 md:w-24 focus:ring-1 focus:ring-blue-500 outline-none"
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
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold" title="Bold">B</button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 italic" title="Italic">I</button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700 underline" title="Underline">U</button>
        </div>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0"></div>

        <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 shadow-sm">
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyLeft'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyCenter'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyRight'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Right">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyFull'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Justify">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>

        <div className="w-px h-5 bg-gray-300 flex-shrink-0"></div>

        <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 shadow-sm">
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Bullets">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Numbers">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
