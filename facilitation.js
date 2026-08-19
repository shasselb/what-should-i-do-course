const SELF_PACED_NOTES_KEY = "what-should-i-do-self-paced-notes-v1";
const pageName = document.body.dataset.facilitationPage || "facilitation";

function loadLessonProgress() {
  try { return JSON.parse(localStorage.getItem(SELF_PACED_NOTES_KEY)) || {}; }
  catch { return {}; }
}

function renderLessonProgress() {
  const progress = loadLessonProgress();
  const lessons = [...document.querySelectorAll(".facilitation-list details")];
  const completed = lessons.filter((_, index) => progress[`${pageName}-${index + 1}`]?.complete).length;
  let progressElement = document.querySelector(".module-progress");
  if (!progressElement) {
    progressElement = document.createElement("div");
    progressElement.className = "module-progress";
    document.querySelector(".facilitation-heading").append(progressElement);
  }
  progressElement.innerHTML = `<span><b>${completed}</b> of ${lessons.length} lessons complete</span><i aria-hidden="true"><b style="width:${(completed / lessons.length) * 100}%"></b></i>`;

  lessons.forEach((detail, index) => {
    const key = `${pageName}-${index + 1}`;
    const copy = detail.querySelector("summary > div");
    let status = copy.querySelector(".lesson-status");
    if (!status) {
      status = document.createElement("small");
      status.className = "lesson-status";
      copy.append(status);
    }
    const complete = Boolean(progress[key]?.complete);
    status.classList.toggle("complete", complete);
    status.textContent = complete ? "✓ Complete" : "Open lesson →";
  });
}

document.querySelectorAll(".facilitation-list details").forEach((detail, index) => {
  const summary = detail.querySelector("summary");
  summary.setAttribute("role", "link");
  summary.setAttribute("aria-label", `Open ${summary.querySelector("h3").textContent} lesson`);
  summary.addEventListener("click", event => {
    event.preventDefault();
    window.location.href = `facilitation-item?stage=${pageName}&item=${index + 1}`;
  });
});

renderLessonProgress();
window.AppCloud?.ready?.then(renderLessonProgress);
