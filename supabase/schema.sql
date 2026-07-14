-- ============================================================================
-- RHG Maderas — Esquema de Supabase (Postgres)
-- Ejecutar en el SQL Editor de tu proyecto de Supabase (una sola vez).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'vendedor');
create type public.user_location as enum ('durango', 'guadalajara', 'ambas');
create type public.lead_status as enum ('nuevo', 'contactado', 'cotizado', 'cerrado', 'perdido');
create type public.lead_source as enum ('formulario_web', 'whatsapp', 'telefono', 'referido', 'otro');

-- ----------------------------------------------------------------------------
-- PROFILES — extiende auth.users con rol y ubicación.
-- Se crea automáticamente vía trigger cuando alguien se registra en Supabase Auth.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  role          public.user_role not null default 'vendedor',
  location      public.user_location not null default 'ambas',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

comment on table public.profiles is 'Datos de negocio de cada usuario del CRM (equipo RHG Maderas).';

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'vendedor'),
    coalesce((new.raw_user_meta_data->>'location')::public.user_location, 'ambas')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- LEADS — cotizaciones recibidas (reemplaza el Google Sheet / n8n).
-- ----------------------------------------------------------------------------
create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  telefono      text,
  correo        text,
  ciudad        text,
  producto      text,
  mensaje       text,
  estado        public.lead_status not null default 'nuevo',
  fuente        public.lead_source not null default 'formulario_web',
  assigned_to   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index leads_estado_idx on public.leads(estado);
create index leads_assigned_to_idx on public.leads(assigned_to);
create index leads_created_at_idx on public.leads(created_at desc);

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- LEAD_NOTES — historial de interacciones / notas por lead.
-- ----------------------------------------------------------------------------
create table public.lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  note        text not null,
  created_at  timestamptz not null default now()
);

create index lead_notes_lead_id_idx on public.lead_notes(lead_id);

-- ----------------------------------------------------------------------------
-- RLS
-- Admin ve/edita todo. Vendedor ve leads de su ubicación (comparando
-- profiles.location contra el texto libre de leads.ciudad) o los que tenga
-- asignados. El INSERT público del formulario web se hace desde la API con
-- la service_role key, que ignora RLS.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;

create function public.current_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create function public.current_location()
returns public.user_location as $$
  select location from public.profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_admin_manage"
  on public.profiles for all
  to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "leads_select_scoped"
  on public.leads for select
  to authenticated
  using (
    public.current_role() = 'admin'
    or assigned_to = auth.uid()
    or public.current_location() = 'ambas'
    or lower(ciudad) = lower(public.current_location()::text)
  );

create policy "leads_update_scoped"
  on public.leads for update
  to authenticated
  using (
    public.current_role() = 'admin'
    or assigned_to = auth.uid()
    or public.current_location() = 'ambas'
    or lower(ciudad) = lower(public.current_location()::text)
  );

create policy "leads_admin_insert"
  on public.leads for insert
  to authenticated
  with check (public.current_role() = 'admin');

create policy "leads_admin_delete"
  on public.leads for delete
  to authenticated
  using (public.current_role() = 'admin');

create policy "lead_notes_select_scoped"
  on public.lead_notes for select
  to authenticated
  using (
    exists (select 1 from public.leads l where l.id = lead_notes.lead_id)
  );

create policy "lead_notes_insert_authenticated"
  on public.lead_notes for insert
  to authenticated
  with check (author_id = auth.uid());

-- ----------------------------------------------------------------------------
-- El formulario público (app/api/leads) usa SUPABASE_SERVICE_ROLE_KEY desde
-- el servidor para insertar leads sin necesidad de sesión. Esa key NUNCA debe
-- exponerse al navegador.
-- ----------------------------------------------------------------------------


-- ============================================================================
-- CMS — páginas y bloques (gestor de contenido tipo WordPress, simplificado)
-- ============================================================================

create type public.page_status as enum ('borrador', 'publicada');

create type public.block_type as enum (
  'hero', 'heading', 'text', 'image', 'product_grid', 'stats', 'cta_banner', 'spacer'
);

create table public.pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,        -- 'home' = página de inicio del sitio
  title       text not null,
  status      public.page_status not null default 'borrador',
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute procedure public.set_updated_at();

create table public.page_blocks (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages(id) on delete cascade,
  type        public.block_type not null,
  position    integer not null default 0,
  -- Contenido específico de cada tipo de bloque, ej:
  --   hero:         { "titulo", "subtitulo", "cta_label", "cta_href" }
  --   heading:      { "texto", "nivel" }
  --   text:         { "texto" }
  --   image:        { "url", "alt" }
  --   product_grid: { "titulo", "items": [{ "nombre", "desc" }] }
  --   stats:        { "items": [{ "value", "label" }] }
  --   cta_banner:   { "titulo", "subtitulo", "boton_label", "boton_href" }
  --   spacer:       { "alto" }
  content     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index page_blocks_page_id_idx on public.page_blocks(page_id, position);

create trigger page_blocks_set_updated_at
  before update on public.page_blocks
  for each row execute procedure public.set_updated_at();

alter table public.pages enable row level security;
alter table public.page_blocks enable row level security;

-- Lectura pública: cualquiera (incluido el visitante anónimo del sitio) puede
-- leer páginas publicadas y sus bloques.
create policy "pages_public_read_published"
  on public.pages for select
  to anon, authenticated
  using (status = 'publicada' or public.current_role() = 'admin');

create policy "page_blocks_public_read_published"
  on public.page_blocks for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.pages p
      where p.id = page_blocks.page_id
        and (p.status = 'publicada' or public.current_role() = 'admin')
    )
  );

-- Escritura: solo admin gestiona contenido (mismo rol que gestiona el equipo).
create policy "pages_admin_write"
  on public.pages for all
  to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "page_blocks_admin_write"
  on public.page_blocks for all
  to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ----------------------------------------------------------------------------
-- Seed: página de inicio con el contenido actual como bloques editables.
-- ----------------------------------------------------------------------------
insert into public.pages (slug, title, status)
values ('home', 'Inicio', 'publicada');

do $$
declare
  home_id uuid;
begin
  select id into home_id from public.pages where slug = 'home';

  insert into public.page_blocks (page_id, type, position, content) values
  (home_id, 'hero', 1, jsonb_build_object(
    'titulo', 'Madera que dura décadas, no temporadas',
    'subtitulo', 'Madera tratada CCA, decks de cumaru e ipe, vigas estufadas y maderas tropicales para construcción, arquitectura y diseño.',
    'cta_label', 'Solicitar cotización',
    'cta_href', '#cotizar'
  )),
  (home_id, 'product_grid', 2, jsonb_build_object(
    'titulo', 'Nuestros productos',
    'items', jsonb_build_array(
      jsonb_build_object('nombre', 'Madera Tratada CCA', 'desc', 'Protección contra pudrición, termitas y humedad para exterior.'),
      jsonb_build_object('nombre', 'Deck de Cumaru', 'desc', 'Madera tropical de alta densidad, ideal para terrazas y decks.'),
      jsonb_build_object('nombre', 'Deck de Ipe', 'desc', 'Una de las maderas más duraderas del mercado para exteriores.'),
      jsonb_build_object('nombre', 'Vigas Estufadas', 'desc', 'Vigas secadas en horno para estructuras y acabados arquitectónicos.'),
      jsonb_build_object('nombre', 'Triplay y Cimbras', 'desc', 'Para construcción y encofrados, distintos calibres y calidades.'),
      jsonb_build_object('nombre', 'Maderas Tropicales', 'desc', 'Variedad de especies para proyectos de diseño y construcción.')
    )
  )),
  (home_id, 'text', 3, jsonb_build_object(
    'texto', 'Somos una empresa comercializadora de madera con presencia en Durango y Guadalajara, especializada en soluciones madereras para construcción, arquitectura y diseño. Ofrecemos madera tratada, decks tropicales, vigas estufadas y triplay, con más de una década de experiencia en el sector.'
  )),
  (home_id, 'stats', 4, jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('value', '100%', 'label', 'Madera tratada'),
      jsonb_build_object('value', '6+', 'label', 'Líneas de producto'),
      jsonb_build_object('value', '2', 'label', 'Ciudades')
    )
  )),
  (home_id, 'cta_banner', 5, jsonb_build_object(
    'titulo', '¿Listo para tu proyecto?',
    'subtitulo', 'Escríbenos y te cotizamos sin costo.',
    'boton_label', 'Cotizar por WhatsApp',
    'boton_href', 'https://wa.me/526182585606'
  ));
end $$;

-- ----------------------------------------------------------------------------
-- Nota: el nav, el formulario de cotización y el footer del sitio se quedan
-- fijos en el código (tienen lógica propia). Lo editable vía CMS son los
-- bloques de contenido entre el hero y el formulario.
-- ----------------------------------------------------------------------------
