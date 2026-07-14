# RHG Maderas — Sitio web + CRM

**Next.js 14 · Supabase · Resend · Railway**

Reemplaza el child theme de WordPress y los flujos de n8n
(`rhg_solo_sheets.json`, `rhg_maderas_flujo_cotizacion.json`) con una sola
aplicación: sitio público + CRM + CMS de bloques, todo en el mismo repo.

---

## Contenido

- [Qué incluye](#qué-incluye)
- [Stack y requisitos](#stack-y-requisitos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [1. Crear el proyecto en Supabase](#1-crear-el-proyecto-en-supabase)
- [2. Email (Resend)](#2-email-resend)
- [3. Variables de entorno](#3-variables-de-entorno)
- [4. Desarrollo local](#4-desarrollo-local)
- [5. Desplegar en Railway](#5-desplegar-en-railway)
- [6. Diferencias vs. lo que tenían antes](#6-diferencias-vs-lo-que-tenían-antes)
- [Notas de seguridad](#notas-de-seguridad)

---

## Qué incluye

| Módulo | Ruta | Descripción |
|---|---|---|
| **Sitio público** | `/` | Landing con formulario de cotización. El contenido (hero, textos, productos, estadísticas) se lee de Supabase y se edita desde el CRM. |
| **API de leads** | `/api/leads` | Recibe el formulario, guarda el lead en Supabase y envía emails de notificación al equipo y confirmación al cliente (reemplaza el workflow de n8n). |
| **CRM** | `/crm` | Login con Supabase Auth, tablero de leads con filtros, detalle de lead (estado, vendedor asignado, notas). |
| **Gestión de equipo** | `/crm/team` | Alta de usuarios por invitación, asignación de roles y ubicación. Solo accesible para `admin`. |
| **CMS de bloques** | `/crm/paginas` | Crear páginas, publicarlas o dejarlas en borrador, y editar su contenido por bloques sin tocar código. Solo `admin`. |

### Editor de bloques — qué es y qué no es

Es un editor de bloques **simplificado**, no un clon de Gutenberg/Elementor.
Ofrece 8 tipos de bloque fijos con formularios propios, reordenamiento con
flechas ↑/↓ (no drag & drop), y sin anidamiento de columnas.

| Tipo de bloque | Descripción |
|---|---|
| `hero` | Imagen de fondo, título principal y subtítulo |
| `titulo` | Encabezado de sección con texto opcional |
| `texto` | Párrafo de contenido libre |
| `imagen` | Imagen con pie de foto opcional |
| `productos` | Cuadrícula de tarjetas de productos (nombre, imagen, descripción) |
| `estadisticas` | Fila de cifras destacadas (número + etiqueta) |
| `banner` | Banner con llamada a la acción y botón enlazable |
| `espaciador` | Separador de altura configurable |

La página con slug `home` es la que se muestra en `/`.

---

## Stack y requisitos

| | |
|---|---|
| **Framework** | Next.js 14.2 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **UI** | React 18 + Tailwind CSS 3 |
| **Base de datos / Auth** | Supabase (Postgres + RLS + Auth) |
| **Email** | Resend 4 |
| **Validación** | Zod 3 |
| **Deploy** | Railway |
| **Node.js** | ≥ 18.17 (requerido por Next.js 14) |
| **npm** | ≥ 9 |

---

## Estructura del proyecto

```
rhg-maderas-app/
├── app/
│   ├── api/
│   │   └── leads/          # POST /api/leads — guarda lead + envía emails
│   ├── crm/
│   │   ├── (dashboard)/    # Rutas protegidas del CRM (layout con auth check)
│   │   │   ├── leads/      # Listado y detalle de leads
│   │   │   ├── paginas/    # CMS de bloques (listar / editar páginas)
│   │   │   └── team/       # Gestión del equipo
│   │   └── login/          # Página de login pública
│   ├── globals.css
│   ├── layout.tsx          # Root layout (fuentes, metadata global)
│   └── page.tsx            # Landing pública — renderiza bloques de "home"
│
├── components/
│   ├── blocks/
│   │   └── BlockRenderer.tsx   # Renderiza cada tipo de bloque del CMS
│   ├── crm/                    # Componentes internos del CRM
│   ├── QuoteForm.tsx           # Formulario de cotización (sitio público)
│   ├── LeadStatusSelect.tsx    # Selector de estado del lead
│   ├── LeadAssignSelect.tsx    # Selector de vendedor asignado
│   ├── LeadNoteForm.tsx        # Formulario de notas del lead
│   ├── InviteTeamMemberForm.tsx
│   ├── TeamMemberRow.tsx
│   └── SignOutButton.tsx
│
├── lib/
│   ├── email.ts            # Funciones de envío de email con Resend
│   └── supabase/
│       ├── client.ts       # Cliente Supabase para el navegador
│       ├── server.ts       # Cliente Supabase para Server Components / Actions
│       └── middleware.ts   # Cliente Supabase para el middleware de Next.js
│
├── supabase/
│   └── schema.sql          # DDL completo: tablas, enums, triggers, RLS
│
├── types/
│   └── database.ts         # Tipos TypeScript generados del esquema de Supabase
│
├── middleware.ts            # Protege /crm/** — redirige a /crm/login sin sesión
├── .env.example             # Plantilla de variables de entorno
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**.
2. Una vez creado, entra a **SQL Editor** → pega el contenido de
   `supabase/schema.sql` → **Run**. Esto crea las tablas `profiles`,
   `leads`, `lead_notes`, los enums, triggers y las políticas de RLS.
3. En **Project Settings → API**, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` _(secreta, solo servidor)_
4. En **Authentication → Providers**, deja Email habilitado. En
   **Authentication → URL Configuration**, agrega tu dominio final
   (`https://rhgmaderas.com` y `https://tu-app.up.railway.app`) a
   *Redirect URLs* (necesario para el correo de invitación).

### Crear el primer usuario admin

El primer usuario se crea a mano; los siguientes ya se invitan desde
`/crm/team`:

1. **Authentication → Users → Add user** (con contraseña, o "Send invite").
2. El alta manual no pasa `raw_user_meta_data`, así que después de crearlo
   actualiza el perfil en el SQL Editor:

   ```sql
   update public.profiles
   set role = 'admin', full_name = 'Tu Nombre', location = 'ambas'
   where id = 'UUID-DEL-USUARIO'; -- lo ves en Authentication → Users
   ```

---

## 2. Email (Resend)

1. Crea cuenta en [resend.com](https://resend.com) y verifica el dominio
   `rhgmaderas.com` (registros DNS que te da Resend).
2. Genera un API key → `RESEND_API_KEY`.
3. Si no configuras `RESEND_API_KEY`, la app sigue funcionando (el lead se
   guarda igual); simplemente no se envían los correos.

---

## 3. Variables de entorno

Copia `.env.example` a `.env.local` para desarrollo, y carga las mismas
variables en Railway (**Variables** del servicio).

```env
# ── Supabase ──────────────────────────────────────────────
# Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_publica

# ¡Secreta! Solo se usa en el servidor. Nunca exponerla al cliente.
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# ── Email (Resend) ─────────────────────────────────────────
RESEND_API_KEY=tu_resend_api_key
EMAIL_FROM_NOTIFICACIONES="RHG Maderas <notificaciones@rhgmaderas.com>"
EMAIL_FROM_COTIZACIONES="RHG Maderas <cotizaciones@rhgmaderas.com>"
EMAIL_EQUIPO=tu_correo_de_equipo@ejemplo.com

# ── App ───────────────────────────────────────────────────
# URL pública final (sin barra final)
NEXT_PUBLIC_SITE_URL=https://rhgmaderas.com

# ── Google Sheets (respaldo opcional) ─────────────────────
# URL del webhook que recibirá cada lead nuevo.
# Ver sección "Respaldo en Google Sheets" más abajo.
GOOGLE_SHEETS_WEBHOOK_URL=
```

| Variable | Requerida | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Llave pública (navegador) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Llave secreta (solo servidor) |
| `RESEND_API_KEY` | ⚠️ Opcional | Sin ella los emails no se envían |
| `EMAIL_FROM_NOTIFICACIONES` | ⚠️ Opcional | Remitente de emails al equipo |
| `EMAIL_FROM_COTIZACIONES` | ⚠️ Opcional | Remitente de confirmación al cliente |
| `EMAIL_EQUIPO` | ⚠️ Opcional | Destinatario de notificaciones internas |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL pública — usada en emails y redirecciones |
| `GOOGLE_SHEETS_WEBHOOK_URL` | ⚠️ Opcional | Webhook para copiar cada lead a Google Sheets |

---

## 4. Desarrollo local

**Requisitos:** Node.js ≥ 18.17 y npm ≥ 9.

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# → Edita .env.local con tus credenciales de Supabase y Resend

# 3. Iniciar servidor de desarrollo
npm run dev
```

| URL | Descripción |
|---|---|
| `http://localhost:3000` | Sitio público (landing + formulario) |
| `http://localhost:3000/crm/login` | Login del CRM |
| `http://localhost:3000/crm` | Tablero de leads |
| `http://localhost:3000/crm/paginas` | Editor de páginas / CMS |
| `http://localhost:3000/crm/team` | Gestión de equipo |

### Comandos disponibles

```bash
npm run dev    # Servidor de desarrollo con hot reload
npm run build  # Build de producción
npm run start  # Inicia el servidor en producción (usa $PORT o 3000)
npm run lint   # ESLint
```

---

## 5. Desplegar en Railway

1. Sube este proyecto a un repo de GitHub.
2. En [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Railway detecta Next.js automáticamente (`npm run build` + `npm run start`
   con `-p $PORT`, ya configurado en `package.json`).
4. Agrega las variables de entorno del [paso 3](#3-variables-de-entorno) en
   **Variables** del servicio.
5. Una vez desplegado, en Supabase (**Authentication → URL Configuration**)
   agrega la URL que te da Railway como Redirect URL.
6. Apunta tu dominio (`rhgmaderas.com`) al servicio desde **Settings →
   Domains** en Railway y crea el CNAME que te indique en tu proveedor de DNS.

---

## 6. Diferencias vs. lo que tenían antes

| Antes | Ahora |
|---|---|
| Child theme de WordPress (`rhg-childtheme`) | `app/page.tsx` + CMS de bloques (`/crm/paginas`) |
| Hosting de WordPress | Railway (Next.js) |
| Flujo n8n de cotización (`rhg_maderas_flujo_cotizacion.json`) | `app/api/leads/route.ts` + Resend |
| Flujo n8n de Google Sheets (`rhg_solo_sheets.json`) | Supabase + respaldo opcional vía `GOOGLE_SHEETS_WEBHOOK_URL` |

### Respaldo en Google Sheets

Cada lead nuevo se puede enviar automáticamente a una hoja de cálculo como
respaldo. La integración ya está implementada en `app/api/leads/route.ts`;
solo necesitas un webhook que reciba el JSON y escriba la fila.

**Opción A — Google Apps Script** (sin servicios externos):

1. Abre tu Google Sheet → **Extensiones → Apps Script**.
2. Crea un script `doPost` que lea `e.postData.contents` y llame a
   `sheet.appendRow([...])` con los campos del payload.
3. Despliega como **Web App** (cualquiera puede acceder) y copia la URL.
4. Pégala en `GOOGLE_SHEETS_WEBHOOK_URL`.

El payload que recibe el webhook tiene esta forma:

```json
{
  "id": "uuid",
  "nombre": "Carlos López",
  "telefono": "555-1234",
  "correo": "carlos@ejemplo.com",
  "ciudad": "Guadalajara",
  "producto": "Pino",
  "mensaje": "Necesito 50 tablones de 2x4",
  "estado": "nuevo",
  "fuente": "formulario_web",
  "created_at": "2026-07-13T20:00:00Z"
}
```

**Opción B — Make o Zapier**: crea un webhook trigger en Make/Zapier,
copia la URL del webhook, pégala en `GOOGLE_SHEETS_WEBHOOK_URL`, y
conecta la acción de agregar fila a tu hoja.

> Si `GOOGLE_SHEETS_WEBHOOK_URL` está vacía, el respaldo simplemente no
> se activa — la app funciona igual.

---

## Notas de seguridad

- **`SUPABASE_SERVICE_ROLE_KEY`** nunca debe usarse en código de cliente ni
  exponerse en el navegador. Solo se usa en `app/api/leads/route.ts` y en
  `app/crm/(dashboard)/team/actions.ts` (invitar usuarios), ambos server-side.
- **Acceso al CRM** (`/crm/**`) está protegido por `middleware.ts`, que
  redirige a `/crm/login` si no hay sesión activa.
- **Row Level Security** en Supabase garantiza que un vendedor solo vea los
  leads de su ubicación o los que tenga asignados; el admin ve todo.
- Las variables con prefijo `NEXT_PUBLIC_` son visibles en el navegador —
  nunca pongas secretos en ellas.
