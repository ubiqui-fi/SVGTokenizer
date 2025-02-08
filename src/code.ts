import { figmaElementsToColorTable } from "./color";

figma.showUI(__html__, { width: 720, height: 590, themeColors: true });

const selectedElement = figma.currentPage.selection[0];

const findChildrenElements = (rootElem) => {
  const result = [rootElem];

  if ("children" in rootElem) {
    rootElem.children.forEach((child) => {
      result.push(...findChildrenElements(child));
    });
  }
  
  return result;
};

const processSelectedElement = async (element) => {
  if (!element) {
    figma.notify("🙁 No element selected!");
    figma.closePlugin();
    return;
  }

  const elementsInSVG = findChildrenElements(element);
  console.log(elementsInSVG);

  try {
    const colors = await figmaElementsToColorTable(elementsInSVG);
    figma.ui.postMessage({ type: "colors", data: colors });
  } catch (error) {
    console.error("Error processing colors:", error);
  }

  try {
    if ("exportAsync" in element) {
      const svgBuffer = await element.exportAsync({ format: "SVG" });
      const svgCode = String.fromCharCode(...svgBuffer);
      figma.ui.postMessage({ type: "svg-code", data: svgCode });
    }
  } catch (error) {
    console.error("Error exporting SVG:", error);
  }
};

processSelectedElement(selectedElement);

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "selectLayer") {
      const node = await figma.getNodeByIdAsync(msg.id);
      if (node) {
        figma.currentPage.selection = [node];
      } else {
        console.log(`Node with ID ${msg.id} not found.`);
      }
    }

    if (msg.type === "alert") {
      figma.notify(msg.data);
    }
  } catch (error) {
    console.error("Error handling UI message:", error);
  }
};
