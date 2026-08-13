const AUDIT_KEY = "what-should-i-do-time-audit-v1";
const categories = ["Sleep","Work","Read the Bible","Serve","Family","Workout","Learning","Cooking/Cleaning/House Work","Leisure","Social Media","Commute/Travel","Other"];
const colors = {Sleep:"#6f7f99",Work:"#2f7257","Read the Bible":"#8d6f9e",Serve:"#b98345",Family:"#c17d52",Workout:"#5d9b8b",Learning:"#4e79a7","Cooking/Cleaning/House Work":"#9b8f78",Leisure:"#d29f4b","Social Media":"#6f64a8","Commute/Travel":"#b7695c",Other:"#888b84"};
let entries = loadEntries();
const $ = id => document.getElementById(id);

function loadEntries(){try{return (JSON.parse(localStorage.getItem(AUDIT_KEY))||[]).map(entry=>{if(entry.category==="Health")return{...entry,category:"Workout"};if(entry.category==="Travel")return{...entry,category:"Commute/Travel"};if(entry.category==="Faith")return{...entry,category:"Read the Bible"};if(entry.category==="Chores")return{...entry,category:"Cooking/Cleaning/House Work"};return entry;});}catch{return[];}}
function saveEntries(){localStorage.setItem(AUDIT_KEY,JSON.stringify(entries));}
function localDateString(date=new Date()){const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,10);}
function currentMonth(){return localDateString().slice(0,7);}
function selectedEntries(){return entries.filter(entry=>entry.date.startsWith($("auditMonth").value));}
function formatHours(value){return `${Number(value.toFixed(2))}h`;}
function escapeHtml(value){const div=document.createElement("div");div.textContent=value;return div.innerHTML;}

function render(){
  const monthEntries=selectedEntries(), total=monthEntries.reduce((sum,e)=>sum+e.hours,0), days=new Set(monthEntries.map(e=>e.date));
  const totals=Object.fromEntries(categories.map(category=>[category,0]));monthEntries.forEach(entry=>totals[entry.category]=(totals[entry.category]||0)+entry.hours);
  const sortedCategories=Object.entries(totals).filter(([,hours])=>hours>0).sort((a,b)=>b[1]-a[1]);
  $("totalHours").textContent=formatHours(total);$("topCategory").textContent=sortedCategories[0]?.[0]||"—";$("topCategoryHours").textContent=sortedCategories[0]?`${formatHours(sortedCategories[0][1])} tracked`:"No entries yet";$("dailyAverage").textContent=formatHours(days.size?total/days.size:0);$("daysLogged").textContent=days.size;
  const [year,month]=$("auditMonth").value.split("-").map(Number), daysInMonth=new Date(year,month,0).getDate();$("daysRemaining").textContent=days.size?`${Math.max(0,daysInMonth-days.size)} days not logged`:"Start your audit";$("entryCount").textContent=`${monthEntries.length} ${monthEntries.length===1?"entry":"entries"}`;
  $("categoryChart").innerHTML=sortedCategories.length?sortedCategories.map(([category,hours])=>`<div class="category-row"><div><span><i style="background:${colors[category]||colors.Other}"></i>${category}</span><strong>${formatHours(hours)} · ${Math.round(hours/total*100)}%</strong></div><div class="audit-bar"><i style="width:${hours/sortedCategories[0][1]*100}%;background:${colors[category]||colors.Other}"></i></div></div>`).join(""):'<p class="audit-empty">Log your first activity to see your time pattern.</p>';
  const weekdayTotals=Array(7).fill(0),weekdayDays=Array.from({length:7},()=>new Set());monthEntries.forEach(entry=>{const day=new Date(`${entry.date}T12:00:00`).getDay();weekdayTotals[day]+=entry.hours;weekdayDays[day].add(entry.date);});const averages=weekdayTotals.map((hours,i)=>weekdayDays[i].size?hours/weekdayDays[i].size:0),maxAvg=Math.max(...averages,1),names=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  $("weekdayChart").innerHTML=averages.map((hours,i)=>`<div class="weekday-column"><span>${hours?formatHours(hours):"—"}</span><div><i style="height:${hours/maxAvg*100}%"></i></div><small>${names[i]}</small></div>`).join("");
  $("auditLog").innerHTML=monthEntries.length?[...monthEntries].sort((a,b)=>b.date.localeCompare(a.date)).map(entry=>`<article class="audit-log-row"><time datetime="${entry.date}"><strong>${new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</strong><small>${new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined,{weekday:"short"})}</small></time><i style="background:${colors[entry.category]||colors.Other}"></i><div><strong>${escapeHtml(entry.category)}</strong><span>${escapeHtml(entry.note||"No details added")}</span></div><b>${formatHours(entry.hours)}</b><button type="button" data-delete-entry="${entry.id}" aria-label="Delete entry">×</button></article>`).join(""):'<p class="audit-empty">No activities logged for this month.</p>';
}

$("auditMonth").value=currentMonth();$("entryDate").value=localDateString();
$("auditMonth").addEventListener("change",()=>{if(!$("auditMonth").value)$("auditMonth").value=currentMonth();const today=localDateString();$("entryDate").value=today.startsWith($("auditMonth").value)?today:`${$("auditMonth").value}-01`;render();});
$("auditForm").addEventListener("submit",event=>{event.preventDefault();const data=new FormData(event.currentTarget),date=String(data.get("date"));if(!date.startsWith($("auditMonth").value)){$("auditMonth").value=date.slice(0,7);}entries.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),date,category:String(data.get("category")),hours:Number(data.get("hours")),note:String(data.get("note")).trim()});saveEntries();event.currentTarget.elements.hours.value="";event.currentTarget.elements.note.value="";render();});
$("auditLog").addEventListener("click",event=>{const button=event.target.closest("[data-delete-entry]");if(!button)return;entries=entries.filter(entry=>entry.id!==button.dataset.deleteEntry);saveEntries();render();});
$("clearAudit").addEventListener("click",()=>{const month=$("auditMonth").value;if(!selectedEntries().length)return;if(confirm("Clear every Time Audit entry for this month?")){entries=entries.filter(entry=>!entry.date.startsWith(month));saveEntries();render();}});
render();
