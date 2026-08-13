const SITE_CONTENT_KEY = "what-should-i-do-site-content-v1";
try {
  const content = JSON.parse(localStorage.getItem(SITE_CONTENT_KEY)) || {};
  if (content.homeEyebrow === "A TOOL FOR MAKING GOD-HONORING DECISIONS") {
    content.homeEyebrow = "A PROCESS FOR MAKING GOD-HONORING DECISIONS";
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content));
  }
  if (content.homeLead === "A growing collection of thoughtful exercises to help you understand what matters, weigh your options, and move forward with confidence.") {
    content.homeLead = "The journey of growing in faith to know more about God and become the person that He created you to be.";
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content));
  }
  if (content.homeLead === "The journey of growing in faith to know more about God and become the person that He created you to be.") {
    content.homeLead = "This course will challenge you to put your faith in action.";
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content));
  }
  if (content.preworkIntro === "Begin by reading and reflecting on two Scripture passages. Each reading opens the complete chapter in the New International Version.") {
    content.preworkIntro = "Begin by reading and reflecting on two Scripture passages. Each reading opens the complete chapter in the English Standard Version.";
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content));
  }
  document.querySelectorAll("[data-content-key]").forEach(element => {
    const value = content[element.dataset.contentKey];
    if (typeof value === "string" && value.trim()) element.textContent = value;
  });
} catch {}
