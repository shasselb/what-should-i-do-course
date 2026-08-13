(async function () {
  const app = await window.AppCloud?.ready;
  document.querySelectorAll("[data-account-link]").forEach(link => {
    link.textContent = app?.session ? "My account" : "Sign in";
    link.href = app?.session ? "account.html" : "auth.html";
  });
  document.querySelectorAll("[data-admin-link]").forEach(link => {
    link.hidden = app?.profile?.role !== "admin";
  });
})();

