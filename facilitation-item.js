const params = new URLSearchParams(window.location.search);
const stage = params.get("stage");
const item = Number(params.get("item"));
const validStages = ["be", "know", "do"];
const FACILITATION_ADMIN_KEY = "what-should-i-do-facilitation-admin-v1";
const SELF_PACED_NOTES_KEY = "what-should-i-do-self-paced-notes-v1";

if (!validStages.includes(stage) || !Number.isInteger(item) || item < 1 || item > 4) {
  window.location.replace("index.html");
} else {
  loadDiscussion();
}

async function loadDiscussion() {
  try {
    const response = await fetch(`${stage}.html`);
    if (!response.ok) throw new Error("Lesson source could not be loaded.");
    const source = await response.text();
    const documentCopy = new DOMParser().parseFromString(source, "text/html");
    const detail = documentCopy.querySelectorAll(".facilitation-list details")[item - 1];
    const summary = detail?.querySelector("summary");
    if (!detail || !summary) throw new Error("This lesson is not available.");

    const stageLabel = stage.toUpperCase();
    const title = summary.querySelector("h3").textContent;
    document.title = `${stageLabel} ${item}: ${title} — What Should I Do?`;
    document.getElementById("discussionNumber").textContent = String(item).padStart(2, "0");
    document.getElementById("discussionStage").textContent = `${stageLabel} · SELF-PACED LESSON`;
    document.getElementById("discussionTitle").textContent = title;
    document.getElementById("discussionSummary").textContent = summary.querySelector("p").textContent;
    document.getElementById("discussionContent").innerHTML = detail.querySelector(".discussion-detail").innerHTML;
    document.getElementById("discussionBack").href = `${stage}.html#${stage}Facilitation`;
    document.getElementById("discussionBack").textContent = `← Back to ${stageLabel} learning path`;

    configureNavigation();
    displayAdminContent(`${stage}-${item}`);
    setupLessonJournal(`${stage}-${item}`);
    document.getElementById("downloadDocument").addEventListener("click", downloadDiscussionDocument);
  } catch (error) {
    document.getElementById("discussionTitle").textContent = "Lesson unavailable";
    document.getElementById("discussionSummary").textContent = error.message;
    document.getElementById("discussionContent").innerHTML = '<p class="discussion-close">Return to the learning path and choose the lesson again.</p>';
    document.querySelector(".lesson-journal").hidden = true;
  }
}

function configureNavigation() {
  const previous = document.getElementById("previousDiscussion");
  const next = document.getElementById("nextDiscussion");
  if (item === 1) previous.hidden = true;
  else previous.href = `facilitation-item?stage=${stage}&item=${item - 1}`;

  if (item < 4) {
    next.href = `facilitation-item?stage=${stage}&item=${item + 1}`;
    return;
  }

  const transitions = {
    be: { href: "know.html", label: "Continue to KNOW →" },
    know: { href: "do.html", label: "Continue to DO →" },
    do: { href: "time-audit.html", label: "Open the Time Audit →" }
  };
  next.href = transitions[stage].href;
  next.textContent = transitions[stage].label;
}

function displayAdminContent(key) {
  const content = loadJson(FACILITATION_ADMIN_KEY, {});
  const saved = content[key];
  if (!saved || !Object.values(saved).some(value => String(value || "").trim())) return;

  const pageTitle = saved.heading || document.getElementById("discussionTitle").textContent;
  document.title = `${stage.toUpperCase()} ${item}: ${pageTitle} — What Should I Do?`;
  document.getElementById("discussionTitle").textContent = pageTitle;
  document.getElementById("discussionSummary").textContent = "A self-paced lesson with Scripture, reflection, and application.";
  const questions = String(saved.questions || "").split("\n").map(value => value.trim()).filter(Boolean);
  document.getElementById("discussionContent").innerHTML = `${saved.body ? `<h4>Lesson content</h4>${paragraphs(saved.body)}` : ""}${saved.scripture ? `<section class="key-scripture"><h4>Key Scripture</h4>${scriptureParagraphs(saved.scripture)}<small>Select a reference to read it in the ESV.</small></section>` : ""}${questions.length ? `<h4>Reflect</h4><ul>${questions.map(question => `<li>${escapeHtml(question)}</li>`).join("")}</ul>` : ""}${saved.takeaway ? `<p class="discussion-close"><strong>Key takeaway:</strong> ${escapeHtml(saved.takeaway)}</p>` : ""}`;
}

function setupLessonJournal(key) {
  let journal = loadJson(SELF_PACED_NOTES_KEY, {});
  const reflection = document.getElementById("lessonReflection");
  const action = document.getElementById("lessonAction");
  const status = document.getElementById("lessonSaveStatus");
  const completeButton = document.getElementById("lessonCompleteButton");
  let saveTimer;
  let entry = journal[key] || {};

  reflection.value = entry.reflection || "";
  action.value = entry.action || "";
  renderComplete(Boolean(entry.complete));

  function saveJournal() {
    clearTimeout(saveTimer);
    entry = {
      reflection: reflection.value.trim(),
      action: action.value.trim(),
      complete: Boolean(entry.complete),
      updatedAt: new Date().toISOString()
    };
    journal[key] = entry;
    localStorage.setItem(SELF_PACED_NOTES_KEY, JSON.stringify(journal));
    status.textContent = "Saved on this device";
  }

  function queueSave() {
    status.textContent = "Saving…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveJournal, 500);
  }

  function renderComplete(complete) {
    completeButton.classList.toggle("completed", complete);
    completeButton.setAttribute("aria-pressed", String(complete));
    completeButton.innerHTML = complete ? '<span aria-hidden="true">✓</span> Lesson complete' : '<span aria-hidden="true">✓</span> Mark lesson complete';
  }

  reflection.addEventListener("input", queueSave);
  action.addEventListener("input", queueSave);
  completeButton.addEventListener("click", () => {
    entry.complete = !entry.complete;
    renderComplete(entry.complete);
    saveJournal();
  });
  document.addEventListener("cloud-saving", () => { status.textContent = "Saving to your account…"; });
  document.addEventListener("cloud-saved", () => { status.textContent = "Saved to your account"; });
  document.addEventListener("cloud-save-error", () => { status.textContent = "Saved here; cloud sync needs attention"; });
}

function loadJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function paragraphs(value) {
  return String(value || "").split(/\n\s*\n/).map(text => text.trim()).filter(Boolean).map(text => `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`).join("");
}

function scriptureParagraphs(value) {
  return String(value || "").split(/\n\s*\n/).map(text => text.trim()).filter(Boolean).map(text => `<p>${linkScriptureReferences(text)}</p>`).join("");
}

function linkScriptureReferences(value) {
  const escaped = escapeHtml(value).replace(/\n/g, "<br>");
  const books = "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation";
  return escaped.replace(new RegExp(`\\b(${books})\\s+(\\d{1,3})(?::(\\d{1,3}(?:[–—-]\\d{1,3})?))?`, "gi"), match => `<a class="scripture-link" href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(match)}&amp;version=ESV" target="_blank" rel="noopener noreferrer">${match}<span aria-hidden="true">↗</span></a>`);
}

function downloadDiscussionDocument() {
  const stageLabel = stage.toUpperCase();
  const title = document.getElementById("discussionTitle").textContent.trim();
  const summary = document.getElementById("discussionSummary").textContent.trim();
  const content = document.getElementById("discussionContent").innerHTML;
  const reflection = document.getElementById("lessonReflection").value.trim();
  const action = document.getElementById("lessonAction").value.trim();
  const journal = reflection || action ? `<h4>My learning journal</h4>${reflection ? `<p><strong>What stood out:</strong><br>${escapeHtml(reflection).replace(/\n/g, "<br>")}</p>` : ""}${action ? `<p><strong>My next faithful step:</strong><br>${escapeHtml(action).replace(/\n/g, "<br>")}</p>` : ""}` : "";
  const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{margin:1in}body{font-family:Arial,sans-serif;color:#1f2824;line-height:1.6}h1{font-size:28pt;margin:0 0 8pt}h4{margin-top:22pt;color:#2e6080;text-transform:uppercase;letter-spacing:.08em}p,li{font-size:11pt}.stage{color:#2e6080;font-weight:bold;letter-spacing:.12em}.summary{color:#626760;font-size:13pt;border-bottom:1px solid #d9d3c7;padding-bottom:18pt}.key-scripture{margin:20pt 0;padding:16pt;background:#deebf2;border-left:4px solid #2e6080}.discussion-close{padding:14pt;background:#deebf2;border-left:4px solid #2e6080}a{color:#2e6080}.footer{margin-top:30pt;padding-top:10pt;border-top:1px solid #d9d3c7;color:#777;font-size:9pt}</style></head><body><p class="stage">${stageLabel} · LESSON ${String(item).padStart(2, "0")}</p><h1>${escapeHtml(title)}</h1><p class="summary">${escapeHtml(summary)}</p>${content}${journal}<p class="footer">What Should I Do? · BE · KNOW · DO</p></body></html>`;
  const blob = new Blob(["\ufeff", documentHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${stageLabel}-${String(item).padStart(2, "0")}-${fileName(title)}.doc`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "lesson";
}
