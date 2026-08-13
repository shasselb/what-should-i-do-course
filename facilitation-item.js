const params = new URLSearchParams(window.location.search);
const stage = params.get("stage");
const item = Number(params.get("item"));
const validStages = ["be", "know", "do"];
const FACILITATION_ADMIN_KEY = "what-should-i-do-facilitation-admin-v1";

if (!validStages.includes(stage) || !Number.isInteger(item) || item < 1 || item > 4) {
  window.location.replace("index.html");
} else {
  loadDiscussion();
}

async function loadDiscussion() {
  const response = await fetch(`${stage}.html`);
  const source = await response.text();
  const documentCopy = new DOMParser().parseFromString(source, "text/html");
  const detail = documentCopy.querySelectorAll(".facilitation-list details")[item - 1];
  const summary = detail.querySelector("summary");
  const stageLabel = stage.toUpperCase();

  document.title = `${stageLabel} ${item}: ${summary.querySelector("h3").textContent} — What Should I Do?`;
  document.getElementById("discussionNumber").textContent = String(item).padStart(2, "0");
  document.getElementById("discussionStage").textContent = stageLabel;
  document.getElementById("discussionTitle").textContent = summary.querySelector("h3").textContent;
  document.getElementById("discussionSummary").textContent = summary.querySelector("p").textContent;
  document.getElementById("discussionContent").innerHTML = detail.querySelector(".discussion-detail").innerHTML;
  document.getElementById("discussionBack").href = `${stage}.html#${stage}Facilitation`;
  document.getElementById("discussionBack").textContent = `← Back to ${stageLabel} outline`;

  const previous = document.getElementById("previousDiscussion");
  const next = document.getElementById("nextDiscussion");
  if (item === 1) previous.hidden = true;
  else previous.href = `facilitation-item.html?stage=${stage}&item=${item - 1}`;
  if (item === 4) next.hidden = true;
  else next.href = `facilitation-item.html?stage=${stage}&item=${item + 1}`;

  displayAdminContent(`${stage}-${item}`);
  document.getElementById("downloadDocument").addEventListener("click",downloadDiscussionDocument);
}

function displayAdminContent(key) {
  let content = {};
  try { content = JSON.parse(localStorage.getItem(FACILITATION_ADMIN_KEY)) || {}; } catch {}
  const saved=content[key];
  if(!saved||!Object.values(saved).some(value=>value&&value.trim()))return;
  const pageTitle=saved.heading||document.getElementById("discussionTitle").textContent;
  document.title=`${stage.toUpperCase()} ${item}: ${pageTitle} — What Should I Do?`;
  document.getElementById("discussionTitle").textContent=pageTitle;
  document.getElementById("discussionSummary").textContent="Facilitated discussion";
  const questions=String(saved.questions||"").split("\n").map(value=>value.trim()).filter(Boolean);
  document.getElementById("discussionContent").innerHTML=`${saved.body?`<h4>Teaching content</h4>${paragraphs(saved.body)}`:""}${saved.scripture?`<section class="key-scripture"><h4>Key Scripture</h4>${scriptureParagraphs(saved.scripture)}<small>Select a reference to read it in the ESV.</small></section>`:""}${questions.length?`<h4>Discussion questions</h4><ul>${questions.map(question=>`<li>${escapeHtml(question)}</li>`).join("")}</ul>`:""}${saved.takeaway?`<p class="discussion-close"><strong>Facilitator takeaway:</strong> ${escapeHtml(saved.takeaway)}</p>`:""}`;
}
function escapeHtml(value){const element=document.createElement("div");element.textContent=value;return element.innerHTML;}
function paragraphs(value){return String(value||"").split(/\n\s*\n/).map(text=>text.trim()).filter(Boolean).map(text=>`<p>${escapeHtml(text).replace(/\n/g,"<br>")}</p>`).join("");}
function scriptureParagraphs(value){return String(value||"").split(/\n\s*\n/).map(text=>text.trim()).filter(Boolean).map(text=>`<p>${linkScriptureReferences(text)}</p>`).join("");}
function linkScriptureReferences(value){
  const escaped=escapeHtml(value).replace(/\n/g,"<br>");
  const books="Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation";
  return escaped.replace(new RegExp(`\\b(${books})\\s+(\\d{1,3})(?::(\\d{1,3}(?:[–—-]\\d{1,3})?))?`,"gi"),match=>`<a class="scripture-link" href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(match)}&amp;version=ESV" target="_blank" rel="noopener noreferrer">${match}<span aria-hidden="true">↗</span></a>`);
}

function downloadDiscussionDocument(){
  const stageLabel=stage.toUpperCase();
  const title=document.getElementById("discussionTitle").textContent.trim();
  const summary=document.getElementById("discussionSummary").textContent.trim();
  const content=document.getElementById("discussionContent").innerHTML;
  const documentHtml=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{margin:1in}body{font-family:Arial,sans-serif;color:#1f2824;line-height:1.6}h1{font-size:28pt;margin:0 0 8pt}h4{margin-top:22pt;color:#2f7257;text-transform:uppercase;letter-spacing:.08em}p,li{font-size:11pt}.stage{color:#2f7257;font-weight:bold;letter-spacing:.12em}.summary{color:#626760;font-size:13pt;border-bottom:1px solid #d9d3c7;padding-bottom:18pt}.key-scripture{margin:20pt 0;padding:16pt;background:#deeee5;border-left:4px solid #2f7257}.discussion-close{padding:14pt;background:#deeee5;border-left:4px solid #2f7257}a{color:#2f7257}.footer{margin-top:30pt;padding-top:10pt;border-top:1px solid #d9d3c7;color:#777;font-size:9pt}</style></head><body><p class="stage">${stageLabel} · ITEM ${String(item).padStart(2,"0")}</p><h1>${escapeHtml(title)}</h1><p class="summary">${escapeHtml(summary)}</p>${content}<p class="footer">What Should I Do? · BE · KNOW · DO</p></body></html>`;
  const blob=new Blob(["\ufeff",documentHtml],{type:"application/msword"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=`${stageLabel}-${String(item).padStart(2,"0")}-${fileName(title)}.doc`;
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function fileName(value){return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"discussion";}
