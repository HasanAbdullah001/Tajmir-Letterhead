import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { letterService, SavedLetter } from '../../services/LetterService';
import { loadLetterToLocalStorage } from '../../utils/letterSerializer';
import { TajmirPage } from '../canvas/TajmirPage';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const ViewerMode: React.FC = () => {
    const { letterId } = useParams<{ letterId: string }>();
    const [letter, setLetter] = useState<SavedLetter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const pagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (letterId) {
            loadLetter(letterId);
        }
    }, [letterId]);

    const loadLetter = async (id: string) => {
        try {
            const data = await letterService.getLetter(id);
            // Load the letter data into localStorage so TajmirPage can read it
            loadLetterToLocalStorage(data);
            setLetter(data);
        } catch (err) {
            setError('Letter not found or failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (!pagesRef.current || !letter) return;

        setExporting(true);
        try {
            const pages = pagesRef.current.querySelectorAll('.page-container');
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = 210;
                const pdfHeight = 297;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`${letter.letterName}.pdf`);
        } catch (err) {
            alert('Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-xl text-gray-600">Loading letter...</div>
            </div>
        );
    }

    if (error || !letter) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">{error || 'Letter not found'}</div>
                    <a href="/" className="text-blue-600 hover:underline">Go to Editor</a>
                </div>
            </div>
        );
    }

    // Mobile Zoom/Pan Logic
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Fit on Load
    useEffect(() => {
        const fitScreen = () => {
            if (window.innerWidth < 800) { // Mobile breakpoint
                const scale = (window.innerWidth - 32) / 794; // 794px is approx A4 width at 96dpi
                setZoom(scale);
            } else {
                setZoom(1);
            }
        };
        fitScreen();
        window.addEventListener('resize', fitScreen);
        return () => window.removeEventListener('resize', fitScreen);
    }, []);

    // Touch Zoom Logic (Pinch)
    const touchDist = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchDist.current = dist;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchDist.current !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = dist - touchDist.current;
            if (Math.abs(delta) > 5) {
                const newZoom = Math.max(0.2, Math.min(3.0, zoom + delta * 0.005));
                setZoom(newZoom);
                touchDist.current = dist;
            }
        }
    };

    const handleTouchEnd = () => {
        touchDist.current = null;
    };

    return (
        <div className="flex flex-col h-screen bg-[#333] overflow-hidden">
            {/* PDF Export Button - Bottom Right */}
            <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 disabled:opacity-50 z-50 flex items-center gap-2"
            >
                {exporting ? '⏳ Exporting...' : '📄 Save as PDF'}
            </button>

            {/* Pages Container */}
            <div
                className="flex-grow overflow-auto bg-[#525659] p-4 md:p-8 touch-pan-x touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={pagesRef}
                    className="flex flex-col items-center gap-8 origin-top-left transition-transform duration-100 ease-out"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    {letter.pages.map((page, index) => (
                        <div key={page.pageId} className="page-container shadow-2xl">
                            <TajmirPage
                                id={page.pageId}
                                pageNumber={index + 1}
                                zoom={zoom}
                                action={null}
                                margins={letter.margins || { top: 96, right: 96, bottom: 96, left: 96 }}
                                isActive={false}
                                onFocus={() => { }}
                                maxLines={29}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
