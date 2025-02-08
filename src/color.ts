export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${("0" + Math.round(r * 255).toString(16)).slice(-2)}` +
  `${("0" + Math.round(g * 255).toString(16)).slice(-2)}` +
  `${("0" + Math.round(b * 255).toString(16)).slice(-2)}`;

export const figmaElementsToColorTable = async (figmaElements) => {
  const colorArray = [];

  for (const elem of figmaElements) {
    if ("fills" in elem) {
      const allColors = elem.fills;

      if (Array.isArray(allColors) && allColors.length > 0) {
        for (const color of allColors) {
          if (color.type === "SOLID" && color.color) {
            const hex = rgbToHex(color.color.r, color.color.g, color.color.b);
            let variable = "-";

            if (color.boundVariables && color.boundVariables.color) {
              const variableData = await figma.variables.getVariableByIdAsync(
                color.boundVariables.color.id
              );
              variable = variableData?.name || " ";
            }

            colorArray.push({ color: hex, variable, id: elem.id });
          }
        }
      }
    }

    if ("strokes" in elem) {
      const allStrokes = elem.strokes;

      if (Array.isArray(allStrokes) && allStrokes.length > 0) {
        for (const stroke of allStrokes) {
          if (stroke.type === "SOLID" && stroke.color) {
            const hex = rgbToHex(
              stroke.color.r,
              stroke.color.g,
              stroke.color.b
            );
            let variable = "-";

            if (stroke.boundVariables && stroke.boundVariables.color) {
              const variableData = await figma.variables.getVariableByIdAsync(
                stroke.boundVariables.color.id
              );
              variable = variableData?.name || " ";
            }

            colorArray.push({ color: hex, variable, id: elem.id });
          }
        }
      }
    }
  }

  return colorArray;
};
