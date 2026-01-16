export const parseCurl = (curlCommand: string) => {
    const result = {
        method: 'GET',
        url: '',
        headers: [] as { key: string; value: string; enabled: boolean }[],
        body: '',
        bodyType: 'none',
    };

    if (!curlCommand.trim().toLowerCase().startsWith('curl')) {
        return null;
    }

    // Replace line continuations
    const cleanCommand = curlCommand.replace(/\\\n/g, ' ');

    // Extract URL - check for URL wrapped in quotes first
    const urlMatch = cleanCommand.match(/['"](https?:\/\/[^'"]+)['"]/) ||
        cleanCommand.match(/(https?:\/\/[^\s\\]+)/);

    if (urlMatch) {
        result.url = urlMatch[1];
    }

    // Extract Method
    const methodMatch = cleanCommand.match(/(?:-X|--request)\s+(['"]?)([A-Z]+)\1/i);
    if (methodMatch) {
        result.method = methodMatch[2].toUpperCase();
    }

    // Extract Headers (-H or --header)
    const headerMatches = cleanCommand.matchAll(/(?:-H|--header)\s+\$?(['"])(.*?)\1/g);
    for (const match of headerMatches) {
        const headerStr = match[2];
        const colonIndex = headerStr.indexOf(':');
        if (colonIndex > -1) {
            const key = headerStr.substring(0, colonIndex).trim();
            const value = headerStr.substring(colonIndex + 1).trim();
            result.headers.push({ key, value, enabled: true });
        }
    }

    // Extract Cookies (-b or --cookie)
    const cookieMatches = cleanCommand.matchAll(/(?:-b|--cookie)\s+\$?(['"])(.*?)\1/g);
    for (const match of cookieMatches) {
        result.headers.push({ key: 'Cookie', value: match[2], enabled: true });
    }

    // Extract Body
    // Common flags: -d, --data, --data-raw, --data-binary
    const bodyMatch = cleanCommand.match(/(?:--data(?:-raw|-binary)?|-d)\s+\$?(['"])(.*?)\1/s);
    if (bodyMatch) {
        result.body = bodyMatch[2];
        if (result.method === 'GET') result.method = 'POST';

        try {
            JSON.parse(result.body);
            result.bodyType = 'json';
        } catch {
            result.bodyType = 'raw';
        }
    }

    return result;
};
