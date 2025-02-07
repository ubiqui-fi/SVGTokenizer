export const rgbToHex = (r: number, g: number, b: number): string =>
    `#${('0' + Math.round(r * 255).toString(16)).slice(-2)}`
    + `${('0' + Math.round(g * 255).toString(16)).slice(-2)}`
    + `${('0' + Math.round(b * 255).toString(16)).slice(-2)}`;

export const figmaElementsToColorTable = (figmaElements) => {
    const figmaColors = figmaElements
        .map((elem) => {
            if (!('fills' in elem)) return []; // Ensure fills exist
            const allColors = elem.fills;

            if (Array.isArray(allColors) && allColors.length > 0) {
                return allColors
                    .filter(color => color.type === 'SOLID') // Only solid colors
                    .map(color => rgbToHex(color.color.r, color.color.g, color.color.b));
            }

            return [];
        })
        .flat();

    console.log(figmaColors);
};
