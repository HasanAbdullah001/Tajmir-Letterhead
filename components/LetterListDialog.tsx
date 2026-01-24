import React, { useState, useEffect } from 'react';
import { letterService, LetterListItem } from '../services/LetterService';

interface LetterListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (letterId: string) => void;
}

export const LetterListDialog: React.FC<LetterListDialogProps> = ({
    isOpen,
    onClose,
    onLoad
}) => {
    const [letters, setLetters] = useState<LetterListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadLetters();
        }
    }, [isOpen]);

    const loadLetters = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await letterService.listLetters();
            setLetters(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        } catch (err) {
            setError('Failed to load letters. Make sure your Worker is deployed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete "${name}"?`)) {
            try {
                await letterService.deleteLetter(id);
                setLetters(letters.filter(l => l.id !== id));
            } catch (err) {
                alert('Failed to delete letter');
            }
        }
    };

    const copyShareLink = (id: string) => {
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        const link = `${appUrl}/view/${id}`;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Saved Letters</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8 text-gray-600">Loading...</div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && letters.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No saved letters yet. Create your first letter!
                    </div>
                )}

                {!loading && !error && letters.length > 0 && (
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated</th>
                                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {letters.map((letter) => (
                                    <tr key={letter.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => onLoad(letter.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-left"
                                            >
                                                {letter.name}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(letter.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => copyShareLink(letter.id)}
                                                className="text-green-600 hover:text-green-800 text-sm mr-3"
                                                title="Copy shareable link"
                                            >
                                                📋 Link
                                            </button>
                                            <button
                                                onClick={() => handleDelete(letter.id, letter.name)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 w-full"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
