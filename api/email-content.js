const USER_KEYS = {
  notes: "what-should-i-do-prework-notes-v1",
  values: "sortly-state-v1",
  audit: "what-should-i-do-time-audit-v1"
};

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const token = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return response.status(401).json({ error: "Sign in is required." });

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey || !resendKey) return response.status(503).json({ error: "Email service is not configured." });

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  if (!userResponse.ok) return response.status(401).json({ error: "Your session has expired. Please sign in again." });
  const user = await userResponse.json();
  const dataResponse = await fetch(`${supabaseUrl}/rest/v1/user_data?user_id=eq.${encodeURIComponent(user.id)}&select=content`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" }
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
  const values = Array.isArray(state?.confirmedValues) && state.confirmedValues.length ? state.confirmedValues.join(", ") : "Not confirmed yet";
  const noteHtml = Object.entries(notes).map(([key, value]) => `<h3>${escapeHtml(key.replace(/-/g, " "))}</h3><p>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`).join("") || "<p>No Pre-Work notes yet.</p>";
  const auditHours = audit.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1f2824;line-height:1.6;max-width:680px;margin:auto;padding:32px"><p style="color:#2f7257;font-weight:bold">WHAT SHOULD I DO?</p><h1>Your saved course content</h1><p>Private summary for ${escapeHtml(email)}</p><hr><h2>Pre-Work notes</h2>${noteHtml}<h2>Confirmed values</h2><p>${escapeHtml(values)}</p><h2>Time Audit</h2><p>${audit.length} entries totaling ${auditHours.toFixed(2)} hours.</p><hr><small>Your account data is retained for one year after your latest update.</small></body></html>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}
