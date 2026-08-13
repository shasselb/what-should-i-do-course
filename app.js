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
let cards=loadCardContent();
const TOTAL=cards.length;
let state=loadState();
let toastTimer;
let reviewingPile="";
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

function freshState(){return{queue:cards.map(c=>c.id),piles:{learning:[],unsure:[],known:[]},history:[],revealed:false,confirmedAt:"",confirmedValues:[]};}
function loadState(){
  try{
    const value=JSON.parse(localStorage.getItem(KEY));
    if(!value?.queue||!value?.piles)return freshState();
    const assigned=new Set([...value.queue,...value.piles.learning,...value.piles.unsure,...value.piles.known]);
    cards.forEach(card=>{if(!assigned.has(card.id))value.queue.push(card.id);});
    value.history=value.history||[]; value.revealed=false; value.confirmedAt=value.confirmedAt||""; value.confirmedValues=value.confirmedValues||[];
    return value;
  }catch{return freshState();}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function current(){return cards.find(c=>c.id===state.queue[0]);}
function render(){
  const sorted=TOTAL-state.queue.length, percent=Math.round(sorted/TOTAL*100), card=current();
  $("progressLabel").textContent=`${sorted} of ${TOTAL} sorted`; $("progressPercent").textContent=`${percent}%`; $("progressBar").style.width=`${percent}%`;
  $("learningCount").textContent=state.piles.learning.length; $("unsureCount").textContent=state.piles.unsure.length; $("knownCount").textContent=state.piles.known.length;
  $("confirmValuesButton").disabled=!state.piles.known.length; $("confirmValuesButton").textContent=state.confirmedAt?"✓ Values confirmed":"Confirm my values";
  $("undoButton").disabled=!state.history.length; activeCard.hidden=!card; completeCard.hidden=!!card;
  if(card){$("cardNumber").textContent=`CARD ${String(card.id).padStart(2,"0")}`;$("cardCategory").textContent=card.category.toUpperCase();$("cardQuestion").textContent=card.question;$("cardAnswer").textContent=card.answer;$("cardAnswer").hidden=!state.revealed;$("revealButton").innerHTML=state.revealed?'Hide answer <span aria-hidden="true">↑</span>':'Reveal answer <span aria-hidden="true">↓</span>';$("remainingCount").textContent=state.queue.length;activeCard.focus({preventScroll:true});}
  save();
}
function sortInto(pile){
  const card=current(); if(!card)return;
  const animation={learning:"sorting-left",unsure:"sorting-up",known:"sorting-right"}[pile]; activeCard.classList.add(animation);
  setTimeout(()=>{state.queue.shift();state.piles[pile].push(card.id);state.history.push({id:card.id,pile});if(pile==="known"){state.confirmedAt="";state.confirmedValues=[];}state.revealed=false;activeCard.classList.remove(animation);render();},190);
}
function undo(){const move=state.history.pop();if(!move)return;state.piles[move.pile]=state.piles[move.pile].filter(id=>id!==move.id);if(move.type==="reclassify"){state.piles[move.source].push(move.id);}else{state.queue.unshift(move.id);}if(move.pile==="known"||move.source==="known"){state.confirmedAt="";state.confirmedValues=[];}state.revealed=false;showToast("Last move undone");render();}
function reset(){if(TOTAL-state.queue.length&&!confirm("Start over and clear all three piles?"))return;state=freshState();render();showToast("Deck reset");}
function shuffle(){for(let i=state.queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.queue[i],state.queue[j]]=[state.queue[j],state.queue[i]];}state.revealed=false;render();showToast("Remaining cards shuffled");}
function showToast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1500);}
function escapeHtml(value){const el=document.createElement("div");el.textContent=value;return el.innerHTML;}
function showPile(pile){const names={learning:"No",unsure:"Maybe",known:"Yes"},ids=state.piles[pile],destinations=Object.keys(names).filter(name=>name!==pile);reviewingPile=pile;$("modalTitle").textContent=names[pile];$("reviewList").innerHTML=ids.length?ids.map(id=>{const c=cards.find(x=>x.id===id);return `<div class="review-item"><div class="review-copy"><strong>${escapeHtml(c.question)}</strong><span>${escapeHtml(c.answer)}</span></div><div class="move-actions"><small>Move to</small>${destinations.map(target=>`<button type="button" data-move-id="${id}" data-move-target="${target}">${names[target]}</button>`).join("")}</div></div>`;}).join(""):'<p class="empty">No cards in this pile yet.</p>';if(!$("reviewDialog").open)$("reviewDialog").showModal();}
function moveBetweenPiles(id,target){const source=reviewingPile;if(!source||source===target||!state.piles[source].includes(id))return;state.piles[source]=state.piles[source].filter(cardId=>cardId!==id);state.piles[target].push(id);state.history.push({id,pile:target,source,type:"reclassify"});if(source==="known"||target==="known"){state.confirmedAt="";state.confirmedValues=[];}render();showPile(source);showToast(`Moved to ${{learning:"No",unsure:"Maybe",known:"Yes"}[target]}`);}
function confirmValues(){if(!state.piles.known.length){showToast("Add at least one value to Yes");return;}state.confirmedAt=new Date().toISOString();state.confirmedValues=state.piles.known.map(id=>cards.find(card=>card.id===id)?.question).filter(Boolean);render();showPile("known");showToast(`${state.piles.known.length} values confirmed`);}
function loadEditorCard(){const input=$("adminCardSelect"),card=cards.find(item=>item.id===Number(input.value));if(!card){input.setCustomValidity(`Enter a card number from 1 to ${TOTAL}.`);input.reportValidity();return;}input.setCustomValidity("");$("adminCategory").value=card.category;$("adminQuestion").value=card.question;$("adminAnswer").value=card.answer;}
function openAdmin(){const active=current();$("adminCardSelect").value=String(active?.id||1);loadEditorCard();$("adminDialog").showModal();}
function saveEditorCard(event){event.preventDefault();const id=Number($("adminCardSelect").value),card=cards.find(item=>item.id===id);if(!card)return;card.category=$("adminCategory").value.trim();card.question=$("adminQuestion").value.trim();card.answer=$("adminAnswer").value.trim();saveCardContent();render();showToast(`Card ${id} saved`);if(id<TOTAL){$("adminCardSelect").value=String(id+1);loadEditorCard();}else{$("adminDialog").close();}}
function restoreEditorCard(){const id=Number($("adminCardSelect").value),original=defaultCards.find(card=>card.id===id),index=cards.findIndex(card=>card.id===id);cards[index]={...original};saveCardContent();loadEditorCard();render();showToast(`Card ${id} restored`);}

document.querySelectorAll(".pile").forEach(el=>{el.querySelector(".pile-sort").addEventListener("click",()=>sortInto(el.dataset.pile));el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drag-over")});el.addEventListener("dragleave",()=>el.classList.remove("drag-over"));el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drag-over");sortInto(el.dataset.pile)});});
document.querySelectorAll("[data-view-pile]").forEach(button=>button.addEventListener("click",()=>showPile(button.dataset.viewPile)));
$("reviewList").addEventListener("click",event=>{const button=event.target.closest("[data-move-id]");if(button)moveBetweenPiles(Number(button.dataset.moveId),button.dataset.moveTarget);});
activeCard.addEventListener("dragstart",()=>activeCard.classList.add("dragging"));activeCard.addEventListener("dragend",()=>{activeCard.classList.remove("dragging");document.querySelectorAll(".pile").forEach(p=>p.classList.remove("drag-over"));});
$("revealButton").addEventListener("click",e=>{e.stopPropagation();state.revealed=!state.revealed;render();});$("undoButton").addEventListener("click",undo);$("resetButton").addEventListener("click",reset);$("shuffleButton").addEventListener("click",shuffle);$("reviewButton").addEventListener("click",()=>showPile("learning"));$("closeDialog").addEventListener("click",()=>$("reviewDialog").close());
$("adminButton").addEventListener("click",openAdmin);$("closeAdminDialog").addEventListener("click",()=>$("adminDialog").close());$("adminCardSelect").addEventListener("change",loadEditorCard);$("cardEditorForm").addEventListener("submit",saveEditorCard);$("restoreCardButton").addEventListener("click",restoreEditorCard);
$("confirmValuesButton").addEventListener("click",confirmValues);
document.addEventListener("keydown",e=>{if($("reviewDialog").open||$("adminDialog").open)return;if(e.key==="1")sortInto("learning");if(e.key==="2")sortInto("unsure");if(e.key==="3")sortInto("known");if(e.key.toLowerCase()==="z"&&!e.metaKey&&!e.ctrlKey)undo();if(e.key===" "&&e.target===activeCard){e.preventDefault();state.revealed=!state.revealed;render();}});
render();
