const GITHUB_PROJECT_URL = "https://github.com/ubiqui-fi/SVGTokenizer";

let svgColorCodes = null;

const renderColorsTable = (colors) => {
  svgColorCodes = colors;
  const colorsPull = document.getElementById("colors-pull");
  colorsPull!!.innerHTML = "";

  const html = colors
    .map(({ color, variable, id }) => `
      <tr>
        <td class="color-with-block" data-color="${color}" data-variable="${variable}" data-id="${id}">
          <div class="color-block" style="background-color: ${color}"></div>
          <div class="color-hex-color">${color}</div>
        </td>
        <td class="color-with-variable">
          <div class="color-variable" ${variable === "-" ? 'style="background-color: red;"' : ""}>
            ${variable === "-" ? "!VAR NOT FOUND!" : variable}
          </div>
        </td>
      </tr>
    `)
    .join("");

  colorsPull!!.insertAdjacentHTML("beforeend", html);

  document.querySelectorAll(".color-with-block").forEach((td) => {
    td.addEventListener("click", ({ target }) => {
      const tdElement = (target as Element).closest("td");
      if (tdElement) {
        const { color, variable, id } = tdElement.dataset;
        parent.postMessage({ pluginMessage: { type: "select-layer", color, variable, id } }, "*");
      }
    });
  });
};

const replaceColorsWithVariablesEngine = (props: {elementInDOM: HTMLElement | null, attribute: {name: string, data: string}}) => {
  const localElement = props.elementInDOM;
  
  const applyAttribute = (element: HTMLElement | null) => {
    if (element?.getAttribute(props.attribute.name)) {
      element.setAttribute(props.attribute.name, props.attribute.data);
    }
  };

  if (localElement?.tagName != "g") {
    applyAttribute(props.elementInDOM);
  } else {
    const children = Array.from(localElement!.getElementsByTagName("*")) as HTMLElement[];

    children.forEach(el => {
      if (!(el.id)) {
        applyAttribute(el);
      }
    });
  }
  
  return localElement;
}

const replaceColorsWithVariables = (colors, code) => {
  const domParser = new DOMParser();

  let header = domParser.parseFromString(code, "image/svg+xml").querySelector("svg");
  if (header) {
    header.setAttribute("id", "svg");
    header.removeAttribute("width");
    header.removeAttribute("height");
    code = new XMLSerializer().serializeToString(header);
  }

  const newCode = colors.reduce((updateCode, { id, variable, type }) => {
    const stringAsDOM = domParser.parseFromString(updateCode, "image/svg+xml");
    const baseElement = stringAsDOM.getElementById(id);

    if (baseElement) {
      if (type === "fills" && variable !== "-") {
        replaceColorsWithVariablesEngine({
          elementInDOM: baseElement,
          attribute: {
            name: 'fill',
            data: `var(--${variable})`
          }
        });
      }

      if (type === "strokes" && variable !== "-") {
        replaceColorsWithVariablesEngine({
          elementInDOM: baseElement,
          attribute: {
            name: 'stroke',
            data: `var(--${variable})`
          }
        });
      }
    }

    return new XMLSerializer().serializeToString(stringAsDOM);
  }, code);

  return newCode;
};
const escapeHtml = (code) =>
  code.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

const injectColorVariables = (colors) => {
  if (!colors) return;
  const styles = `:root {
    ${colors.map(({ color, variable }) => variable ? `--${variable}: ${color};` : "").join("\n    ")}
  }`;
  const styleTag = document.createElement("style");
  styleTag.textContent = styles;
  document.body.appendChild(styleTag);
};

const previewSVG = (svgCode) => {
  injectColorVariables(svgColorCodes);
  document.getElementById("preview-svg")?.insertAdjacentHTML("beforeend", svgCode);
};

// Declare PR as a global variable to satisfy TypeScript
declare const PR: { prettyPrint: () => void };

const previewSVGCode = (svgCode) => {
  const codeContainer = document.getElementById("code-container");
  const codeWithReplacedColors = replaceColorsWithVariables(svgColorCodes, svgCode);
  codeContainer!!.innerHTML = `<pre class="prettyprint lang-html linenums" id="code">${escapeHtml(codeWithReplacedColors)}</pre>`;
  previewSVG(codeWithReplacedColors);
  PR.prettyPrint();
};

const saveSvgToFile = (svgCode) => {
  const blob = new Blob([svgCode], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.download = "svg_file.svg";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};

const setupEventHandlers = (svgCode) => {
  document.getElementById("link-to-github-project")?.addEventListener("click", () => window.open(GITHUB_PROJECT_URL, "_blank"));
  document.getElementById("copy-code-as-file")?.addEventListener("click", () => saveSvgToFile(replaceColorsWithVariables(svgColorCodes, svgCode)));
  
  document.getElementById("copy-code")?.addEventListener("click", () => {
    try {
      navigator.clipboard.writeText(replaceColorsWithVariables(svgColorCodes, svgCode));
      parent.postMessage({ pluginMessage: { type: "alert", data: "SVG copied to clipboard!" } }, "*");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      parent.postMessage({ pluginMessage: { type: "alert", data: "Failed to copy SVG to clipboard." } }, "*");
    }
  });
};

onmessage = (event) => {
  const { type, data } = event.data.pluginMessage;
  if (type === "colors") {
    renderColorsTable(data);
  }
  if (type === "svg-code") {
    previewSVGCode(data);
    setupEventHandlers(data);
  }
};
