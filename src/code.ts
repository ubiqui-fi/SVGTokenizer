import { figmaElementsToColorTable } from "./color";

figma.showUI(__html__, { width: 720, height: 590, themeColors: true });

const selectedElement = figma.currentPage.selection[0];

const findChildrenElements = (rootElem) => {
  let result = [rootElem];

  if ("children" in rootElem) {
    const children = rootElem.children;

    children.forEach((child) => {
      result = result.concat(findChildrenElements(child));
    });
  }

  return result;
};

if (selectedElement) {
  const elementsInSVG = findChildrenElements(selectedElement);
  console.log(elementsInSVG);

  /* ------------------------- Send colors to UI side ------------------------- */
  const colors = await figmaElementsToColorTable(elementsInSVG);
  figma.ui.postMessage({ type: "colors", data: colors });

  
  /* ----------------------------- Build SVG Code ----------------------------- */

  if ("exportAsync" in selectedElement) {
    const svgBuffer = await selectedElement.exportAsync({ format: "SVG" });
    const svgCode = String.fromCharCode(...svgBuffer);

    figma.ui.postMessage({type: 'svg-code', data: svgCode});
  }

} else {
    figma.notify("🙁 No element selected!");
    figma.closePlugin();
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "selectLayer") {
    const { color, variable, id } = msg;

    try {
      const node = await figma.getNodeByIdAsync(id);

      if (node) {
        figma.currentPage.selection = [node];
      } else {
        console.log(`Node with ID ${id} not found.`);
      }
    } catch (error) {
      console.log("Error fetching the node:", error);
    }
  }

  if (msg.type === 'alert') {
    figma.notify(msg.data);
  }
};
