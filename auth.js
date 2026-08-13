(async function () {
  const app = await window.AppCloud.ready;
  const form = document.getElementById("authForm");
  const status = document.getElementById("authStatus");
  let mode = "signin";

  if (!app.configured) {
    status.textContent = "Account services are not configured yet. See the deployment guide in README.md.";
    form.querySelector("button").disabled = true;
    return;
  }
  if (app.session) return goNext();
  const savedMessage = sessionStorage.getItem("auth-message");
  if (savedMessage) { status.textContent = savedMessage; sessionStorage.removeItem("auth-message"); }

  document.querySelectorAll("[data-auth-tab]").forEach(button => button.addEventListener("click", () => {
    mode = button.dataset.authTab;
    document.querySelectorAll("[data-auth-tab]").forEach(item => item.classList.toggle("active", item === button));
    document.getElementById("nameField").hidden = mode !== "signup";
    document.getElementById("authTitle").textContent = mode === "signup" ? "Create your account" : "Welcome back";
    document.getElementById("authDescription").textContent = mode === "signup" ? "Use a strong password with at least eight characters." : "Enter your email and password to continue.";
    document.getElementById("authSubmit").firstChild.textContent = mode === "signup" ? "Create account " : "Sign in ";
    form.elements.password.autocomplete = mode === "signup" ? "new-password" : "current-password";
    status.textContent = "";
  }));

  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "Working…";
    const values = new FormData(form);
    const email = String(values.get("email")).trim();
    const password = String(values.get("password"));
    const result = mode === "signup"
      ? await window.AppCloud.client.auth.signUp({ email, password, options: { data: { full_name: String(values.get("fullName") || "").trim() } } })
      : await window.AppCloud.client.auth.signInWithPassword({ email, password });
    if (result.error) { status.textContent = result.error.message; return; }
    if (mode === "signup" && !result.data.session) {
      status.textContent = "Check your email to confirm your account, then return here to sign in.";
      return;
    }
    goNext();
  });

  document.getElementById("forgotPassword").addEventListener("click", async () => {
    const email = form.elements.email.value.trim();
    if (!email) { status.textContent = "Enter your email address first."; return; }
    const redirectTo = `${location.origin}${location.pathname.replace(/auth\.html$/, "auth.html")}`;
    const { error } = await window.AppCloud.client.auth.resetPasswordForEmail(email, { redirectTo });
    status.textContent = error ? error.message : "Password-reset instructions have been emailed to you.";
  });

  function goNext() {
    const requested = new URLSearchParams(location.search).get("next") || "account.html";
    const safe = /^[a-z0-9][a-z0-9._?=&%-]*$/i.test(requested) ? requested : "account.html";
    location.replace(safe);
  }
})();

