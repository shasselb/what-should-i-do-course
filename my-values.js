(async function () {
  "use strict";

  const ACTION_VERBS = [
    "Achieve", "Act", "Adapt", "Advance", "Advocate", "Affirm", "Align", "Apply", "Appreciate", "Ask",
    "Build", "Care", "Celebrate", "Challenge", "Champion", "Choose", "Clarify", "Collaborate", "Commit", "Communicate",
    "Connect", "Contribute", "Create", "Cultivate", "Decide", "Defend", "Demonstrate", "Design", "Develop", "Discern",
    "Discover", "Embody", "Empower", "Encourage", "Engage", "Equip", "Explore", "Express", "Facilitate", "Focus",
    "Forgive", "Foster", "Give", "Grow", "Guide", "Help", "Honor", "Imagine", "Improve", "Include",
    "Initiate", "Innovate", "Inspire", "Integrate", "Invest", "Invite", "Lead", "Learn", "Listen", "Love",
    "Mentor", "Model", "Motivate", "Nurture", "Organize", "Partner", "Persevere", "Plan", "Practice", "Pray",
    "Prepare", "Prioritize", "Protect", "Provide", "Pursue", "Question", "Reach", "Reflect", "Renew", "Resolve",
    "Respond", "Restore", "Seek", "Serve", "Share", "Simplify", "Speak", "Strengthen", "Study", "Support",
    "Teach", "Thank", "Transform", "Trust", "Understand", "Unite", "Welcome", "Witness", "Work", "Worship"
  ];

  await window.AppCloud.ready;
  const key = "sortly-state-v1";
  const state = loadState();
  const groups = normalizeGroups(state);
  state.finalizedGroups = groups;
  state.valueActions = state.valueActions && typeof state.valueActions === "object" ? state.valueActions : {};
  groups.forEach(group => group.values.forEach(item => {
    const savedAction = String(state.valueActions[item.id] || item.actionVerb || "").trim().slice(0, 40);
    item.actionVerb = savedAction;
    if (savedAction) state.valueActions[item.id] = savedAction;
  }));
  const values = groups.flatMap(group => group.values);
  const empty = document.getElementById("finalValuesEmpty");
  const content = document.getElementById("finalValuesContent");
  const groupContainer = document.getElementById("finalValuesGroups");
  let activeActionInput = null;

  if (!state.confirmedAt || !values.length) {
    document.getElementById("finalValuesIntro").textContent = "Your finalized list will appear here when you complete the values sorting exercise.";
    empty.hidden = false;
    return;
  }

  document.getElementById("finalValuesIntro").textContent = "These are the values you selected to guide the next part of the exercise.";
  document.getElementById("finalValuesCount").textContent = String(values.length);
  document.getElementById("finalValuesDate").textContent = `Finalized ${formatDate(state.confirmedAt)}`;
  document.getElementById("finalValuesSummary").hidden = false;
  groupContainer.innerHTML = groups.map((group, groupIndex) => `
    <section class="final-value-group">
      <div class="final-value-group-head"><div><p class="eyebrow">GROUP ${String(groupIndex + 1).padStart(2, "0")}</p><h2>${escapeHtml(group.name)}</h2></div><span>${group.values.length}</span></div>
      <ol>${group.values.map((item, itemIndex) => `<li><span>${String(itemIndex + 1).padStart(2, "0")}</span><div class="final-value-copy"><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.definition)}</p><label class="action-verb-field"><span>Action verb</span><input data-action-id="${escapeAttribute(item.id)}" type="text" maxlength="40" value="${escapeAttribute(item.actionVerb)}" placeholder="e.g. Practice" autocomplete="off" aria-label="Action verb for ${escapeAttribute(item.value)}" /></label><p class="action-value-preview" data-action-preview="${escapeAttribute(item.id)}">${actionPhrase(item)}</p></div></li>`).join("")}</ol>
    </section>`).join("");
  content.hidden = false;
  renderVerbList();

  groupContainer.addEventListener("focusin", event => {
    const input = event.target.closest("[data-action-id]");
    if (input) activeActionInput = input;
  });

  groupContainer.addEventListener("input", event => {
    const input = event.target.closest("[data-action-id]");
    if (!input) return;
    const id = String(input.dataset.actionId);
    const verb = input.value.trim().slice(0, 40);
    const item = values.find(value => String(value.id) === id);
    if (!item) return;
    item.actionVerb = verb;
    if (verb) state.valueActions[id] = verb;
    else delete state.valueActions[id];
    const preview = document.querySelector(`[data-action-preview="${cssEscape(id)}"]`);
    if (preview) preview.textContent = verb ? `${verb} ${item.value}` : `Add a verb to make “${item.value}” actionable.`;
    document.getElementById("actionSaveStatus").textContent = "Saving your action verb…";
    localStorage.setItem(key, JSON.stringify(state));
  });

  document.getElementById("actionVerbGuide").addEventListener("click", event => {
    const button = event.target.closest("[data-action-verb]");
    if (!button) return;
    const input = activeActionInput || groupContainer.querySelector("[data-action-id]");
    if (!input) return;
    input.value = button.dataset.actionVerb;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
    activeActionInput = input;
  });

  document.getElementById("actionVerbSearch").addEventListener("input", event => renderVerbList(event.target.value));

  document.addEventListener("cloud-saving", () => setSaveStatus("Saving your action verbs…", "saving"));
  document.addEventListener("cloud-saved", () => setSaveStatus("Saved to your account", "saved"));
  document.addEventListener("cloud-save-error", () => setSaveStatus("Save failed — edit a verb to retry", "error"));

  document.getElementById("downloadValues").addEventListener("click", () => {
    const body = groups.map(group => `<h2>${escapeHtml(group.name)}</h2><ol>${group.values.map(item => `<li><strong>${escapeHtml(item.actionVerb ? `${item.actionVerb} ${item.value}` : item.value)}</strong><br>${escapeHtml(item.definition)}</li>`).join("")}</ol>`).join("");
    const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>My Values</title></head><body><h1>My Values</h1><p>Finalized ${escapeHtml(formatDate(state.confirmedAt))}</p>${body}</body></html>`;
    const url = URL.createObjectURL(new Blob([documentHtml], { type: "application/msword" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-final-values.doc";
    link.click();
    URL.revokeObjectURL(url);
  });

  function loadState() {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  }

  function normalizeGroups(value) {
    if (Array.isArray(value.finalizedGroups) && value.finalizedGroups.length) {
      return value.finalizedGroups.flatMap(group => {
        const name = String(group?.name || "").trim();
        const items = Array.isArray(group?.values) ? group.values.flatMap(item => {
          const word = String(item?.value || "").trim();
          const id = String(item?.id ?? `value-${word.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
          return word ? [{ id, value: word, definition: String(item?.definition || "").trim(), actionVerb: String(item?.actionVerb || "").trim().slice(0, 40) }] : [];
        }) : [];
        return name && items.length ? [{ name, values: items }] : [];
      });
    }
    const confirmed = Array.isArray(value.confirmedValues) ? value.confirmedValues.filter(Boolean) : [];
    return confirmed.length ? [{ name: "My values", values: confirmed.map(item => { const word = String(item); return { id: `value-${word.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, value: word, definition: "", actionVerb: "" }; }) }] : [];
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(date);
  }

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value || "");
    return element.innerHTML;
  }

  function escapeAttribute(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
  }

  function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(String(value)) : String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function actionPhrase(item) {
    return escapeHtml(item.actionVerb ? `${item.actionVerb} ${item.value}` : `Add a verb to make “${item.value}” actionable.`);
  }

  function renderVerbList(query = "") {
    const term = String(query).trim().toLowerCase();
    const filtered = ACTION_VERBS.filter(verb => verb.toLowerCase().includes(term));
    document.getElementById("actionVerbCount").textContent = term ? `${filtered.length} of ${ACTION_VERBS.length} verbs` : `${ACTION_VERBS.length} verbs`;
    document.getElementById("actionVerbList").innerHTML = filtered.length
      ? filtered.map(verb => `<button type="button" data-action-verb="${escapeAttribute(verb)}">${escapeHtml(verb)}</button>`).join("")
      : '<p class="action-verb-empty">No matching verbs. Try another search or type your own.</p>';
  }

  function setSaveStatus(message, status) {
    const element = document.getElementById("actionSaveStatus");
    element.textContent = message;
    element.dataset.state = status;
  }
})();
