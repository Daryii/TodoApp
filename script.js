/*
  Todo App interactivity: add, toggle, delete, and persist todos
*/

(function () {
  const STORAGE_KEY = "todoapp.todos";
  const USER_DB_KEY = "todoapp.users"; // username -> { salt, hash }
  const SESSION_KEY = "todoapp.session"; // { username }

  /** @type {{id:string, text:string, completed:boolean}[]} */
  let todos = [];

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const themeToggle = document.getElementById("theme-toggle");

  // Auth elements (simple email/password card)
  const emailAuthForm = document.getElementById("email-auth-form");
  const authEmail = document.getElementById("auth-email");
  const authPassword = document.getElementById("auth-password");
  const authToggle = document.getElementById("auth-toggle");
  const authError = document.getElementById("auth-error");
  const appHeader = document.getElementById("app-header");
  const logoutButton = document.getElementById("logout-button");
  const appSection = document.getElementById("app-section");
  const authStatus = document.getElementById("auth-status");

  async function loadTodosFromStorage() {
    try {
      // Prefer Supabase if configured and session exists
      const sUser = await getSupabaseUser();
      if (sUser) {
        const { data, error } = await window.supabaseClient
          .from("todos")
          .select("id, text, completed")
          .eq("user_id", sUser.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return Array.isArray(data)
          ? data
              .map((r) => ({
                id: r.id,
                text: r.text,
                completed: !!r.completed,
              }))
              .filter(isValidTodo)
          : [];
      }

      const user = currentUser();
      if (!user) return [];
      const all = loadAllTodos();
      const list = all[user];
      return Array.isArray(list) ? list.filter(isValidTodo) : [];
    } catch {
      return [];
    }
  }

  async function saveTodosToStorage() {
    const sUser = await getSupabaseUser();
    if (sUser) {
      // Replace remote state with local snapshot (simple sync)
      await window.supabaseClient
        .from("todos")
        .delete()
        .eq("user_id", sUser.id);
      if (todos.length > 0) {
        const rows = todos.map((t) => ({
          id: t.id,
          user_id: sUser.id,
          text: t.text,
          completed: t.completed,
        }));
        await window.supabaseClient.from("todos").insert(rows);
      }
      return;
    }
    const user = currentUser();
    if (!user) return;
    const all = loadAllTodos();
    all[user] = todos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function loadAllTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function isValidTodo(item) {
    return (
      item &&
      typeof item.id === "string" &&
      typeof item.text === "string" &&
      typeof item.completed === "boolean"
    );
  }

  async function getSupabaseUser() {
    try {
      if (!window.supabaseClient) return null;
      const { data } = await window.supabaseClient.auth.getUser();
      return data && data.user ? data.user : null;
    } catch {
      return null;
    }
  }

  function currentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (session && typeof session.username === "string")
        return session.username;
    } catch {}
    return null;
  }

  function createTodo(text) {
    const trimmed = text.replace(/[\u0000-\u001F\u007F]/g, "").trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > 200) return null;
    return {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      text: trimmed,
      completed: false,
    };
  }

  // Theme handling
  (function setupTheme() {
    if (!themeToggle) return;
    const THEME_KEY = "todoapp.theme";
    function applyTheme(cls) {
      document.documentElement.classList.toggle("light", cls === "light");
      themeToggle.textContent = cls === "light" ? "🌙" : "☀️";
    }
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") applyTheme(saved);
    themeToggle.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("light")
        ? "dark"
        : "light";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  })();

  function render() {
    list.innerHTML = "";
    if (todos.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "No todos yet. Add one above.";
      list.appendChild(empty);
      return;
    }

    for (const todo of todos) {
      const li = document.createElement("li");
      li.className = "todo-item";

      const checkboxId = `todo-${todo.id}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = todo.completed;
      checkbox.className = "native-checkbox";

      const customCheckbox = document.createElement("label");
      customCheckbox.className = "custom-checkbox";
      customCheckbox.setAttribute("for", checkboxId);
      customCheckbox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
        </svg>
      `;

      const label = document.createElement("label");
      label.className = "todo-text";
      label.setAttribute("for", checkboxId);
      label.textContent = todo.text;
      if (todo.completed) label.classList.add("completed");

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-button";
      deleteBtn.setAttribute("aria-label", "Delete todo");
      deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
        </svg>
      `;

      checkbox.addEventListener("change", async () => {
        todo.completed = checkbox.checked;
        const sUser = await getSupabaseUser();
        if (sUser) {
          await window.supabaseClient
            .from("todos")
            .update({ completed: todo.completed })
            .eq("id", todo.id)
            .eq("user_id", sUser.id);
        } else {
          await saveTodosToStorage();
        }
        render();
      });

      deleteBtn.addEventListener("click", async () => {
        const ok = confirm("Delete this todo?");
        if (!ok) return;
        todos = todos.filter((t) => t.id !== todo.id);
        const sUser = await getSupabaseUser();
        if (sUser) {
          await window.supabaseClient
            .from("todos")
            .delete()
            .eq("id", todo.id)
            .eq("user_id", sUser.id);
        } else {
          await saveTodosToStorage();
        }
        render();
      });

      li.appendChild(checkbox);
      li.appendChild(customCheckbox);
      li.appendChild(label);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = input.value;
    const newTodo = createTodo(value);
    if (!newTodo) {
      input.setCustomValidity("Please enter 1-200 visible characters.");
      input.reportValidity();
      setTimeout(() => input.setCustomValidity(""), 1500);
      return;
    }
    todos.unshift(newTodo);
    input.value = "";
    const sUser = await getSupabaseUser();
    if (sUser) {
      await window.supabaseClient.from("todos").insert({
        id: newTodo.id,
        user_id: sUser.id,
        text: newTodo.text,
        completed: newTodo.completed,
      });
    } else {
      await saveTodosToStorage();
    }
    render();
  });

  // ---------- Auth Logic ----------
  function validateUsername(name) {
    return /^[A-Za-z0-9_\-.]{3,32}$/.test(name);
  }
  function validatePassword(pass) {
    return typeof pass === "string" && pass.length >= 6 && pass.length <= 128;
  }

  async function hashPassword(password, saltBytes) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const raw = await crypto.subtle.exportKey("raw", key);
    return new Uint8Array(raw);
  }

  function toHex(bytes) {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  function fromHex(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++)
      out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  function loadUserDb() {
    try {
      const raw = localStorage.getItem(USER_DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  function saveUserDb(db) {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function updateAuthUI() {
    const user = currentUser();
    if (authStatus) authStatus.textContent = user ? `Signed in as ${user}` : "";
    if (logoutButton) logoutButton.classList.toggle("hidden", !user);
    const authCard = document.getElementById("auth-card");
    if (authCard) authCard.classList.toggle("hidden", !!user);
    if (appHeader) appHeader.classList.toggle("hidden", !user);
    if (appSection) appSection.classList.toggle("hidden", !user);
  }

  if (emailAuthForm) {
    let signupMode = false;
    if (authToggle) {
      authToggle.addEventListener("click", () => {
        signupMode = !signupMode;
        const submit = document.getElementById("auth-submit");
        if (submit)
          submit.textContent = signupMode ? "Create account" : "Login";
        authToggle.textContent = signupMode
          ? "Already have an account? Login"
          : "Don't have an account? Sign up";
      });
    }

    emailAuthForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (authError) authError.classList.add("hidden");
      const email = authEmail ? authEmail.value.trim() : "";
      const password = authPassword ? authPassword.value : "";
      if (!email || password.length < 6) {
        if (authError) {
          authError.textContent = "Enter a valid email and 6+ char password";
          authError.classList.remove("hidden");
        }
        return;
      }
      // If Supabase configured, use it; else fallback to local pseudo-auth keyed by email
      if (window.supabaseClient) {
        const { error } = signupMode
          ? await window.supabaseClient.auth.signUp({ email, password })
          : await window.supabaseClient.auth.signInWithPassword({
              email,
              password,
            });
        if (error) {
          if (authError) {
            authError.textContent = error.message;
            authError.classList.remove("hidden");
          }
          return;
        }
      }
      setSession(email);
      const all = loadAllTodos();
      todos = Array.isArray(all[email]) ? all[email].filter(isValidTodo) : [];
      updateAuthUI();
      render();
    });
  }

  // remove legacy signup form logic (now handled by emailAuthForm)

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearSession();
      todos = [];
      updateAuthUI();
      render();
    });
  }

  // Initialize by session
  (async function init() {
    const user = currentUser();
    if (user) {
      const fromStore = await loadTodosFromStorage();
      todos = Array.isArray(fromStore) ? fromStore : [];
    } else {
      todos = [];
    }
    updateAuthUI();
    render();
  })();
})();
