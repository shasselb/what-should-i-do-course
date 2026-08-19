const USER_KEYS = {
  notes: "what-should-i-do-prework-notes-v1",
  values: "sortly-state-v1",
  audit: "what-should-i-do-time-audit-v1",
  lessons: "what-should-i-do-self-paced-notes-v1"
};

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const token = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ error: "Sign in is required." });

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!supabaseUrl || !publishableKey || !secretKey || !resendKey) return response.status(503).json({ error: "Email service is not configured." });

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: publishableKey, Authorization: `Bearer ${token}` } });
  if (!userResponse.ok) return response.status(401).json({ error: "Your session has expired. Please sign in again." });
  const user = await userResponse.json();
  const dataResponse = await fetch(`${supabaseUrl}/rest/v1/user_data?user_id=eq.${encodeURIComponent(user.id)}&select=content`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}`, Accept: "application/json" }
  });
  const rows = await dataResponse.json();
  const content = rows?.[0]?.content || {};
  const html = buildEmail(content, user.email);
  const sendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "What Should I Do? <course@example.com>",
      to: [user.email],
      subject: "Your What Should I Do? course content",
      html
    })
  });
  if (!sendResponse.ok) return response.status(502).json({ error: "The email provider could not send your message." });
  return response.status(200).json({ ok: true });
}

function buildEmail(content, email) {
  const notes = content[USER_KEYS.notes] || {};
  const state = content[USER_KEYS.values] || {};
  const audit = content[USER_KEYS.audit] || [];
  const lessons = content[USER_KEYS.lessons] || {};
  const actionableValues = Array.isArray(state?.finalizedGroups) ? state.finalizedGroups.flatMap(group => Array.isArray(group?.values) ? group.values.map(item => {
    const value = String(item?.value || "").trim();
    const verb = String(item?.actionVerb || state?.valueActions?.[String(item?.id)] || "").trim();
    return value ? `${verb ? `${verb} ` : ""}${value}` : "";
  }).filter(Boolean) : []) : [];
  const values = actionableValues.length ? actionableValues.join(", ") : Array.isArray(state?.confirmedValues) && state.confirmedValues.length ? state.confirmedValues.join(", ") : "Not finalized yet";
  const noteHtml = Object.entries(notes).map(([key, value]) => `<h3>${escapeHtml(key.replace(/-/g, " "))}</h3><p>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`).join("") || "<p>No Pre-Work notes yet.</p>";
  const auditHours = audit.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const lessonHtml = Object.entries(lessons).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => {
    const label = key.replace("-", " · lesson ").toUpperCase();
    const reflection = String(value?.reflection || "").trim();
    const action = String(value?.action || "").trim();
    if (!reflection && !action && !value?.complete) return "";
    return `<h3>${escapeHtml(label)}${value?.complete ? " — Complete" : ""}</h3>${reflection ? `<p><strong>Reflection:</strong> ${escapeHtml(reflection).replace(/\n/g, "<br>")}</p>` : ""}${action ? `<p><strong>Next step:</strong> ${escapeHtml(action).replace(/\n/g, "<br>")}</p>` : ""}`;
  }).join("") || "<p>No self-paced lesson notes yet.</p>";
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1f2824;line-height:1.6;max-width:680px;margin:auto;padding:32px"><p style="color:#2f7257;font-weight:bold">WHAT SHOULD I DO?</p><h1>Your saved course content</h1><p>Private summary for ${escapeHtml(email)}</p><hr><h2>Pre-Work notes</h2>${noteHtml}<h2>Self-paced learning journal</h2>${lessonHtml}<h2>Finalized values</h2><p>${escapeHtml(values)}</p><h2>Time Audit</h2><p>${audit.length} entries totaling ${auditHours.toFixed(2)} hours.</p><hr><small>Your account data is retained for one year after your latest update.</small></body></html>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}
