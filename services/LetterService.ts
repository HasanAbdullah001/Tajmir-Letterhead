// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface SavedLetter {
    letterId: string;
    letterName: string;
    createdAt: string;
    updatedAt: string;
    pages: Array<{
        pageId: string;
        bodyContent: string;
        textBlocks: Array<{
            id: number;
            x: number;
            y: number;
            content?: string;
        }>;
        imageBlocks: Array<{
            id: number;
            src: string;
            x: number;
            y: number;
        }>;
    }>;
    sharedContent: {
        header: {
            h1: string;
            h2: string;
            subtitle: string;
        };
        footer: {
            title: string;
            address: string;
        };
    };
}

export interface LetterListItem {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

class LetterService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_URL}/api/letters`;
    }

    async listLetters(): Promise<LetterListItem[]> {
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch letters');
        }
        return response.json();
    }

    async getLetter(id: string): Promise<SavedLetter> {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) {
            throw new Error('Letter not found');
        }
        return response.json();
    }

    async saveLetter(letter: Omit<SavedLetter, 'letterId' | 'createdAt' | 'updatedAt'>): Promise<SavedLetter> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(letter),
        });
        if (!response.ok) {
            throw new Error('Failed to save letter');
        }
        return response.json();
    }

    async updateLetter(id: string, letter: Partial<SavedLetter>): Promise<SavedLetter> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(letter),
        });
        if (!response.ok) {
            throw new Error('Failed to update letter');
        }
        return response.json();
    }

    async deleteLetter(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete letter');
        }
    }
}

export const letterService = new LetterService();
