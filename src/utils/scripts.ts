export const runPreRequestScript = (script: string, variables: any[], headers: any[]) => {
    // We use Maps for easy lookups/updates while preserving original objects where possible
    const varsMap = new Map();
    variables.forEach(v => varsMap.set(v.key, v.value));

    // Headers are often objects { key, value, enabled }
    const headersMap = new Map();
    headers.forEach(h => {
        if (h.key) {
            headersMap.set(h.key, { value: h.value, enabled: h.enabled !== false });
        }
    });

    const pm = {
        variables: {
            set: (key: string, value: string) => {
                varsMap.set(key, value);
            },
            get: (key: string) => {
                return varsMap.get(key);
            }
        },
        request: {
            headers: {
                upsert: (header: { key: string, value: string }) => {
                    headersMap.set(header.key, { value: header.value, enabled: true });
                },
                add: (header: { key: string, value: string }) => {
                    headersMap.set(header.key, { value: header.value, enabled: true });
                },
                remove: (key: string) => {
                    headersMap.delete(key);
                }
            }
        },
        iterationData: {
            get: () => null // Placeholder for data files
        },
        environment: {
            get: (key: string) => varsMap.get(key),
            set: (key: string, value: string) => varsMap.set(key, value)
        }
    };

    // Mock console to capture logs or just pipe to devtools for now
    const mockConsole = {
        log: (...args: any[]) => console.log('[pm.script]', ...args),
        error: (...args: any[]) => console.error('[pm.script]', ...args),
        warn: (...args: any[]) => console.warn('[pm.script]', ...args),
    };

    try {
        const fn = new Function('pm', 'console', script);
        fn(pm, mockConsole);
    } catch (error) {
        console.error('Pre-request script error:', error);
        throw new Error(`Pre-request script error: ${error}`);
    }

    return {
        variables: Array.from(varsMap.entries()).map(([key, value]) => ({ key, value })),
        headers: Array.from(headersMap.entries()).map(([key, data]) => ({
            key,
            value: (data as any).value,
            enabled: (data as any).enabled
        }))
    };
};
