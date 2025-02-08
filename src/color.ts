export const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((channel) => ("0" + Math.round(channel * 255).toString(16)).slice(-2))
    .join("")}`;

const extractColors = async (elements, type) => {
  const colorArray = [];
  
  for (const elem of elements) {
    if (!(type in elem)) continue;
    
    for (const item of elem[type]) {
      if (item.type !== "SOLID" || !item.color) continue;
      
      const hex = rgbToHex(item.color.r, item.color.g, item.color.b);
      let variable = "-";
      
      if (item.boundVariables?.color) {
        const variableData = await figma.variables.getVariableByIdAsync(
          item.boundVariables.color.id
        );
        variable = variableData?.name || " ";
      }
      
      colorArray.push({ color: hex, variable, id: elem.id });
    }
  }
  
  return colorArray;
};

export const figmaElementsToColorTable = async (figmaElements) => {
  const [fillColors, strokeColors] = await Promise.all([
    extractColors(figmaElements, "fills"),
    extractColors(figmaElements, "strokes"),
  ]);

  return [...fillColors, ...strokeColors];
};