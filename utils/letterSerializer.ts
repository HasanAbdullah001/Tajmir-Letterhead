import { SavedLetter } from '../services/LetterService';

export function serializeCurrentLetter(letterName: string): Omit<SavedLetter, 'letterId' | 'createdAt' | 'updatedAt'> {
    // Get all page IDs from localStorage
    const pagesListJson = localStorage.getItem('tajmir_doc_pages_list');
    const pageIds: string[] = pagesListJson ? JSON.parse(pagesListJson) : [];

    // Collect data from each page
    const pages = pageIds.map((pageId) => {
        // Get body content
        const bodyContent = localStorage.getItem(`tajmir_doc_body_${pageId}`) || '';

        // Get text blocks
        const textBlocksJson = localStorage.getItem(`tajmir_doc_draggables_text_${pageId}`);
        const textBlocks = textBlocksJson ? JSON.parse(textBlocksJson) : [];

        // Get image blocks
        const imageBlocksJson = localStorage.getItem(`tajmir_doc_draggables_img_${pageId}`);
        const imageBlocks = imageBlocksJson ? JSON.parse(imageBlocksJson) : [];

        return {
            pageId,
            bodyContent,
            textBlocks,
            imageBlocks,
        };
    });

    // Get shared header content
    const header = {
        h1: localStorage.getItem('tajmir_doc_header_h1') || 'TAJMIR GLOBAL',
        h2: localStorage.getItem('tajmir_doc_header_h2') || 'CORPORATION',
        subtitle: localStorage.getItem('tajmir_doc_header_sub') || 'A Concern of Tajmir Group',
    };

    // Get shared footer content
    const footer = {
        title: localStorage.getItem('tajmir_doc_footer_title') || 'TAJMIR GLOBAL CORPORATION',
        address: localStorage.getItem('tajmir_doc_footer_unified') || '950/B, Yakub-Ayub Building Amir Market, Khatungonj, Chattogram, 01843601712 or 01755880400',
    };

    const result: any = {
        letterName,
        pages,
        sharedContent: {
            header,
            footer,
        },
        margins: {
            top: 96, right: 96, bottom: 96, left: 96
        }
    };

    // Check if the margins are actually stored as a JSON object (as seen in EditorMode)
    // The EditorMode stores it as 'tajmir_settings_margins' JSON string.
    const marginsJson = localStorage.getItem('tajmir_settings_margins');
    if (marginsJson) {
        try {
            const m = JSON.parse(marginsJson);
            result.margins = m;
        } catch (e) { }
    }

    return result;
}

export function loadLetterToLocalStorage(letter: SavedLetter): void {
    // Clear existing data
    const existingPagesJson = localStorage.getItem('tajmir_doc_pages_list');
    if (existingPagesJson) {
        const existingPages: string[] = JSON.parse(existingPagesJson);
        existingPages.forEach((pageId) => {
            localStorage.removeItem(`tajmir_doc_body_${pageId}`);
            localStorage.removeItem(`tajmir_doc_draggables_text_${pageId}`);
            localStorage.removeItem(`tajmir_doc_draggables_img_${pageId}`);
        });
    }

    // Set page list
    const pageIds = letter.pages.map((p) => p.pageId);
    localStorage.setItem('tajmir_doc_pages_list', JSON.stringify(pageIds));

    // Set page content
    letter.pages.forEach((page) => {
        localStorage.setItem(`tajmir_doc_body_${page.pageId}`, page.bodyContent);
        localStorage.setItem(`tajmir_doc_draggables_text_${page.pageId}`, JSON.stringify(page.textBlocks));
        localStorage.setItem(`tajmir_doc_draggables_img_${page.pageId}`, JSON.stringify(page.imageBlocks));
    });

    // Set shared header content
    localStorage.setItem('tajmir_doc_header_h1', letter.sharedContent.header.h1);
    localStorage.setItem('tajmir_doc_header_h2', letter.sharedContent.header.h2);
    localStorage.setItem('tajmir_doc_header_sub', letter.sharedContent.header.subtitle);

    // Set shared footer content
    localStorage.setItem('tajmir_doc_footer_title', letter.sharedContent.footer.title);
    localStorage.setItem('tajmir_doc_footer_unified', letter.sharedContent.footer.address);

    // Set margins
    if (letter.margins) {
        localStorage.setItem('tajmir_settings_margins', JSON.stringify(letter.margins));
    }
}
