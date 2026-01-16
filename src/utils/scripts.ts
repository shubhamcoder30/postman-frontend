export const runPreRequestScript = (script: string, variables: any[]) => {
    const varsMap = new Map();
    variables.forEach(v => varsMap.set(v.key, v.value));

    const pm = {
        variables: {
            set: (key: string, value: string) => {
                varsMap.set(key, value);
            },
            get: (key: string) => {
                return varsMap.get(key);
            }
        }
    };

    try {
        // Create a function from the script to run it in a controlled-ish environment
        // NOTE: This uses eval-like behavior. In a production app, you might want a sandbox.
        const fn = new Function('pm', script);
        fn(pm);
    } catch (error) {
        console.error('Pre-request script error:', error);
        throw new Error(`Pre-request script error: ${error}`);
    }

    // Return the updated variables as an array
    return Array.from(varsMap.entries()).map(([key, value]) => ({ key, value }));
};
