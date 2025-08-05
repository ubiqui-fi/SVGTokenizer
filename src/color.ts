const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((channel) => ("0" + Math.round(channel * 255).toString(16)).slice(-2))
    .join("")}`;

type Color = {
  color: string;
  variable: string;
  id: string;
  name: string;
  type: string;
};


export const removeNamesDuplications = (colors: Color[]) => {
  const nameCount: { [key: string]: number } = {};

  const uniqueNames = colors.map((item: Color) => {
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

const extractColors = async (elements: any[], type: "fills" | "strokes") => {
  const colorArray: Color[] = [];
  
  for (const elem of elements) {
    if (!(type in elem)) continue;
    if (!elem.fillStyleId && !elem.strokeStyleId) continue;
    let style = await (figma.getStyleByIdAsync(elem.fillStyleId) || figma.getStyleByIdAsync(elem.strokeStyleId)) as PaintStyle;
    if (!style) continue;
    for (const item of style.paints) {
      if (item.type !== "SOLID" || !item.color) continue;

      const hex = rgbToHex(item.color.r, item.color.g, item.color.b);
      let variable = style.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-color";
      
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

export const figmaElementsToColorTable = async (figmaElements: any[]) => {
  const [fillColors, strokeColors] = await Promise.all([
    extractColors(figmaElements, "fills"),
    extractColors(figmaElements, "strokes"),
  ]);

  return [...fillColors, ...strokeColors];
};