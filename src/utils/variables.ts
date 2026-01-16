export const substituteVariables = (text: string, variables: { key: string; value: string }[]) => {
    let result = text;
    variables.forEach(v => {
        // Escape special characters in key for regex
        const escapedKey = v.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`{{${escapedKey}}}`, 'g');
        result = result.replace(regex, v.value);
    });
    return result;
};
