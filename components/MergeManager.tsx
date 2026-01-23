import React, { useState } from 'react';
import { XMarkIcon, DocumentDuplicateIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { PDFDocument } from 'pdf-lib';

interface MergeManagerProps {
    onClose: () => void;
    onMerge: (files: File[]) => void;
    initialFiles?: File[];
}

export const MergeManager: React.FC<MergeManagerProps> = ({ onClose, onMerge, initialFiles = [] }) => {
    const [files, setFiles] = useState<File[]>(initialFiles);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        setFiles(prev => {
            const newFiles = [...prev];
            [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
            return newFiles;
        });
    };

    const moveDown = (index: number) => {
        if (index === files.length - 1) return;
        setFiles(prev => {
            const newFiles = [...prev];
            [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
            return newFiles;
        });
    };

    const handleStartMerge = () => {
        if (files.length === 0) return;
        onMerge(files);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Merge with External PDFs</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-sm text-gray-500 mb-4">
                        Upload PDF files to append to your letterhead. Rearrange them as needed.
                        Your letterhead will be the <b>first page(s)</b>.
                    </p>

                    <div className="space-y-3">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 group hover:border-blue-300 transition-colors">
                                <DocumentDuplicateIcon className="w-8 h-8 text-blue-500/50" />
                                <div className="flex-grow min-w-0">
                                    <div className="text-sm font-medium text-gray-700 truncate">{file.name}</div>
                                    <div className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 hover:bg-white rounded"
                                    >
                                        <ArrowUpIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => moveDown(index)}
                                        disabled={index === files.length - 1}
                                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 hover:bg-white rounded"
                                    >
                                        <ArrowDownIcon className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {files.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-gray-400 text-sm">No files selected</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block w-full">
                            <span className="sr-only">Choose PDF files</span>
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                  "
                            />
                        </label>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">Cancel</button>
                    <button
                        onClick={handleStartMerge}
                        disabled={files.length === 0}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/30 text-sm font-bold disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                    >
                        Merge & Download
                    </button>
                </div>
            </div>
        </div>
    );
};
