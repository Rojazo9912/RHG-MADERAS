// Tipos que reflejan supabase/schema.sql.
// Si el esquema cambia, actualiza estos tipos a mano (o genera con
// `supabase gen types typescript` una vez tengas el CLI configurado).

export type UserRole = "admin" | "vendedor";
export type UserLocation = "durango" | "guadalajara" | "ambas";
export type LeadStatus = "nuevo" | "contactado" | "cotizado" | "cerrado" | "perdido";
export type LeadSource = "formulario_web" | "whatsapp" | "telefono" | "referido" | "otro";

// Nota: estas se definen con `type` (no `interface`) a proposito. El cliente
// de Supabase valida en tiempo de compilacion que cada Row sea asignable a
// Record<string, unknown>, y por una particularidad de TypeScript las
// `interface` no satisfacen ese chequeo (mientras que los alias `type` si) -
// usar `interface` aqui rompe la inferencia de `.update()/.insert()`.
export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  location: UserLocation;
  active: boolean;
  created_at: string;
};

export type Lead = {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  ciudad: string | null;
  producto: string | null;
  mensaje: string | null;
  estado: LeadStatus;
  fuente: LeadSource;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadNote = {
  id: string;
  lead_id: string;
  author_id: string | null;
  note: string;
  created_at: string;
};

export type PageStatus = "borrador" | "publicada";
export type BlockType =
  | "hero"
  | "heading"
  | "text"
  | "image"
  | "product_grid"
  | "stats"
  | "cta_banner"
  | "spacer";

export type Page = {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductGridItem = {
  nombre: string;
  desc: string;
  image_url?: string;
};

export type StatsItem = {
  value: string;
  label: string;
};

export type BlockContent = {
  // hero / cta_banner
  titulo?: string;
  subtitulo?: string;
  cta_label?: string;
  cta_href?: string;
  boton_label?: string;
  boton_href?: string;
  // heading
  texto?: string;
  nivel?: 2 | 3;
  // image
  url?: string;
  alt?: string;
  // product_grid / stats
  items?: ProductGridItem[] | StatsItem[];
  // spacer
  alto?: number;
};

export type PageBlock = {
  id: string;
  page_id: string;
  type: BlockType;
  position: number;
  content: BlockContent;
  created_at: string;
  updated_at: string;
};

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero: "Hero (portada)",
  heading: "Título de sección",
  text: "Texto",
  image: "Imagen",
  product_grid: "Cuadrícula de productos",
  stats: "Estadísticas",
  cta_banner: "Banner con botón",
  spacer: "Espaciador",
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: Partial<Lead> & { nombre: string };
        Update: Partial<Lead>;
        Relationships: [];
      };
      lead_notes: {
        Row: LeadNote;
        Insert: Partial<LeadNote> & { lead_id: string; note: string };
        Update: Partial<LeadNote>;
        Relationships: [];
      };
      pages: {
        Row: Page;
        Insert: Partial<Page> & { slug: string; title: string };
        Update: Partial<Page>;
        Relationships: [];
      };
      page_blocks: {
        Row: PageBlock;
        Insert: Partial<PageBlock> & { page_id: string; type: BlockType };
        Update: Partial<PageBlock>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      user_location: UserLocation;
      lead_status: LeadStatus;
      lead_source: LeadSource;
      page_status: PageStatus;
      block_type: BlockType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cotizado: "Cotizado",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  nuevo: "bg-amber-light/20 text-amber-DEFAULT",
  contactado: "bg-blue-100 text-blue-700",
  cotizado: "bg-forest/20 text-forest",
  cerrado: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-700",
};
