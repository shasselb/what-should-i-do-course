(async function () {
  const app = await window.AppCloud.ready;
  if (!app?.session) return;
  const displayName = app.profile?.full_name || app.session.user.email;
  document.getElementById("accountIdentity").textContent = `Signed in as ${displayName}. Your latest changes sync automatically.`;
  document.getElementById("adminAccountLink").hidden = app.profile?.role !== "admin";
  document.getElementById("signOut").addEventListener("click", () => window.AppCloud.signOut());
  document.getElementById("emailMyContent").addEventListener("click", async event => {
    const button = event.currentTarget;
    const status = document.getElementById("emailStatus");
    button.disabled = true;
    status.textContent = "Preparing your email…";
    await window.AppCloud.syncNow();
    const response = await fetch("/api/email-content", {
      method: "POST",
      headers: { Authorization: `Bearer ${app.session.access_token}`, "Content-Type": "application/json" },
      body: "{}"
    });
    const result = await response.json().catch(() => ({}));
    status.textContent = response.ok ? "Your content has been emailed to you." : (result.error || "We could not send the email. Try again later.");
    button.disabled = false;
  });
})();

