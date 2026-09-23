# 🚀 CodeAscent 🕹️

> Plataforma educativa gamificada para aprender **HTML, CSS, SQL y TypeScript** jugando: misiones, terminales interactivas, quizzes diagnósticos, XP, niveles, logros y un mapa de progreso por lenguaje.

![Stack](https://img.shields.io/badge/frontend-Angular_22-dd0031?logo=angular&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Express_4-black?logo=express&logoColor=white)
![DB](https://img.shields.io/badge/database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![Lang](https://img.shields.io/badge/lang-TypeScript-3178c6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📑 Índice

- [✨ Características](#-características)
- [🗺️ Módulos de juego](#️-módulos-de-juego)
- [🏗️ Arquitectura](#️-arquitectura)
- [🛠️ Stack tecnológico](#️-stack-tecnológico)
- [✅ Requisitos](#-requisitos)
- [🚀 Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)
- [🔑 Variables de entorno](#-variables-de-entorno)
- [💻 Comandos](#-comandos)
- [🔌 API (resumen)](#-api-resumen)
- [🎮 Sistema de XP y gamificación](#-sistema-de-xp-y-gamificación)
- [🐳 Docker](#-docker)
- [⚠️ Convenciones y detalles a tener en cuenta](#️-convenciones-y-detalles-a-tener-en-cuenta)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## ✨ Características

- 🧭 **Mapa de progreso** con los 4 lenguajes en orden: HTML → CSS → SQL → TypeScript.
- 📚 **Misiones por niveles** (10 por lenguaje) con manual técnico, lección, terminal de código y test diagnóstico.
- 💻 **Terminal SQL real en el navegador** (con `sql.js`) que valida la consulta contra el esquema de la misión.
- 🧪 **Quizzes diagnósticos** con explicación formativa por pregunta.
- ⭐ **XP, niveles, rachas y logros** (`Primer Paso`, `Mente Brillante`, `Maestro de …`).
- 👤 **Autenticación JWT** + login con Google y recuperación de contraseña por correo.
- 📊 **Dashboard** con perfil por lenguaje, estadísticas, actividad semanal y logros.
- 📖 **Cómics y galería** como material narrativo del juego.

---

## 🗺️ Módulos de juego

| Módulo | Ruta frontend | Secciones |
|---|---|---|
| 🌐 HTML | `src/app/pages/html/` | dashboard · data · processes · terminal · test |
| 🎨 CSS | `src/app/pages/css/` | dashboard · data · processes · terminal · test |
| 🗄️ SQL | `src/app/pages/sql/` | panel · misiones · manual-técnico · consola · cuestionarios |
| 📘 TypeScript | `src/app/pages/TS/` | dashboard · data · processes · terminal · test |
| 🗺️ Mapa / 😀 Dashboard / 🙍 Perfil / 🖼️ Galería / 📚 Catálogo / 💬 Cómics | `src/app/pages/mapa|dashboard|perfil|galeria|catalog|comics/` | vistas transversales |

**Flujo de una misión SQL** (ejemplo):

```text
MISIONES → MANUAL TÉCNICO → LECCIÓN → TERMINAL SQL → TEST DIAGNÓSTICO → +100 XP 🎉
```

El XP **solo** se otorga al completar la misión en perfecto (`terminal` + `quiz` resueltos), vía `POST /api/missions/:missionId/complete`.

---

## 🏗️ Arquitectura

```text
CodeAscent/
├── codeAsent/
│   ├── backend/            # 🖥️ Express + TypeScript + pg (puerto 3000)
│   │   └── src/
│   │       ├── routes/         # 🌐 routes/ → controllers/ → services/ → pg pool
│   │       ├── controllers/
│   │       ├── services/       # 🧮 gamification.service.ts, progreso, reto, logro…
│   │       ├── models/
│   │       ├── middlewares/    # 🔐 autenticacion.middleware.ts (JWT Bearer)
│   │       ├── config/conexion.ts
│   │       ├── seed.ts         # 🌱 migración + seed (slugs, mission_progress, quizzes)
│   │       └── server.ts
│   ├── frontend/           # 🅰️ Angular 22 standalone + Vitest (puerto 4200)
│   │   └── src/app/
│   │       ├── pages/          # 🎮 html/ css/ sql/ TS/ mapa/ dashboard/ perfil/…
│   │       ├── services/ + core/services/   # 📡 HttpClient contra environment.apiUrl
│   │       ├── core/           # 🛡️ guards + interceptors
│   │       └── environments/environment.ts  # 🔗 http://127.0.0.1:3000/api
│   ├── database/
│   │   └── db_codeAscent.sql   # 🛢️ esquema + contenido (~4380 líneas)
│   ├── documents/
│   ├── Dockerfile          # 🐳 build multi-stage (frontend + backend en :3000)
│   └── AGENTS.md           # 🤖 guía interna para agentes de código
└── LICENSE (MIT)
```

> ⚠️ Nota de ortografía histórica: la carpeta es `codeAsent` (sin la segunda “c”). Todo el repo usa ese nombre.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| 🅰️ Frontend | Angular 22, RxJS, Bootstrap 5 + bootstrap-icons, `sql.js`, Prettier (100 cols, comillas simples) |
| 🖥️ Backend | Node 22, Express 4, TypeScript 5, `tsx`, `pg`, `jsonwebtoken`, `bcryptjs`, `google-auth-library`, `nodemailer` |
| 🛢️ Base de datos | PostgreSQL (esquema `db_codeAscent.sql` + `seed.ts`) |
| 🧪 Tests | Vitest (`*.spec.ts` junto a las fuentes) |
| 📦 Gestor | `pnpm@9` (no regenerar lockfiles a la ligera) |

---

## ✅ Requisitos

- 🟢 Node.js 22 + `pnpm@9`
- 🐘 PostgreSQL 14+ (base de datos creada y accesible)
- 🌐 Puertos libres `3000` (backend) y `4200` (frontend)

---

## 🚀 Instalación y puesta en marcha

### 1️⃣ Base de datos 🛢️ (PostgreSQL con pgAdmin 🐘)

1. 🗄️ Abre **pgAdmin** y conéctate a tu servidor PostgreSQL.
2. ➕ Clic derecho en **Databases** → **Create** → **Database…** → nómbrala `codeascent` → **Save**.
3. 🔧 Clic derecho en la base `codeascent` → **Query Tool**.
4. 📂 En el Query Tool pulsa **Open File** 📁 y selecciona `codeAsent/database/db_codeAscent.sql`.
5. ▶️ Pulsa **Execute** (o `F5`) para crear el esquema y cargar todo el contenido (~4380 líneas).
6. ✅ Verifica en el árbol **Schemas → public → Tables** que existan `lenguaje`, `nivel`, `leccion`, `reto`, `usuario`, etc.

### 2️⃣ Backend 🖥️

```bash
cd codeAsent/backend
cp .env.example .env   # ← completa DB_USER, DB_PASSWORD, DB_NAME (obligatorios)
pnpm install
pnpm sembrar           # migración (columna slug, mission_progress, usuario_xp…) + seed de quizzes
pnpm dev               # http://localhost:3000 (el puerto está fijo en server.ts)
```

### 3️⃣ Frontend 🅰️

```bash
cd codeAsent/frontend
pnpm install
pnpm start             # http://localhost:4200
```

> 🔗 El frontend apunta a `http://127.0.0.1:3000/api` (`src/environments/environment.ts`). En Docker se reescribe a `/api`.

---

## 🔑 Variables de entorno

Copia `codeAsent/backend/.env.example` → `codeAsent/backend/.env` (está en `.gitignore`, nunca lo commitees 🙏).

| Variable | Obligatoria | Uso |
|---|---|---|
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | ✅ Sí | Conexión Postgres (`conexion.ts` falla sin ellas) |
| `JWT_SECRET` | ⚠️ Recomendada | Firma de tokens (si falta usa un default inseguro) |
| `GOOGLE_CLIENT_ID` | 🔵 Login Google | `usuario.controller.ts` |
| `EMAIL_USER`, `EMAIL_PASS` | 📧 Recuperación | Envío de correos de reseteo |
| `FRONTEND_URL` | 📧 Recuperación | Enlace del correo de reseteo |
| `PORT` | ❌ Ignorada | El puerto está fijo a `3000` en `server.ts` |

---

## 💻 Comandos

**Backend** (`codeAsent/backend`):

| Comando | Qué hace |
|---|---|
| `pnpm dev` | 🔥 Servidor con reload (`tsx watch`) en `:3000` |
| `pnpm construir` | 🏗️ Compila TS a `dist/` (`pnpm exec tsc --noEmit` = solo typecheck) |
| `pnpm iniciar` | ▶️ Ejecuta `dist/server.js` compilado |
| `pnpm sembrar` | 🌱 Migración + seed (requiere `.env` y BD inicializada) |

**Frontend** (`codeAsent/frontend`):

| Comando | Qué hace |
|---|---|
| `pnpm start` / `ng serve` | 🔥 Dev server en `:4200` |
| `pnpm build` | 📦 Build de producción (además es el *typecheck* de facto) |
| `pnpm test` | 🧪 Tests con Vitest (`ng test`) |

---

## 🔌 API (resumen)

Todo cuelga de `/api` (ver `backend/src/routes/index.ts`):

| Prefijo | Módulo |
|---|---|
| `/usuarios`, `/usuario` | 👤 Usuarios, login Google, recuperación |
| `/lenguajes`, `/languages` | 🌐 Lenguajes |
| `/niveles`, `/lecciones`, `/ejemplos` | 🧱 Contenido pedagógico |
| `/retos`, `/respuestas`, `/intentos` | 🧪 Retos e intentos |
| `/progresos`, `/niveles-usuario` | 📈 Progreso clásico |
| `/logros`, `/usuarios-logros` | 🏆 Logros |
| `/dashboard` | 📊 Resumen (perfil por lenguaje, estadísticas, mapa) |
| `/sql`, `/css` | 🗄️🎨 Niveles por lenguaje |
| `/missions` | 🎯 `progress` (manual→lesson→terminal→quiz) + `terminal-stats`/`terminal-draft` + `quiz/complete` |

---

## 🎮 Sistema de XP y gamificación

- 🗄️ **SQL: 100 XP por misión × 10 = 1000 XP máximo.** El backend lo refuerza (`xpAward = 100`, `LEAST(1000, …)`) aunque la BD aún tenga valores viejos.
- 🎯 El `quiz/complete` solo premia en **perfecto** (`correct === total`); si no, `completed: false, xp_awarded: 0`.
- 📶 Niveles por XP acumulado y `% = xp / total`.
- 🏆 Logros automáticos vía `GamificationService.evaluateAchievements` (`Primer Paso`, `Mente Brillante`, `Maestro de …`).
- 🧭 Desbloqueo de misiones por misión anterior completada (más `nivelActivo` del perfil).

---

## 🐳 Docker

```bash
docker build -f codeAsent/Dockerfile -t codeascent .
docker run -p 3000:3000 codeascent
```

El build multi-stage compila el frontend, lo sirve desde `backend/public` y expone todo en el `:3000` del backend.

---

## ⚠️ Convenciones y detalles a tener en cuenta

- 🇪🇸 Código, identificadores, mensajes de API y scripts en **español** (`construir`, `iniciar`, `sembrar`, campo `exito`). No los renombres a inglés.
- 🔐 Auth: JWT Bearer (`autenticacion.middleware.ts`).
- 📡 Los servicios frontend deben usar `environment.apiUrl`. Excepción histórica (no copiar): `services/sql.service.ts` hardcodea `http://localhost:3000/api/sql`.
- 📦 El frontend tiene `package-lock.json` **y** `pnpm-lock.yaml` a la vez; `angular.json` dice `npm` pero `package.json` dice `pnpm@9.0.0`. Usa **pnpm**.
- 🧩 `backend/pnpm-workspace.yaml` solo desactiva scripts de esbuild — no es un monorepo.
- 🙈 Los `.env` están gitiados como ignorados: jamás commitear ni pegar su contenido.

---

## 🤝 Contribuir

1. 🍴 Haz fork y crea tu rama (`test/TuModulo-vX`).
2. 💻 Desarrolla con `pnpm dev` + `pnpm start` y formatea con Prettier.
3. ✅ Verifica `pnpm build` (frontend) y `pnpm exec tsc --noEmit` (backend).
4. 📬 Abre tu PR en español con emojis y checklist de pruebas. ¡Gracias por sumar! 💜

---

## 📄 Licencia

MIT © 2026 joelArchila-2022283 — ver [LICENSE](./LICENSE). 📜
