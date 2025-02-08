const GITHUB_PROJECT_URL = "https://github.com/FussuChalice/SVGTokenizer";

document
  .getElementById("link-to-github-project")
  ?.addEventListener("click", () => {
    window.open(GITHUB_PROJECT_URL, "_blank");
  });

let svgColorCodes = null;

const renderColorsTable = (colors) => {
  svgColorCodes = colors;
  const colorsPull = document.getElementById("colors-pull");

  const html = colors
    .map(
      (color) => `<tr>
              <td class="color-with-block" data-color="${
                color.color
              }" data-variable="${color.variable}" data-id="${color.id}">
                <div class="color-block" style="background-color: ${
                  color.color
                }"></div>
                <div class="color-hex-color">${color.color}</div>
              </td>
              <td class="color-with-variable">
                <div class="color-variable" ${
                  color.variable === "-" && 'style="background-color: red;"'
                } >${
        color.variable === "-" ? "!VAR NOT FOUND!" : color.variable
      }</div>
              </td>
            </tr>`
    )
    .join("");

  colorsPull?.insertAdjacentHTML("beforeend", html);

  document.querySelectorAll(".color-with-block").forEach((td) => {
    td.addEventListener("click", (event) => {
      const color = event.target.closest("td").dataset.color;
      const variable = event.target.closest("td").dataset.variable;
      const id = event.target.closest("td").dataset.id;

      parent.postMessage(
        {
          pluginMessage: {
            type: "selectLayer",
            color,
            variable,
            id,
          },
        },
        "*"
      );
    });
  });
};

const toUpperCase = (text) => {
  return text.toUpperCase();
};

const replaceColorsWithVariables = (colors, code) => {
  let tmpCode = code;
  colors.forEach(({ color, variable }) => {
    if (variable) {
      console.log(toUpperCase(color));
      tmpCode = tmpCode.replace(toUpperCase(color), `var(--${variable})`);
    }
  });

  return tmpCode;
};

const escapeHtml = (code) => {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const injectColorVariables = (colors) => {
  let styles = ":root {\n";

  colors.forEach(({ color, variable }) => {
    if (variable) {
      styles += `  --${variable}: ${color};\n`;
    }
  });

  styles += "}";

  const styleTag = document.createElement("style");
  styleTag.textContent = styles;

  document.body.appendChild(styleTag);
};

const previewSVG = (svgCode: string) => {
  const svgBox = document.getElementById("preview-svg");

  injectColorVariables(svgColorCodes);
  svgBox?.insertAdjacentHTML("beforeend", svgCode);
};

const previewSVGCode = (svgCode: string) => {
  const codeContainer = document.getElementById("code-container");
  const codeWithReplacedColors = replaceColorsWithVariables(
    svgColorCodes,
    svgCode
  );
  const newCode = escapeHtml(codeWithReplacedColors);

  const html = `
      <pre class="prettyprint lang-html linenums " id="code">${newCode}</pre>
    `;

  codeContainer?.insertAdjacentHTML("beforeend", html);

  previewSVG(codeWithReplacedColors);

  PR.prettyPrint();
};

const saveSvgToFile = (svgCode: string) => {
    const fileName = 'svg_file.svg';

    const blob = new Blob([svgCode], { type: 'image/svg+xml' });

    const link = document.createElement('a');

    link.download = fileName;

    link.href = URL.createObjectURL(blob);
    link.click();

    URL.revokeObjectURL(link.href);

    parent.postMessage({
        pluginMessage: {
            type: 'alert',
            data: 'SVG file saved successfully!'
        }
    }, '*');
};


const saveSVGAsFileHandler = (svgCode: string) => {
    const saveAsFileButton = document.getElementById('copy-code-as-file');

    saveAsFileButton?.addEventListener("click", () => {
        saveSvgToFile(replaceColorsWithVariables(svgColorCodes, svgCode));
    });
}

const copyToClipboardHandler = (svgCode: string) => {
    const codeWithReplacedColors = replaceColorsWithVariables(svgColorCodes, svgCode);

    const copyToClipboardButton = document.getElementById('copy-code');

    if (copyToClipboardButton) {
        copyToClipboardButton.addEventListener('click', () => {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = codeWithReplacedColors;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                parent.postMessage({
                    pluginMessage: {
                        type: 'alert',
                        data: 'SVG copied to clipboard!'
                    }
                }, '*');
            } catch (error) {
                console.error("Failed to copy to clipboard:", error);
                parent.postMessage({
                    pluginMessage: {
                        type: 'alert',
                        data: 'Failed to copy SVG to clipboard.'
                    }
                }, '*');
            }
        });
    }
};

const listenFigmaPluginBackendMessages = () => {
  onmessage = (event) => {
    const message = event.data.pluginMessage;

    if (message.type === "colors") {
      renderColorsTable(message.data);
    }

    if (message.type === "svg-code") {
      previewSVGCode(message.data);
      copyToClipboardHandler(message.data);
      saveSVGAsFileHandler(message.data);
    }
  };
};

listenFigmaPluginBackendMessages();
