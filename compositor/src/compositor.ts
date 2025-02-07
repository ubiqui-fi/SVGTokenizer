import * as fs from 'fs';
import * as path from 'path';
import { minify as minifyHtml } from 'html-minifier-terser';
import cssnano from 'cssnano';
import { minify as minifyJs } from 'terser';

const publicHtmlPath = path.join(__dirname, '../../public/ui.html');
const distHtmlPath = path.join(__dirname, '../../dist/ui.html');
const distJsPath = path.join(__dirname, '../../dist/ui.js');
const distCssPath = path.join(__dirname, '../../public/styles.css');

if (!fs.existsSync(publicHtmlPath)) {
  console.error('Error: public/ui.html not found');
  process.exit(1);
}

if (!fs.existsSync(distJsPath)) {
  console.error('Error: dist/ui.js not found');
  process.exit(1);
}

if (!fs.existsSync(distCssPath)) {
  console.error('Error: dist/styles.css not found');
  process.exit(1);
}

const htmlContent = fs.readFileSync(publicHtmlPath, 'utf-8');
const scriptContent = fs.readFileSync(distJsPath, 'utf-8');
const styleContent = fs.readFileSync(distCssPath, 'utf-8');

function replaceImgWithSvg(html: string): string {
  return html.replace(/<img\s+[^>]*id="([^"]+)"[^>]*>/g, (match, id) => {
    try {
      const svgPath = path.join(__dirname, `../../public/assets/${id}.svg`);
      if (fs.existsSync(svgPath)) {
        let svgContent = fs.readFileSync(svgPath, 'utf-8');

        svgContent = svgContent.replace('<svg ', `<svg id="${id}" `);
        return svgContent;
      } else {
        console.warn(`SVG for id="${id}" not found.`);
        return match;
      }
    } catch (error) {
      console.error(`Error reading SVG for id="${id}":`, error);
      return match;
    }
  });
}

async function minifyFiles() {
  try {
    
    const updatedHtmlContent = replaceImgWithSvg(htmlContent);

    const minifiedHtml = await minifyHtml(updatedHtmlContent, {
      collapseWhitespace: true,
      removeComments: false,
      minifyCSS: true,
      minifyJS: true,
    });

    const cssResult = await cssnano().process(styleContent, { from: distCssPath });
    const minifiedCss = cssResult.css;

    const minifiedJs = await minifyJs(scriptContent, { output: { comments: true } });

    const injectedHtml = minifiedHtml.replace(
      '<style></style>',
      `<style>${minifiedCss}</style>`
    ).replace(
      '</body>',
      `<script>${minifiedJs.code}</script></body>`
    );

    fs.writeFileSync(distHtmlPath, injectedHtml, 'utf-8');
    console.log('File dist/ui.html successfully created with embedded minified HTML, JS, and CSS (comments preserved)!');
  } catch (err) {
    console.error('Error during minification:', err);
  }
}

minifyFiles();
