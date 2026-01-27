import React, { useState } from 'react';

interface SaveLetterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (letterName: string) => void;
    isSaving: boolean;
}

export const SaveLetterDialog: React.FC<SaveLetterDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    isSaving
}) => {
    const [letterName, setLetterName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (letterName.trim()) {
            onSave(letterName.trim());
            setLetterName('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && letterName.trim()) {
            handleSave();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Save Letter</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Letter Name
                    </label>
                    <input
                        type="text"
                        value={letterName}
                        onChange={(e) => setLetterName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., Client Proposal - ABC Corp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        disabled={isSaving}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!letterName.trim() || isSaving}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};
