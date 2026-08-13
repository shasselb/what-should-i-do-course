const valueWords = [
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
const valueDefinitions = [
  "Acting consistently with strong moral principles.","Caring about suffering and wanting to help.","Facing fear or difficulty despite uncertainty.","Speaking and acting truthfully.","Remaining faithful to people, commitments, or causes.","Treating others with dignity and consideration.","Choosing to be helpful, caring, and considerate.","Using knowledge and experience to make sound judgments.","Having the ability to choose and act independently.","Upholding what is fair, right, and equitable.",
  "Trusting deeply in a belief, purpose, or higher power.","Expecting and working toward a positive future.","Caring deeply for someone or something.","Prioritizing close relationships, care, and shared belonging.","Building connection and responsibility with a wider group.","Helping others through useful and caring action.","Developing toward greater maturity, skill, or understanding.","Gaining knowledge, skill, or insight through experience.","Bringing original ideas or meaningful things into being.","Wanting to explore, ask questions, and understand.",
  "Striving to do work of exceptional quality.","Consistently doing what is needed despite distraction.","Owning duties and following through on them.","Accepting ownership for choices and their results.","Being consistently dependable and trustworthy.","Remaining calm while waiting or facing difficulty.","Holding an accurate, modest view of oneself.","Recognizing and appreciating what is good.","Releasing resentment and offering another chance.","Giving time, attention, or resources freely.",
  "Understanding and sharing another person's feelings.","Treating people impartially and without favoritism.","Living without hostility, violence, or inner conflict.","Creating agreement and balance among different parts.","Giving appropriate attention to competing priorities.","Supporting physical, mental, and emotional well-being.","Being protected from danger, loss, or harm.","Creating steadiness, predictability, and firm foundations.","Seeking new, exciting, or uncertain experiences.","Reaching a meaningful goal through effort.",
  "Guiding and inspiring people toward a shared direction.","Working together to create or accomplish something.","Combining individual strengths toward a shared goal.","Relying on one's own judgment and abilities.","Living in a way that reflects one's true self.","Having a meaningful reason that guides action.","Seeking connection with the sacred or transcendent.","Honoring beliefs and practices passed through generations.","Creating and applying useful new ideas.","Focusing on what is essential and uncomplicated.",
  "Experiencing deep happiness and delight.","Finding and sharing amusement in life.","Expecting favorable possibilities and outcomes.","Recovering and adapting after adversity.","Continuing despite obstacles, delay, or discouragement.","Holding firmly to a chosen goal or course.","Directing attention and effort toward what matters.","Paying open, nonjudgmental attention to the present.","Being fully attentive and engaged in the moment.","Appreciating qualities that delight the senses or spirit.",
  "Valuing the living world and natural environment.","Caring responsibly for resources entrusted to us.","Meeting present needs without harming future generations.","Experiencing material well-being and flourishing.","Believing there is enough to share and thrive.","Shaping choices, ideas, or outcomes through one's example.","Being seen and appreciated for effort or contribution.","Holding a respected social or professional position.","Having the skill and ability to perform effectively.","Achieving deep command of a skill or subject.",
  "Producing desired results with minimal wasted effort.","Turning time and effort into meaningful results.","Maintaining a high standard of value and workmanship.","Being exact, accurate, and careful in detail.","Creating structure, arrangement, and predictability.","Adjusting willingly when circumstances or needs change.","Responding effectively to new conditions.","Acting naturally without excessive planning.","Approaching life with fun, imagination, and lightness.","Sharing mutual affection, trust, and support.",
  "Feeling meaningfully linked to people or purpose.","Feeling accepted as part of a group or place.","Sharing deep emotional closeness and vulnerability.","Expressing affectionate and passionate partnership.","Relying confidently on someone's honesty and dependability.","Giving steadfast love, loyalty, or commitment.","Welcoming reality or people without rejection.","Ensuring people feel welcomed, valued, and involved.","Providing equal rights, dignity, and opportunity.","Valuing differences in identity, experience, and perspective.",
  "Protecting personal information, space, and boundaries.","Directing one's own life and making independent choices.","Taking on difficulty that invites effort and growth.","Finding or learning something previously unknown.","Traveling through ideas or places to learn and experience.","Understanding gained through study or experience.","Being aligned with fact, reality, and sincerity.","Seeing clearly into the meaning of a situation.","Forming new ideas and possibilities in the mind.","Communicating thoughts, feelings, or identity outwardly.",
  "Giving something valuable to a larger effort.","Creating a meaningful effect or lasting difference.","Leaving enduring value for those who follow.","Participating responsibly in the life of a community.","Showing committed love and support for one's country.","Acting selflessly for the well-being of others.","Showing compassion instead of harsh judgment.","Offering kindness, favor, or dignity without earning.","Recognizing the inherent worth of every person.","Living by principles worthy of respect.",
  "Practicing moderation and self-restraint.","Using careful judgment about future consequences.","Showing strength and courage through adversity.","Feeling and showing deep respect for what is sacred.","Experiencing awe, curiosity, and amazement.","Feeling peaceful satisfaction with what one has.","Living with physical and emotional energy.","Showing eager interest, excitement, and engagement.","Pursuing significant goals with strong desire.","Acting confidently and willingly taking meaningful risks."
];
const defaultCards = valueWords.map((value,index)=>({id:index+1,category:"Value",question:value,answer:valueDefinitions[index]}));

const KEY="sortly-state-v1";
const CARD_CONTENT_KEY="sortly-card-content-v3";
const PILE_NAMES={learning:"No",unsure:"Maybe",known:"Yes"};
let cards=loadCardContent();
const TOTAL=cards.length;
let state=loadState();
let toastTimer;
let reviewingPile="";
let draggingReviewCardId=0;
let finalizingValues=false;
const $=id=>document.getElementById(id);
const activeCard=$("activeCard"), completeCard=$("completeCard");

function loadCardContent(){
  try{
    const saved=JSON.parse(localStorage.getItem(CARD_CONTENT_KEY));
    if(!Array.isArray(saved))return defaultCards.map(card=>({...card}));
    return defaultCards.map(original=>{const custom=saved.find(card=>card.id===original.id);return custom?{...original,category:custom.category,question:custom.question,answer:custom.answer}:{...original};});
  }catch{return defaultCards.map(card=>({...card}));}
}
function saveCardContent(){localStorage.setItem(CARD_CONTENT_KEY,JSON.stringify(cards));}

function emptyGroups(){return{learning:[],unsure:[],known:[]};}
function freshState(){return{queue:cards.map(c=>c.id),piles:{learning:[],unsure:[],known:[]},groups:emptyGroups(),history:[],revealed:false,confirmedAt:"",confirmedValues:[],finalizedGroups:[],valueActions:{}};}
function normalizeGroups(value){
  const normalized=emptyGroups();
  Object.keys(PILE_NAMES).forEach(pile=>{
    const validCards=new Set(value.piles[pile]);
    const claimed=new Set();
    const source=Array.isArray(value.groups?.[pile])?value.groups[pile]:[];
    normalized[pile]=source.flatMap((group,index)=>{
      const name=String(group?.name||"").trim().slice(0,50);
      if(!name)return[];
      const cardIds=(Array.isArray(group.cardIds)?group.cardIds:[]).filter(id=>validCards.has(id)&&!claimed.has(id)&&claimed.add(id));
      return[{id:String(group.id||`${pile}-${index+1}`),name,cardIds}];
    });
  });
  return normalized;
}
function loadState(){
  try{
    const value=JSON.parse(localStorage.getItem(KEY));
    if(!value?.queue||!value?.piles)return freshState();
    const assigned=new Set([...value.queue,...value.piles.learning,...value.piles.unsure,...value.piles.known]);
    cards.forEach(card=>{if(!assigned.has(card.id))value.queue.push(card.id);});
    value.groups=normalizeGroups(value); value.history=value.history||[]; value.revealed=false; value.confirmedAt=value.confirmedAt||""; value.confirmedValues=value.confirmedValues||[]; value.finalizedGroups=Array.isArray(value.finalizedGroups)?value.finalizedGroups:[]; value.valueActions=value.valueActions&&typeof value.valueActions==="object"?value.valueActions:{};
    return value;
  }catch{return freshState();}
}
function save(syncImmediately=false){localStorage.setItem(KEY,JSON.stringify(state));if(syncImmediately)window.AppCloud.syncNow();}
function current(){return cards.find(c=>c.id===state.queue[0]);}
function clearFinalization(){state.confirmedAt="";state.confirmedValues=[];state.finalizedGroups=[];}
function render(syncImmediately=false){
  const sorted=TOTAL-state.queue.length, percent=Math.round(sorted/TOTAL*100), card=current();
  $("progressLabel").textContent=`${sorted} of ${TOTAL} sorted`; $("progressPercent").textContent=`${percent}%`; $("progressBar").style.width=`${percent}%`;
  $("learningCount").textContent=state.piles.learning.length; $("unsureCount").textContent=state.piles.unsure.length; $("knownCount").textContent=state.piles.known.length;
  $("confirmValuesButton").disabled=!state.piles.known.length||!!state.queue.length; $("confirmValuesButton").textContent=state.confirmedAt?"View finalized values":"Finalize my values";
  $("undoButton").disabled=!state.history.length; activeCard.hidden=!card; completeCard.hidden=!!card;
  if(card){$("cardNumber").textContent=`CARD ${String(card.id).padStart(2,"0")}`;$("cardCategory").textContent=card.category.toUpperCase();$("cardQuestion").textContent=card.question;$("cardAnswer").textContent=card.answer;$("cardAnswer").hidden=!state.revealed;$("revealButton").innerHTML=state.revealed?'Hide answer <span aria-hidden="true">↑</span>':'Reveal answer <span aria-hidden="true">↓</span>';$("remainingCount").textContent=state.queue.length;activeCard.focus({preventScroll:true});}
  save(syncImmediately);
}
function sortInto(pile){
  const card=current(); if(!card)return;
  const animation={learning:"sorting-left",unsure:"sorting-up",known:"sorting-right"}[pile]; activeCard.classList.add(animation);
  setTimeout(()=>{state.queue.shift();state.piles[pile].push(card.id);state.history.push({id:card.id,pile});if(pile==="known")clearFinalization();state.revealed=false;activeCard.classList.remove(animation);render(true);},190);
}
function undo(){const move=state.history.pop();if(!move)return;state.piles[move.pile]=state.piles[move.pile].filter(id=>id!==move.id);removeCardFromGroups(move.pile,move.id);if(move.type==="reclassify"){state.piles[move.source].push(move.id);if(move.sourceGroupId){const group=getGroups(move.source).find(item=>item.id===move.sourceGroupId);if(group)group.cardIds.push(move.id);}}else{state.queue.unshift(move.id);}if(move.pile==="known"||move.source==="known")clearFinalization();state.revealed=false;showToast("Last move undone");render(true);}
function reset(){if(TOTAL-state.queue.length&&!confirm("Start over and clear all three piles?"))return;state=freshState();render(true);showToast("Deck reset");}
function shuffle(){for(let i=state.queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.queue[i],state.queue[j]]=[state.queue[j],state.queue[i]];}state.revealed=false;render(true);showToast("Remaining cards shuffled");}
function showToast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1500);}
function setSaveStatus(status,message){const control=$("saveStatus");control.dataset.state=status;control.disabled=status!=="error";$("saveStatusIcon").textContent={loading:"↻",saving:"↻",saved:"✓",error:"!"}[status]||"↻";$("saveStatusText").textContent=message;}
function escapeHtml(value){const el=document.createElement("div");el.textContent=value;return el.innerHTML;}
function getGroups(pile){return state.groups[pile]||(state.groups[pile]=[]);}
function groupForCard(pile,id){return getGroups(pile).find(group=>group.cardIds.includes(id));}
function removeCardFromGroups(pile,id){const group=groupForCard(pile,id);getGroups(pile).forEach(item=>item.cardIds=item.cardIds.filter(cardId=>cardId!==id));return group?.id||"";}
function groupOptions(pile,selectedId){return `<option value="">Ungrouped</option>${getGroups(pile).map(group=>`<option value="${escapeHtml(group.id)}"${group.id===selectedId?" selected":""}>${escapeHtml(group.name)}</option>`).join("")}`;}
function reviewCardHtml(id,pile){
  const card=cards.find(item=>item.id===id),selectedGroup=groupForCard(pile,id)?.id||"",destinations=Object.keys(PILE_NAMES).filter(name=>name!==pile);
  const sectionIds=state.piles[pile].filter(cardId=>(groupForCard(pile,cardId)?.id||"")===selectedGroup),position=sectionIds.indexOf(id);
  return `<article class="review-item" draggable="true" data-card-id="${id}"><span class="review-drag" aria-hidden="true">⠿</span><div class="review-copy"><strong>${escapeHtml(card.question)}</strong><span>${escapeHtml(card.answer)}</span></div><div class="review-card-actions"><label class="group-select"><span>Group</span><select data-group-card="${id}" aria-label="Group ${escapeHtml(card.question)}">${groupOptions(pile,selectedGroup)}</select></label><div class="order-actions"><small>Order</small><button type="button" data-order-id="${id}" data-order-direction="up" aria-label="Move ${escapeHtml(card.question)} up"${position<=0?" disabled":""}>↑</button><button type="button" data-order-id="${id}" data-order-direction="down" aria-label="Move ${escapeHtml(card.question)} down"${position===sectionIds.length-1?" disabled":""}>↓</button></div><div class="move-actions"><small>Move to</small>${destinations.map(target=>`<button type="button" data-move-id="${id}" data-move-target="${target}">${PILE_NAMES[target]}</button>`).join("")}</div></div></article>`;
}
function reviewGroupHtml(pile,group,ids){
  const groupId=group?.id||"",title=group?.name||"Ungrouped",actions=group?`<div class="review-group-actions"><button type="button" data-rename-group="${escapeHtml(group.id)}">Rename</button><button type="button" data-delete-group="${escapeHtml(group.id)}">Remove</button></div>`:"";
  return `<section class="review-group" data-group-drop data-group-id="${escapeHtml(groupId)}"><div class="review-group-head"><div class="review-group-title"><h3>${escapeHtml(title)}</h3><span class="review-group-count">${ids.length}</span></div>${actions}</div>${ids.length?ids.map(id=>reviewCardHtml(id,pile)).join(""):'<p class="review-group-empty">Drag values here</p>'}</section>`;
}
function showPile(pile){
  const ids=state.piles[pile],groups=getGroups(pile),grouped=new Set(groups.flatMap(group=>group.cardIds));
  reviewingPile=pile;$("modalTitle").textContent=PILE_NAMES[pile];
  const ungrouped=ids.filter(id=>!grouped.has(id));
  $("reviewList").innerHTML=reviewGroupHtml(pile,null,ungrouped)+groups.map(group=>reviewGroupHtml(pile,group,ids.filter(id=>group.cardIds.includes(id)))).join("");
  updateFinalizePanel();
  if(!$("reviewDialog").open)$("reviewDialog").showModal();
}
function updateFinalizePanel(){
  const isYes=reviewingPile==="known",remaining=state.queue.length,hasValues=state.piles.known.length>0;
  $("finalizeValuesPanel").hidden=!isYes;
  if(!isYes)return;
  $("finalizeValuesTitle").textContent=state.confirmedAt?"Your list is finalized":remaining?`${remaining} cards still need sorting`:"Ready to finalize?";
  $("finalizeValuesMessage").textContent=state.confirmedAt?"Open your published list to continue the exercise.":remaining?"Finish sorting the deck before you publish your final list.":"Group similar values if helpful, then publish your list for the next part of the exercise.";
  $("finalizeValuesButton").disabled=!hasValues||!!remaining;
  $("finalizeValuesButton").innerHTML=state.confirmedAt?'View my values <span aria-hidden="true">→</span>':'Finalize my values <span aria-hidden="true">→</span>';
}
function moveBetweenPiles(id,target){const source=reviewingPile;if(!source||source===target||!state.piles[source].includes(id))return;const sourceGroupId=removeCardFromGroups(source,id);state.piles[source]=state.piles[source].filter(cardId=>cardId!==id);state.piles[target].push(id);state.history.push({id,pile:target,source,sourceGroupId,type:"reclassify"});if(source==="known"||target==="known")clearFinalization();render(true);showPile(source);showToast(`Moved to ${PILE_NAMES[target]}`);}
function createGroup(event){event.preventDefault();const input=$("groupName"),name=input.value.trim();if(!name||!reviewingPile)return;if(getGroups(reviewingPile).some(group=>group.name.toLowerCase()===name.toLowerCase())){showToast("That group already exists");return;}getGroups(reviewingPile).push({id:`group-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,cardIds:[]});if(reviewingPile==="known")clearFinalization();input.value="";render(true);showPile(reviewingPile);showToast(`Group “${name}” added`);}
function renameGroup(id){const group=getGroups(reviewingPile).find(item=>item.id===id);if(!group)return;const name=prompt("Rename this group:",group.name)?.trim();if(!name)return;group.name=name.slice(0,50);if(reviewingPile==="known")clearFinalization();render(true);showPile(reviewingPile);showToast("Group renamed");}
function deleteGroup(id){const groups=getGroups(reviewingPile),group=groups.find(item=>item.id===id);if(!group||!confirm(`Remove the “${group.name}” group? Its values will become ungrouped.`))return;state.groups[reviewingPile]=groups.filter(item=>item.id!==id);if(reviewingPile==="known")clearFinalization();render(true);showPile(reviewingPile);showToast("Group removed");}
function assignCardToGroup(id,groupId){if(!state.piles[reviewingPile]?.includes(id))return;removeCardFromGroups(reviewingPile,id);const group=getGroups(reviewingPile).find(item=>item.id===groupId);if(group)group.cardIds.push(id);if(reviewingPile==="known")clearFinalization();render(true);showPile(reviewingPile);showToast(group?`Added to ${group.name}`:"Moved to Ungrouped");}
function reorderCard(id,direction){
  const selectedGroup=groupForCard(reviewingPile,id)?.id||"",sectionIds=state.piles[reviewingPile].filter(cardId=>(groupForCard(reviewingPile,cardId)?.id||"")===selectedGroup),position=sectionIds.indexOf(id),swapId=sectionIds[position+(direction==="up"?-1:1)];
  if(!swapId)return;
  const first=state.piles[reviewingPile].indexOf(id),second=state.piles[reviewingPile].indexOf(swapId);
  [state.piles[reviewingPile][first],state.piles[reviewingPile][second]]=[state.piles[reviewingPile][second],state.piles[reviewingPile][first]];
  if(reviewingPile==="known")clearFinalization();
  render(true);showPile(reviewingPile);showToast("Card order updated");
}
function organizeCard(id,groupId,beforeId=0){
  if(!state.piles[reviewingPile]?.includes(id))return;
  removeCardFromGroups(reviewingPile,id);
  const group=getGroups(reviewingPile).find(item=>item.id===groupId);
  if(group)group.cardIds.push(id);
  const ordered=state.piles[reviewingPile].filter(cardId=>cardId!==id);
  const beforeIndex=beforeId&&beforeId!==id?ordered.indexOf(beforeId):-1;
  if(beforeIndex>=0)ordered.splice(beforeIndex,0,id);else ordered.push(id);
  state.piles[reviewingPile]=ordered;
  if(reviewingPile==="known")clearFinalization();
  render(true);showPile(reviewingPile);showToast(group?`Organized in ${group.name}`:"Moved to Ungrouped");
}
function buildFinalizedGroups(){
  const orderedIds=state.piles.known,groups=getGroups("known"),groupedIds=new Set(groups.flatMap(group=>group.cardIds));
  const snapshot=(name,ids)=>({name,values:ids.map(id=>{const card=cards.find(item=>item.id===id);return card?{id:card.id,value:card.question,definition:card.answer,actionVerb:String(state.valueActions[String(id)]||"").trim().slice(0,40)}:null;}).filter(Boolean)});
  const result=[];
  const ungrouped=orderedIds.filter(id=>!groupedIds.has(id));
  if(ungrouped.length)result.push(snapshot("My values",ungrouped));
  groups.forEach(group=>{const ids=orderedIds.filter(id=>group.cardIds.includes(id));if(ids.length)result.push(snapshot(group.name,ids));});
  return result;
}
async function finalizeValues(){
  if(finalizingValues)return;
  if(state.queue.length){showToast(`Sort the remaining ${state.queue.length} cards first`);return;}
  if(!state.piles.known.length){showToast("Add at least one value to Yes");return;}
  if(!state.confirmedAt){
    state.finalizedGroups=buildFinalizedGroups();
    state.confirmedValues=state.finalizedGroups.flatMap(group=>group.values.map(item=>item.value));
    state.confirmedAt=new Date().toISOString();
  }
  finalizingValues=true;
  $("confirmValuesButton").disabled=true;
  $("finalizeValuesButton").disabled=true;
  save();
  setSaveStatus("saving","Publishing your values…");
  let published=false;
  try{published=await window.AppCloud.syncNow();}catch{}
  if(published===false){
    finalizingValues=false;
    render();
    if($("reviewDialog").open)updateFinalizePanel();
    setSaveStatus("error","Publish failed — click to retry");
    showToast("Your list is safe here. Try publishing again.");
    return;
  }
  location.href="my-values.html";
}
function loadEditorCard(){const input=$("adminCardSelect"),card=cards.find(item=>item.id===Number(input.value));if(!card){input.setCustomValidity(`Enter a card number from 1 to ${TOTAL}.`);input.reportValidity();return;}input.setCustomValidity("");$("adminCategory").value=card.category;$("adminQuestion").value=card.question;$("adminAnswer").value=card.answer;}
function openAdmin(){const active=current();$("adminCardSelect").value=String(active?.id||1);loadEditorCard();$("adminDialog").showModal();}
function saveEditorCard(event){event.preventDefault();const id=Number($("adminCardSelect").value),card=cards.find(item=>item.id===id);if(!card)return;card.category=$("adminCategory").value.trim();card.question=$("adminQuestion").value.trim();card.answer=$("adminAnswer").value.trim();saveCardContent();render();showToast(`Card ${id} saved`);if(id<TOTAL){$("adminCardSelect").value=String(id+1);loadEditorCard();}else{$("adminDialog").close();}}
function restoreEditorCard(){const id=Number($("adminCardSelect").value),original=defaultCards.find(card=>card.id===id),index=cards.findIndex(card=>card.id===id);cards[index]={...original};saveCardContent();loadEditorCard();render();showToast(`Card ${id} restored`);}

document.querySelectorAll(".pile").forEach(el=>{el.querySelector(".pile-sort").addEventListener("click",()=>sortInto(el.dataset.pile));el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drag-over")});el.addEventListener("dragleave",()=>el.classList.remove("drag-over"));el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drag-over");sortInto(el.dataset.pile)});});
document.querySelectorAll("[data-view-pile]").forEach(button=>button.addEventListener("click",()=>showPile(button.dataset.viewPile)));
$("groupForm").addEventListener("submit",createGroup);
$("reviewList").addEventListener("click",event=>{const moveButton=event.target.closest("[data-move-id]");if(moveButton){moveBetweenPiles(Number(moveButton.dataset.moveId),moveButton.dataset.moveTarget);return;}const orderButton=event.target.closest("[data-order-id]");if(orderButton){reorderCard(Number(orderButton.dataset.orderId),orderButton.dataset.orderDirection);return;}const renameButton=event.target.closest("[data-rename-group]");if(renameButton){renameGroup(renameButton.dataset.renameGroup);return;}const deleteButton=event.target.closest("[data-delete-group]");if(deleteButton)deleteGroup(deleteButton.dataset.deleteGroup);});
$("reviewList").addEventListener("change",event=>{const select=event.target.closest("[data-group-card]");if(select)assignCardToGroup(Number(select.dataset.groupCard),select.value);});
$("reviewList").addEventListener("dragstart",event=>{const item=event.target.closest("[data-card-id]");if(!item)return;draggingReviewCardId=Number(item.dataset.cardId);item.classList.add("dragging");event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",String(draggingReviewCardId));});
$("reviewList").addEventListener("dragover",event=>{const target=event.target.closest("[data-card-id],[data-group-drop]");if(!target)return;event.preventDefault();$("reviewList").querySelectorAll(".drag-before,.drag-target").forEach(item=>item.classList.remove("drag-before","drag-target"));const card=event.target.closest("[data-card-id]");if(card&&Number(card.dataset.cardId)!==draggingReviewCardId)card.classList.add("drag-before");else target.closest("[data-group-drop]")?.classList.add("drag-target");});
$("reviewList").addEventListener("drop",event=>{const section=event.target.closest("[data-group-drop]");if(!section||!draggingReviewCardId)return;event.preventDefault();const beforeCard=event.target.closest("[data-card-id]");organizeCard(draggingReviewCardId,section.dataset.groupId||"",Number(beforeCard?.dataset.cardId||0));draggingReviewCardId=0;});
$("reviewList").addEventListener("dragend",()=>{draggingReviewCardId=0;$("reviewList").querySelectorAll(".dragging,.drag-before,.drag-target").forEach(item=>item.classList.remove("dragging","drag-before","drag-target"));});
activeCard.addEventListener("dragstart",()=>activeCard.classList.add("dragging"));activeCard.addEventListener("dragend",()=>{activeCard.classList.remove("dragging");document.querySelectorAll(".pile").forEach(p=>p.classList.remove("drag-over"));});
$("revealButton").addEventListener("click",e=>{e.stopPropagation();state.revealed=!state.revealed;render();});$("undoButton").addEventListener("click",undo);$("resetButton").addEventListener("click",reset);$("shuffleButton").addEventListener("click",shuffle);$("reviewButton").addEventListener("click",()=>showPile("known"));$("closeDialog").addEventListener("click",()=>$("reviewDialog").close());
$("adminButton").addEventListener("click",openAdmin);$("closeAdminDialog").addEventListener("click",()=>$("adminDialog").close());$("adminCardSelect").addEventListener("change",loadEditorCard);$("cardEditorForm").addEventListener("submit",saveEditorCard);$("restoreCardButton").addEventListener("click",restoreEditorCard);
$("confirmValuesButton").addEventListener("click",finalizeValues);
$("finalizeValuesButton").addEventListener("click",finalizeValues);
$("saveStatus").addEventListener("click",()=>{if($("saveStatus").dataset.state!=="error")return;setSaveStatus("saving","Saving your progress…");window.AppCloud.syncNow();});
document.addEventListener("cloud-saving",()=>setSaveStatus("saving","Saving your progress…"));
document.addEventListener("cloud-saved",()=>setSaveStatus("saved","Saved to your account"));
document.addEventListener("cloud-save-error",()=>setSaveStatus("error","Save failed — click to retry"));
window.AppCloud.ready.then(app=>{if(app?.session&&app.storageReady!==false)setSaveStatus("saved","Saved to your account");});
document.addEventListener("keydown",e=>{if($("reviewDialog").open||$("adminDialog").open)return;if(e.key==="1")sortInto("learning");if(e.key==="2")sortInto("unsure");if(e.key==="3")sortInto("known");if(e.key.toLowerCase()==="z"&&!e.metaKey&&!e.ctrlKey)undo();if(e.key===" "&&e.target===activeCard){e.preventDefault();state.revealed=!state.revealed;render();}});
render();
