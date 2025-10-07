# 📝 Todo App - Full-Stack Project

Een moderne, veilige todo applicatie met twee implementaties: Vanilla JavaScript en Next.js met Supabase backend.

![Live Demo](https://xsimple-todo.netlify.app)

---

## 📁 Project Structuur

```
TodoApp/
├── 📄 index.html              # Vanilla JS versie (legacy)
├── 📄 script.js               # Client-side JavaScript
├── 📄 style.css               # Styling met glassmorphism
├── 📄 supabase-config.js      # Supabase configuratie
├── 📂 icons/                  # SVG icons
└── 📂 nextjs-version/         # ⭐ Next.js versie (PRODUCTIE)
    ├── 📂 app/
    │   ├── 📂 auth/           # Login & Signup pages
    │   ├── 📂 components/     # Herbruikbare componenten
    │   ├── page.tsx           # Homepage (todos)
    │   └── layout.tsx         # Root layout
    ├── 📂 lib/
    │   └── 📂 supabase/       # Supabase clients
    ├── middleware.ts          # Auth middleware
    └── package.json
```

---

## 🚀 Features

### ✨ Core Functionaliteit
- ✅ **User Authentication** (Email/Password via Supabase)
- ✅ **CRUD Operations** (Create, Read, Update, Delete todos)
- ✅ **Multi-User Support** (Elke gebruiker ziet alleen eigen todos)
- ✅ **Real-time Database** (Supabase PostgreSQL met RLS)
- ✅ **Filtering** (All / Active / Completed)
- ✅ **Session Persistence** (HTTP-only cookies)

### 🎨 UI/UX
- ✅ **Glassmorphism Design** (Moderne blur & transparency)
- ✅ **Dark/Light Mode** (Met persistence)
- ✅ **Toast Notifications** (Mooie success/error messages)
- ✅ **Responsive Design** (Mobile-first, werkt op alle schermen)
- ✅ **Loading States** (Spinners tijdens acties)
- ✅ **Optimistic Updates** (Instant UI feedback)

### 🔥 Advanced Features
- ✅ **Inline Editing** (Dubbelklik op todo om te bewerken)
- ✅ **Bulk Actions** (Verwijder alle completed todos tegelijk)
- ✅ **Keyboard Shortcuts** (Enter/Escape voor edit)
- ✅ **Server-Side Rendering** (Next.js SSR)
- ✅ **TypeScript** (Type-safe code)

---

## 🛠️ Tech Stack

### Next.js Versie (Productie)
| Technology | Doel |
|------------|------|
| **Next.js 15** | React framework met SSR |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Supabase** | Backend (Auth + Database) |
| **React Hot Toast** | Toast notifications |
| **Netlify** | Hosting & deployment |

### Vanilla JS Versie (Legacy)
- Pure HTML/CSS/JavaScript
- Supabase client library (CDN)
- Client-side auth & localStorage

---

## 🔐 Beveiliging

### Next.js Versie (✅ Veilig)
- 🔒 **HTTP-only cookies** voor sessies (geen localStorage)
- 🔒 **Server-side auth checks** (middleware op elke request)
- 🔒 **Environment variables** (keys niet in browser code)
- 🔒 **Row Level Security** (Supabase RLS policies)
- 🔒 **CSRF Protection** (ingebouwd in Next.js)
- 🔒 **XSS Protection** (React escaping)

### Vanilla JS Versie (⚠️ Basic)
- ⚠️ Sessions in localStorage (JavaScript kan lezen)
- ⚠️ Client-side only auth
- ✅ Supabase RLS policies (database bescherming)

---

## 🚀 Installatie & Development

### Next.js Versie (Aanbevolen)

**1. Installeer dependencies:**
```bash
cd nextjs-version
npm install
```

**2. Environment variables:**
Maak `.env.local` in `nextjs-version/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key
```

**3. Start development server:**
```bash
npm run dev
```
→ Open http://localhost:3000

**4. Build voor productie:**
```bash
npm run build
npm start
```

### Vanilla JS Versie

**1. Open gewoon `index.html` in je browser**

**2. Of gebruik een local server:**
```bash
npx serve .
```

---

## 📦 Database Setup (Supabase)

### 1. Maak Supabase Project
- Ga naar https://app.supabase.com
- New project → vul naam/wachtwoord in

### 2. Enable Email Auth
- Authentication → Providers → Email
- Enable "Email + Password"
- Enable "Allow new users to sign up"
- (Optioneel) Disable "Confirm email" voor development

### 3. Run SQL (Maak todos table)
Ga naar SQL Editor en run:

```sql
-- Todos table
create table if not exists public.todos (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.todos enable row level security;

-- Policies: users kunnen alleen eigen todos zien/bewerken
create policy "read own todos"
on public.todos for select
to authenticated
using (auth.uid() = user_id);

create policy "insert own todos"
on public.todos for insert
to authenticated
with check (auth.uid() = user_id);

create policy "update own todos"
on public.todos for update
to authenticated
using (auth.uid() = user_id);

create policy "delete own todos"
on public.todos for delete
to authenticated
using (auth.uid() = user_id);

-- Indexes voor performance
create index if not exists todos_user_created_idx 
on public.todos (user_id, created_at desc);
```

### 4. Haal je API credentials
- Project Settings → API
- Kopieer:
  - `Project URL`
  - `anon public` key

---

## 🌐 Deployment (Netlify)

### Stap 1: Push naar GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jouw-username/TodoApp.git
git push -u origin main
```

### Stap 2: Deploy op Netlify
1. Ga naar https://app.netlify.com
2. **New site from Git** → Selecteer je repo
3. **Build settings:**
   - **Base directory:** `nextjs-version`
   - **Build command:** `npm run build`
   - **Publish directory:** `nextjs-version/.next`

4. **Environment variables toevoegen:**
   - `NEXT_PUBLIC_SUPABASE_URL` = jouw Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = jouw anon key

5. **Deploy!**

### Auto-Deploy
- Elke `git push` triggert automatisch een nieuwe deploy
- Build duurt ~2-3 minuten
- Site: `https://jouw-site.netlify.app`

---

## 📖 Hoe te Gebruiken

### Voor Gebruikers

**1. Sign Up**
- Ga naar de live site
- Klik "Don't have an account? Sign up"
- Voer email + wachtwoord in (min 6 karakters)
- Account wordt aangemaakt

**2. Login**
- Gebruik je email + wachtwoord
- Session blijft actief (HTTP-only cookies)

**3. Todos Beheren**
- **Toevoegen:** Type in input, klik ADD
- **Toggle:** Klik checkbox om af te vinken
- **Bewerken:** Dubbelklik op todo tekst
- **Verwijderen:** Klik delete icon (🗑️)
- **Bulk Delete:** Klik "Clear X completed"
- **Filteren:** All / Active / Completed buttons

**4. Theme**
- Klik 🌙/☀️ rechts bovenin
- Keuze wordt opgeslagen

### Voor Developers

**Code Structure:**
```typescript
// Server Component (page.tsx)
- Haalt data op server
- Geen loading states nodig
- SEO-friendly

// Client Component ("use client")
- Interactieve UI
- React hooks (useState, useEffect)
- Browser-only code
```

**Auth Flow:**
```
1. User opent site
2. Middleware checkt session
3. Geen session? → redirect /auth/login
4. Login succesvol → session in cookie → redirect /
5. Homepage haalt todos van database
```

---

## 🔧 Troubleshooting

### "Failed to add todo"
- ✅ Check Supabase SQL is correct uitgevoerd
- ✅ Verify RLS policies zijn actief
- ✅ Check environment variables in Netlify

### Theme toggle werkt niet
- 🔄 Hard refresh (Cmd+Shift+R of Ctrl+Shift+R)
- 🧹 Clear browser cache
- 📱 Op mobile: vernieuw pagina

### Netlify build faalt
- ✅ Check Node version (min 18.x)
- ✅ Verify `nextjs-version/.env.local` bestaat lokaal
- ✅ Check environment variables in Netlify dashboard

### Todos verdwijnen na logout
- ✅ **Dit is normaal!** Elke user ziet alleen eigen todos
- ✅ Login opnieuw → je todos komen terug

---

## 📊 Verschillen tussen Versies

| Feature | Vanilla JS | Next.js |
|---------|-----------|---------|
| **Beveiliging** | Basic | ⭐ Enterprise-level |
| **Session Storage** | localStorage | HTTP-only cookies |
| **Auth Check** | Client-side | Server-side (middleware) |
| **Page Load** | Client renders | Server pre-renders |
| **SEO** | ❌ Poor | ✅ Excellent |
| **Type Safety** | ❌ Geen | ✅ TypeScript |
| **Performance** | Good | ⭐ Excellent |
| **Code Splitting** | ❌ Nee | ✅ Automatisch |
| **Development** | Open HTML | `npm run dev` |
| **Deployment** | Drag & drop | Git push |

**Aanbeveling:** Gebruik **Next.js versie** voor echte apps!

---

## 🎓 Wat Je Leert van Dit Project

### Frontend
- ✅ React Server & Client Components
- ✅ Next.js App Router
- ✅ TypeScript basics
- ✅ Tailwind CSS utility classes
- ✅ Responsive design patterns
- ✅ State management (useState)

### Backend & Database
- ✅ Supabase authentication
- ✅ PostgreSQL & Row Level Security (RLS)
- ✅ RESTful API calls
- ✅ Environment variables
- ✅ Session management

### DevOps
- ✅ Git version control
- ✅ CI/CD (Continuous Deployment)
- ✅ Netlify hosting
- ✅ Build processes

### Best Practices
- ✅ Security (HTTP-only cookies, RLS)
- ✅ Error handling
- ✅ Loading states
- ✅ Optimistic updates
- ✅ Accessibility (ARIA labels)

---

## 🔗 Links

- **Live Demo:** https://xsimple-todo.netlify.app
- **GitHub Repo:** https://github.com/Daryii/TodoApp
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 📝 License

MIT License - Vrij te gebruiken voor persoonlijke en commerciële projecten.

---

## 👨‍💻 Author

**Daryi**
- GitHub: [@Daryii](https://github.com/Daryii)

---

## 🙏 Acknowledgments

- Design geïnspireerd door moderne todo apps
- Glassmorphism trend
- Supabase voor excellent BaaS platform
- Netlify voor gratis hosting

---

## 🔮 Toekomstige Features (Roadmap)

- [ ] Drag & drop reordering
- [ ] Categorieën/tags
- [ ] Due dates & reminders
- [ ] Zoekfunctie
- [ ] Dark mode per pagina
- [ ] PWA (installeerbare app)
- [ ] Offline mode met sync
- [ ] Collaborative todos (delen met anderen)
- [ ] Email notifications
- [ ] Analytics dashboard

---

**⭐ Als je dit project nuttig vindt, geef een star op GitHub!**

