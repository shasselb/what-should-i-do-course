const VIDEOS_KEY = "what-should-i-do-course-videos-v1";
const CONTENT_KEY = "what-should-i-do-site-content-v1";
const FACILITATION_ADMIN_KEY = "what-should-i-do-facilitation-admin-v1";
const CARD_CONTENT_KEY = "sortly-card-content-v3";
const DEFAULT_VALUE_WORDS = [
  "Integrity","Compassion","Courage","Honesty","Loyalty","Respect","Kindness","Wisdom","Freedom","Justice",
  "Faith","Hope","Love","Family","Community","Service","Growth","Learning","Creativity","Curiosity",
  "Excellence","Discipline","Responsibility","Accountability","Reliability","Patience","Humility","Gratitude","Forgiveness","Generosity",
  "Empathy","Fairness","Peace","Harmony","Balance","Health","Security","Stability","Adventure","Achievement",
  "Leadership","Collaboration","Teamwork","Independence","Authenticity","Purpose","Spirituality","Tradition","Innovation","Simplicity",
  "Joy","Humor","Optimism","Resilience","Perseverance","Determination","Focus","Mindfulness","Presence","Beauty",
  "Nature","Stewardship","Sustainability","Prosperity","Abundance","Influence","Recognition","Status","Competence","Mastery",
  "Efficiency","Productivity","Quality","Precision","Order","Flexibility","Adaptability","Spontaneity","Playfulness","Friendship",
  "Connection","Belonging","Intimacy","Romance","Trust","Devotion","Acceptance","Inclusion","Equality","Diversity",
  "Privacy","Autonomy","Challenge","Discovery","Exploration","Knowledge","Truth","Insight","Imagination","Expression",
  "Contribution","Impact","Legacy","Citizenship","Patriotism","Altruism","Mercy","Grace","Dignity","Honor",
  "Temperance","Prudence","Fortitude","Reverence","Wonder","Contentment","Vitality","Enthusiasm","Ambition","Boldness"
];
const defaultVideos = [{ id: "HW19Q6F3-3Q", title: "Course Introduction" }];
const defaultContent = {
  homeEyebrow: "A PROCESS FOR MAKING GOD-HONORING DECISIONS",
  homeTitle: "Find clarity for what comes next.",
  homeLead: "This course will challenge you to put your faith in action.",
  courseSubtitle: "A Practical Guide to God-Honoring Decisions.",
  courseIntroOne: "We have all asked and answered “What should I do?” thousands of times each day. We all want to make great decisions, but something happens between our good intentions and the choices we actually make.",
  courseIntroTwo: "In this course, you will study great decision makers like Abraham, David, and Peter. You will learn a practical process for making God-honoring decisions that will help you live a transformed life.",
  preworkIntro: "Begin by reading and reflecting on two Scripture passages. Each reading opens the complete chapter in the English Standard Version."
};
let videos = loadJson(VIDEOS_KEY, defaultVideos);
let toastTimer;

function loadJson(key, fallback){try{const value=JSON.parse(localStorage.getItem(key));return value||fallback;}catch{return fallback;}}
function escapeHtml(value){const div=document.createElement("div");div.textContent=value;return div.innerHTML;}
function getVideoId(value){try{const url=new URL(value);let id="";if(url.hostname==="youtu.be")id=url.pathname.split("/")[1];if(url.hostname==="youtube.com"||url.hostname.endsWith(".youtube.com"))id=url.searchParams.get("v")||url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]||"";return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:"";}catch{return"";}}
function showToast(message){const toast=document.getElementById("adminToast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),1600);}

function loadValueInventory(){
  const saved=loadJson(CARD_CONTENT_KEY,[]);
  return DEFAULT_VALUE_WORDS.map((original,index)=>{
    const custom=Array.isArray(saved)?saved.find(card=>Number(card?.id)===index+1):null;
    return{id:index+1,value:String(custom?.question||original).trim()||original};
  });
}
function renderValueInventory(){
  const values=loadValueInventory();
  document.getElementById("adminValueCount").textContent=`${values.length} values`;
  document.getElementById("adminValuesList").innerHTML=values.map(card=>`<li><span>${String(card.id).padStart(3,"0")}</span><strong>${escapeHtml(card.value)}</strong></li>`).join("");
}
function csvCell(value){
  let text=String(value??"");
  if(/^[=+\-@]/.test(text))text=`'${text}`;
  return `"${text.replace(/"/g,'""')}"`;
}
function downloadValueInventory(){
  const rows=[["Card","Value"],...loadValueInventory().map(card=>[card.id,card.value])];
  const csv=`\ufeff${rows.map(row=>row.map(csvCell).join(",")).join("\r\n")}`;
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");
  link.href=url;link.download="what-should-i-do-values.csv";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  showToast("Values list downloaded");
}
document.getElementById("downloadValues").addEventListener("click",downloadValueInventory);
renderValueInventory();
window.AppCloud?.ready?.then(renderValueInventory);

function renderVideos(){document.getElementById("videoCount").textContent=`${videos.length} ${videos.length===1?"video":"videos"}`;document.getElementById("adminVideoList").innerHTML=videos.length?videos.map((video,index)=>`<article><span>${String(index+1).padStart(2,"0")}</span><div><strong>${escapeHtml(video.title)}</strong><small>youtube.com/watch?v=${video.id}</small></div><button type="button" data-remove-video="${index}" aria-label="Remove ${escapeHtml(video.title)}">Remove</button></article>`).join(""):'<p class="audit-empty">No course videos added.</p>';}
document.getElementById("adminVideoForm").addEventListener("submit",event=>{event.preventDefault();const data=new FormData(event.currentTarget),id=getVideoId(String(data.get("url")).trim()),error=document.getElementById("adminVideoError");if(!id){error.textContent="Enter a valid YouTube link.";return;}error.textContent="";videos.push({id,title:String(data.get("title")).trim()});localStorage.setItem(VIDEOS_KEY,JSON.stringify(videos));event.currentTarget.reset();renderVideos();showToast("Video added");});
document.getElementById("adminVideoList").addEventListener("click",event=>{const button=event.target.closest("[data-remove-video]");if(!button)return;videos.splice(Number(button.dataset.removeVideo),1);localStorage.setItem(VIDEOS_KEY,JSON.stringify(videos));renderVideos();showToast("Video removed");});

const contentForm=document.getElementById("adminContentForm");
function populateContent(){const saved={...defaultContent,...loadJson(CONTENT_KEY,{})};Object.entries(saved).forEach(([key,value])=>{if(contentForm.elements[key])contentForm.elements[key].value=value;});}
contentForm.addEventListener("submit",event=>{event.preventDefault();const content={};Object.keys(defaultContent).forEach(key=>content[key]=contentForm.elements[key].value.trim());localStorage.setItem(CONTENT_KEY,JSON.stringify(content));showToast("Website content saved");});
document.getElementById("resetSiteContent").addEventListener("click",()=>{if(!confirm("Restore all editable website copy to its original content?"))return;localStorage.removeItem(CONTENT_KEY);populateContent();showToast("Original content restored");});
renderVideos();populateContent();

const facilitationForm=document.getElementById("adminFacilitationForm"),facilitationStage=document.getElementById("facilitationStage"),facilitationItem=document.getElementById("facilitationItem"),facilitationPreview=document.getElementById("previewFacilitationItem");
let facilitationContent=loadJson(FACILITATION_ADMIN_KEY,{});
function facilitationKey(){return `${facilitationStage.value}-${facilitationItem.value}`;}
function populateFacilitation(){const saved=facilitationContent[facilitationKey()]||{};["heading","body","scripture","questions","takeaway"].forEach(name=>facilitationForm.elements[name].value=saved[name]||"");facilitationPreview.href=`facilitation-item?stage=${facilitationStage.value}&item=${facilitationItem.value}`;}
facilitationStage.addEventListener("change",populateFacilitation);facilitationItem.addEventListener("change",populateFacilitation);
facilitationForm.addEventListener("submit",event=>{event.preventDefault();facilitationContent[facilitationKey()]={heading:facilitationForm.elements.heading.value.trim(),body:facilitationForm.elements.body.value.trim(),scripture:facilitationForm.elements.scripture.value.trim(),questions:facilitationForm.elements.questions.value.trim(),takeaway:facilitationForm.elements.takeaway.value.trim()};localStorage.setItem(FACILITATION_ADMIN_KEY,JSON.stringify(facilitationContent));showToast("Self-paced lesson saved");});
document.getElementById("clearFacilitationContent").addEventListener("click",()=>{delete facilitationContent[facilitationKey()];localStorage.setItem(FACILITATION_ADMIN_KEY,JSON.stringify(facilitationContent));populateFacilitation();showToast("Default page restored");});
populateFacilitation();
