const FACILITATION_CONTENT_KEY = "what-should-i-do-facilitation-content-v1";

function loadFacilitationContent() {
  try { return JSON.parse(localStorage.getItem(FACILITATION_CONTENT_KEY)) || {}; }
  catch { return {}; }
}

const savedFacilitationContent = loadFacilitationContent();
const pageName = document.body.dataset.facilitationPage || "facilitation";

document.querySelectorAll(".facilitation-list details").forEach((detail, index) => {
  const key = `${pageName}-${index + 1}`;
  const summary = detail.querySelector("summary");
  summary.setAttribute("role", "link");
  summary.setAttribute("aria-label", `Open ${summary.querySelector("h3").textContent} discussion page`);
  summary.addEventListener("click", event => {
    event.preventDefault();
    window.location.href = `facilitation-item.html?stage=${pageName}&item=${index + 1}`;
  });
});
