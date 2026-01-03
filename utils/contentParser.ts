export interface ParsedPromptContent {
    description: string;
    library?: string;
    [key: string]: any;
}

/**
 * Parse and extract data from prompt content
 * Handles both plain text and JSON content
 */
export function parsePromptContent(content: any): string {
    const parsed = parseFullContent(content);
    return parsed.description;
}

/**
 * Parse and return full content data including library
 */
export function parseFullContent(content: any): ParsedPromptContent {
    if (!content) return { description: '' };

    // If it's already a string, try to parse as JSON
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return extractContentData(parsed);
        } catch {
            // If not valid JSON, return as is (plain text)
            return { description: content };
        }
    }

    // If it's an object, extract data directly
    if (typeof content === 'object') {
        return extractContentData(content);
    }

    return { description: '' };
}

function extractContentData(obj: any): ParsedPromptContent {
    const result: ParsedPromptContent = {
        description: '',
    };

    if (!obj || typeof obj !== 'object') return result;

    // Extract library if present
    if (obj.library) {
        result.library = obj.library;
    }

    // Extract description from common fields
    const contentFields = [
        'description',
        'prompt',
        'text',
        'content',
        'body',
        'message',
    ];

    for (const field of contentFields) {
        if (obj[field] && typeof obj[field] === 'string') {
            result.description = obj[field].substring(0, 300);
            return result;
        }
    }

    // If no standard field found, try to create a summary from the object
    const keys = Object.keys(obj).slice(0, 3);
    if (keys.length > 0) {
        result.description = keys
            .map((key) => {
                const value = obj[key];
                if (typeof value === 'string') {
                    return `${key}: ${value.substring(0, 100)}`;
                }
                return null;
            })
            .filter(Boolean)
            .join('\n');
    }

    return result;
}

