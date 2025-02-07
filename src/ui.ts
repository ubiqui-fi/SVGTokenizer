const GITHUB_PROJECT_URL = "https://github.com/FussuChalice/SVGTokenizer";


const addBinocularsToUI = () => {
    const binocularsContainer = document.getElementById("binoculars");

    const values = [10, 25, 50, 75, 80, 90, 100, 150, 200];
    const selected = 100;

    const html = values.map((value) => `<div class="binoculars-btn ${value === selected && "binocular-selected"}">${value}</div>`).join("");

    binocularsContainer?.insertAdjacentHTML('beforeend', html);
};

document.getElementById('link-to-github-project')?.addEventListener("click", () => {
    window.open(GITHUB_PROJECT_URL, '_blank');
});


// figma plugin connect




addBinocularsToUI();