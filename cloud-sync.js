(function () {
  "use strict";

  const GLOBAL_KEYS = [
    "what-should-i-do-course-videos-v1",
    "what-should-i-do-site-content-v1",
    "what-should-i-do-facilitation-admin-v1",
    "sortly-card-content-v3"
  ];
  const USER_KEYS = [
    "sortly-state-v1",
    "what-should-i-do-prework-notes-v1",
    "what-should-i-do-time-audit-v1",
    "what-should-i-do-self-paced-notes-v1"
  ];
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  let client;
  let session;
  let profile;
  let syncTimer;
  let syncInFlight;
  let syncDirty = false;
  let hydrationComplete = false;
  let applyingRemote = false;

  window.AppCloud = {
    get client() { return client; },
    get session() { return session; },
    get profile() { return profile; },
    ready: bootstrap(),
    signOut: async () => {
      if (client) await client.auth.signOut();
      USER_KEYS.forEach(key => originalRemoveItem(key));
      location.href = "index.html";
    },
    syncNow: () => scheduleSync(0)
  };

  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);
    if (!applyingRemote && (GLOBAL_KEYS.includes(key) || USER_KEYS.includes(key))) scheduleSync();
  };
  localStorage.removeItem = function (key) {
    originalRemoveItem(key);
    if (!applyingRemote && (GLOBAL_KEYS.includes(key) || USER_KEYS.includes(key))) scheduleSync();
  };

  async function getConfig() {
    if (window.APP_CONFIG?.supabaseUrl) return window.APP_CONFIG;
    try {
      const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
      if (response.ok) return response.json();
    } catch {}
    return null;
  }

  async function bootstrap() {
    const config = await getConfig();
    const supabaseKey = config?.supabasePublishableKey || config?.supabaseAnonKey;
    if (!config?.supabaseUrl || !supabaseKey || !window.supabase?.createClient) {
      if (document.body?.dataset.auth) return redirectToAuth("Account services are not configured yet.");
      return finish({ configured: false });
    }

    client = window.supabase.createClient(config.supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    const { data } = await client.auth.getSession();
    session = data.session;

    if (session) {
      const { data: profileData } = await client.from("profiles").select("id,email,full_name,role").eq("id", session.user.id).maybeSingle();
      profile = profileData || { id: session.user.id, email: session.user.email, role: "user" };
      await hydrateGlobal();
      hydrationComplete = await hydrateUser();
      if (hydrationComplete && syncDirty) await syncToCloud();
    } else {
      await hydrateGlobal();
      hydrationComplete = true;
    }

    const requirement = document.body?.dataset.auth;
    if (requirement === "required" && !session) return redirectToAuth();
    if (requirement === "admin" && (!session || profile?.role !== "admin")) {
      return redirectToAuth("Administrator access is required.");
    }

    return finish({ configured: true, session, profile, storageReady: hydrationComplete });
  }

  async function hydrateGlobal() {
    const { data } = await client.from("site_config").select("content").eq("id", "primary").maybeSingle();
    if (data?.content) applyKeys(data.content, GLOBAL_KEYS, "global-hydrated");
  }

  async function hydrateUser() {
    const { data, error } = await client.from("user_data").select("content").eq("user_id", session.user.id).maybeSingle();
    if (error) {
      document.dispatchEvent(new CustomEvent("cloud-save-error", { detail: { message: error.message || "Unable to load saved progress." } }));
      return false;
    }
    if (data?.content && Object.keys(data.content).length) {
      applyKeys(data.content, USER_KEYS, `user-hydrated-${session.user.id}`);
    } else {
      await syncToCloud();
    }
    return true;
  }

  function applyKeys(values, keys, reloadKey) {
    let changed = false;
    applyingRemote = true;
    keys.forEach(key => {
      if (!(key in values)) return;
      const next = typeof values[key] === "string" ? values[key] : JSON.stringify(values[key]);
      if (localStorage.getItem(key) !== next) {
        originalSetItem(key, next);
        changed = true;
      }
    });
    applyingRemote = false;
    if (changed && sessionStorage.getItem(reloadKey) !== "1") {
      sessionStorage.setItem(reloadKey, "1");
      location.reload();
    }
  }

  function collect(keys) {
    return Object.fromEntries(keys.flatMap(key => {
      const value = localStorage.getItem(key);
      return value === null ? [] : [[key, safeParse(value)]];
    }));
  }

  function safeParse(value) {
    try { return JSON.parse(value); } catch { return value; }
  }

  function scheduleSync(delay = 700) {
    syncDirty = true;
    document.dispatchEvent(new CustomEvent("cloud-saving"));
    clearTimeout(syncTimer);
    if (delay === 0) return syncToCloud();
    syncTimer = setTimeout(syncToCloud, delay);
  }

  async function syncToCloud() {
    clearTimeout(syncTimer);
    syncTimer = null;
    if (!client || !session || !hydrationComplete || applyingRemote) return false;
    if (syncInFlight) return syncInFlight;

    const run = (async () => {
      try {
        while (syncDirty) {
          syncDirty = false;
          const { error: userError } = await client.from("user_data").upsert({
            user_id: session.user.id,
            content: collect(USER_KEYS),
            updated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 86400000).toISOString()
          }, { onConflict: "user_id" });
          if (userError) throw userError;

          if (profile?.role === "admin") {
            const { error: globalError } = await client.from("site_config").upsert({
              id: "primary",
              content: collect(GLOBAL_KEYS),
              updated_by: session.user.id,
              updated_at: new Date().toISOString()
            }, { onConflict: "id" });
            if (globalError) throw globalError;
          }
        }
        document.dispatchEvent(new CustomEvent("cloud-saved"));
        return true;
      } catch (error) {
        syncDirty = true;
        document.dispatchEvent(new CustomEvent("cloud-save-error", { detail: { message: error?.message || "Unable to save." } }));
        return false;
      }
    })();

    syncInFlight = run;
    try {
      return await run;
    } finally {
      if (syncInFlight === run) syncInFlight = null;
    }
  }

  function redirectToAuth(message) {
    const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
    if (message) sessionStorage.setItem("auth-message", message);
    location.replace(`auth?next=${next}`);
  }

  function finish(detail) {
    document.body?.classList.add("auth-ready");
    document.dispatchEvent(new CustomEvent("app-ready", { detail }));
    return detail;
  }
})();
