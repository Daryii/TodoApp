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

  // Auth elements
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const logoutButton = document.getElementById("logout-button");
  const authSection = document.getElementById("auth-section");
  const appSection = document.getElementById("app-section");
  const authStatus = document.getElementById("auth-status");

  function loadTodosFromStorage() {
    try {
      const user = currentUser();
      if (!user) return [];
      const all = loadAllTodos();
      const list = all[user];
      return Array.isArray(list) ? list.filter(isValidTodo) : [];
    } catch {
      return [];
    }
  }

  function saveTodosToStorage() {
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

      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        saveTodosToStorage();
        render();
      });

      deleteBtn.addEventListener("click", () => {
        const ok = confirm("Delete this todo?");
        if (!ok) return;
        todos = todos.filter((t) => t.id !== todo.id);
        saveTodosToStorage();
        render();
      });

      li.appendChild(checkbox);
      li.appendChild(customCheckbox);
      li.appendChild(label);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    }
  }

  form.addEventListener("submit", (e) => {
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
    saveTodosToStorage();
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
    authStatus.textContent = user ? `Signed in as ${user}` : "Not signed in";
    logoutButton.classList.toggle("hidden", !user);
    authSection.classList.toggle("hidden", !!user);
    appSection.classList.toggle("hidden", !user);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      if (!validateUsername(username) || !validatePassword(password)) {
        alert("Invalid credentials format.");
        return;
      }
      const db = loadUserDb();
      const record = db[username];
      if (!record) {
        alert("Account not found. Please sign up.");
        return;
      }
      const salt = fromHex(record.salt);
      const hash = await hashPassword(password, salt);
      if (toHex(hash) !== record.hash) {
        alert("Incorrect password.");
        return;
      }
      setSession(username);
      const all = loadAllTodos();
      todos = Array.isArray(all[username])
        ? all[username].filter(isValidTodo)
        : [];
      updateAuthUI();
      render();
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("signup-username").value.trim();
      const password = document.getElementById("signup-password").value;
      if (!validateUsername(username) || !validatePassword(password)) {
        alert("Invalid username or password.");
        return;
      }
      const db = loadUserDb();
      if (db[username]) {
        alert("Username already exists.");
        return;
      }
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await hashPassword(password, salt);
      db[username] = { salt: toHex(salt), hash: toHex(hash) };
      saveUserDb(db);
      setSession(username);
      const all = loadAllTodos();
      if (!Array.isArray(all[username])) all[username] = [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      todos = all[username];
      updateAuthUI();
      render();
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearSession();
      todos = [];
      updateAuthUI();
      render();
    });
  }

  // Initialize by session
  const user = currentUser();
  if (user) {
    const all = loadAllTodos();
    todos = Array.isArray(all[user]) ? all[user].filter(isValidTodo) : [];
  } else {
    todos = [];
  }
  updateAuthUI();
  render();
})();
