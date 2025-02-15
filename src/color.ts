const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((channel) => ("0" + Math.round(channel * 255).toString(16)).slice(-2))
    .join("")}`;


export const removeNamesDuplications = (colors) => {
  const nameCount = {};

  const uniqueNames = colors.map((item) => {
    let newName = item.name;

    if (nameCount[newName] !== undefined) {
      nameCount[newName]++;
      newName = nameCount[newName] !== 1 ? `${newName}_${nameCount[newName]}` : newName;
    } else {
      nameCount[newName] = 1;
    }
    return {...item, name: newName};
  });
  
  return uniqueNames;
};

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
        variable = variableData?.name || "-";
      }
      
      colorArray.push({ 
        color: hex, 
        variable, 
        id: elem.id, 
        name: elem.name, 
        type: type 
      });
    }
  }

  return removeNamesDuplications(colorArray);
};

export const figmaElementsToColorTable = async (figmaElements) => {
  const [fillColors, strokeColors] = await Promise.all([
    extractColors(figmaElements, "fills"),
    extractColors(figmaElements, "strokes"),
  ]);

  return [...fillColors, ...strokeColors];
};