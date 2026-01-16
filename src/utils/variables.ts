export const substituteVariables = (text: string, variables: { key: string; value: string }[]) => {
    let result = text;
    variables.forEach(v => {
        const regex = new RegExp(`{{${v.key}}}`, 'g');
        result = result.replace(regex, v.value);
    });
    return result;
};
