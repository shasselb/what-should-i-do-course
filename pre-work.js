const PREWORK_NOTES_KEY = "what-should-i-do-prework-notes-v1";

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(PREWORK_NOTES_KEY)) || {};
  } catch {
    return {};
  }
}

const notes = loadNotes();

document.querySelectorAll("[data-note-input]").forEach((input) => {
  const noteId = input.dataset.noteInput;
  input.value = notes[noteId] || "";
  let statusTimer;

  input.addEventListener("input", () => {
    notes[noteId] = input.value;
    localStorage.setItem(PREWORK_NOTES_KEY, JSON.stringify(notes));
    const status = document.querySelector(`[data-note-status="${noteId}"]`);
    status.textContent = "Saving…";
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.textContent = "Saved on this device"; }, 450);
  });
});

document.querySelectorAll("[data-note-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const noteId = button.dataset.noteToggle;
    const panel = document.querySelector(`[data-note-panel="${noteId}"]`);
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
    button.textContent = willOpen ? "Close notes" : "✎ Take notes";
    if (willOpen) panel.querySelector("textarea").focus();
  });
});
