import { figmaElementsToColorTable } from "./color";

figma.showUI(__html__, { width: 720, height: 590, themeColors: true });

const selectedElement = figma.currentPage.selection[0];

const findChildrenElements = (rootElem) => {
    let result = [rootElem];

    if ('children' in rootElem) {
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
    

    const colors = figmaElementsToColorTable(elementsInSVG);

    console.log(colors);
    
    
}
