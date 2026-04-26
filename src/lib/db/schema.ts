import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@/lib/id";

// ============== AUTH (Better Auth) ==============

export const user = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============== DOMAIN ==============

export const page = pgTable(
  "page",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    coverUrl: text("cover_url"),
    integrations: jsonb("integrations").$type<PageIntegrations>().notNull().default({}),
    theme: jsonb("theme").$type<PageTheme>().notNull().default({
      preset: "minimal-white",
      background: { type: "solid", color: "#ffffff" },
      foreground: "#0f172a",
      mutedForeground: "#64748b",
      accent: "#6366f1",
      accentForeground: "#ffffff",
      font: "inter",
      titleFont: "inter",
      buttonStyle: "rounded",
      avatarShape: "circle",
      spacing: "normal",
      effect: "none",
    }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    published: boolean("published").notNull().default(false),
    customDomain: text("custom_domain").unique(),
    customCss: text("custom_css"),
    customJs: text("custom_js"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("page_user_idx").on(t.userId),
  })
);

export const block = pgTable(
  "block",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    type: text("type").$type<BlockType>().notNull(),
    data: jsonb("data").$type<BlockData>().notNull(),
    style: jsonb("style").$type<BlockStyle>().notNull().default({}),
    position: integer("position").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    isGoal: boolean("is_goal").notNull().default(false),
    lockedBy: text("locked_by").references(() => user.id, { onDelete: "set null" }),
    lockedAt: timestamp("locked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pageIdx: index("block_page_idx").on(t.pageId),
    positionIdx: index("block_position_idx").on(t.pageId, t.position),
  })
);

// ============== COLABORAÇÃO EM EQUIPE ==============

export type CollaboratorRole = "editor" | "viewer";

export const pageCollaborator = pgTable(
  "page_collaborator",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").$type<CollaboratorRole>().notNull().default("editor"),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    acceptedAt: timestamp("accepted_at"),
  },
  (t) => ({
    uniqPageUser: uniqueIndex("collab_page_user_unique").on(t.pageId, t.userId),
    pageIdx: index("collab_page_idx").on(t.pageId),
    userIdx: index("collab_user_idx").on(t.userId),
  })
);

export const pageInvite = pgTable(
  "page_invite",
  {
    id: text("id").primaryKey(), // token de convite — createId(32) gerado na action
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").$type<CollaboratorRole>().notNull().default("editor"),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
  },
  (t) => ({
    uniqPageEmail: uniqueIndex("invite_page_email_unique").on(t.pageId, t.email),
    pageIdx: index("invite_page_idx").on(t.pageId),
  })
);

export const collabPresence = pgTable(
  "collab_presence",
  {
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastSeen: timestamp("last_seen").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("presence_page_user_unique").on(t.pageId, t.userId),
    pageIdx: index("presence_page_idx").on(t.pageId),
  })
);

export type PageCollaborator = typeof pageCollaborator.$inferSelect;
export type PageInvite = typeof pageInvite.$inferSelect;
export type CollabPresence = typeof collabPresence.$inferSelect;

export type BlockStyle = {
  background?: string;
  color?: string;
  fontSize?: number; // px — 10..48
  fontWeight?: 400 | 500 | 600 | 700 | 800 | 900;
  fontFamily?: FontKey;
  borderRadius?: number; // px — 0..48
  borderWidth?: number; // px — 0..6
  borderColor?: string;
  textAlign?: "left" | "center" | "right";
  padding?: number; // px — 8..32
  // Gradiente (sobrepõe background sólido)
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number; // 0..360 — default 90 (esquerda → direita)
  // Imagem de fundo (sobrepõe gradiente/cor)
  bgImage?: string;
  bgImagePosition?: "right" | "left" | "cover" | "center";
};

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    blockId: text("block_id").references(() => block.id, { onDelete: "set null" }),
    type: text("type").$type<EventType>().notNull(),
    // contexto anônimo — cuidado com PII
    referrer: text("referrer"),
    country: text("country"),
    device: text("device"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pageIdx: index("event_page_idx").on(t.pageId, t.createdAt),
  })
);

export type PlanTier = "free" | "pro" | "business";

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan").$type<PlanTier>().notNull().default("free"),
  // Reutiliza colunas stripe_* sem migration (renomeadas só no TS)
  gatewayCustomerId: text("stripe_customer_id"),
  gatewaySubscriptionId: text("stripe_subscription_id"),
  gatewayProductId: text("stripe_price_id"),
  status: text("status"), // active, trial, pending, canceled, past_due...
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  trialUsed: boolean("trial_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Subscription = typeof subscription.$inferSelect;

export const abuseReport = pgTable(
  "abuse_report",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pageId: text("page_id").references(() => page.id, { onDelete: "cascade" }),
    shortLinkId: text("short_link_id"),
    reporterEmail: text("reporter_email"),
    reason: text("reason").notNull(),
    description: text("description"),
    status: text("status").$type<"pending" | "reviewed" | "dismissed">()
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (t) => ({
    pageIdx: index("abuse_report_page_idx").on(t.pageId),
    statusIdx: index("abuse_report_status_idx").on(t.status),
  })
);

export type AbuseReport = typeof abuseReport.$inferSelect;

export const newsletterSubscriber = pgTable(
  "newsletter_subscriber",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    blockId: text("block_id"),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pageEmailIdx: uniqueIndex("newsletter_page_email_idx").on(
      t.pageId,
      t.email
    ),
  })
);

export const formSubmission = pgTable(
  "form_submission",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    pageId: text("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    blockId: text("block_id").notNull(),
    data: jsonb("data").$type<Record<string, string>>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pageIdx: index("form_submission_page_idx").on(t.pageId, t.createdAt),
  })
);

export type NewsletterSubscriber = typeof newsletterSubscriber.$inferSelect;
export type FormSubmissionRow = typeof formSubmission.$inferSelect;

export const templateStat = pgTable("template_stat", {
  templateId: text("template_id").primaryKey(),
  usageCount: integer("usage_count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userTemplate = pgTable(
  "user_template",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    emoji: text("emoji"),
    category: text("category").notNull(),
    description: text("description"),
    theme: jsonb("theme").$type<PageTheme>().notNull(),
    blocks: jsonb("blocks").$type<{ type: BlockType; data: BlockData }[]>().notNull(),
    suggestedTitle: text("suggested_title"),
    suggestedBio: text("suggested_bio"),
    published: boolean("published").notNull().default(true),
    usageCount: integer("usage_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("user_template_user_idx").on(t.userId),
    publishedIdx: index("user_template_published_idx").on(t.published, t.usageCount),
  })
);

export type UserTemplate = typeof userTemplate.$inferSelect;

export const shortLink = pgTable(
  "short_link",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    url: text("url").notNull(),
    title: text("title"),
    clicks: integer("clicks").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("short_link_user_idx").on(t.userId),
  })
);

export type ShortLink = typeof shortLink.$inferSelect;

// ============== TYPES ==============

export type FontKey =
  | "inter"
  | "poppins"
  | "space-grotesk"
  | "dm-sans"
  | "manrope"
  | "mulish"
  | "playfair"
  | "bebas"
  | "jetbrains-mono"
  | "instrument-serif"
  | "caveat"
  | "dancing-script";

export type ThemeBackground =
  | { type: "solid"; color: string }
  | {
      type: "gradient";
      from: string;
      to: string;
      via?: string;
      direction:
        | "to-br"
        | "to-bl"
        | "to-tr"
        | "to-tl"
        | "to-r"
        | "to-b";
    }
  | { type: "image"; url: string; overlay?: string; blur?: boolean };

export type ButtonStyle =
  | "rounded"
  | "sharp"
  | "pill"
  | "outline"
  | "neubrutalism"
  | "glass"
  | "shadow"
  | "underline";

export type AvatarShape = "circle" | "square" | "rounded" | "hexagon";
export type Spacing = "tight" | "normal" | "loose";
export type Effect = "none" | "noise" | "stars" | "gradient-mesh" | "grid";

export type PageIntegrations = {
  metaPixelId?: string;
  gaId?: string; // G-XXXXXXXXXX
  gtmId?: string; // GTM-XXXXXXX
  tiktokPixelId?: string;
};

export type EntryAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "scale"
  | "stagger";
export type ButtonHover = "none" | "lift" | "tilt" | "glare";
export type ButtonWidth = "full" | "auto";
export type CursorStyle =
  | "default"
  | "pointer"
  | "sparkle"
  | "heart"
  | "fire"
  | "star";
export type ClickSound = "none" | "pop" | "click" | "ding" | "tap";

export type PageTheme = {
  preset?: string;
  background: ThemeBackground;
  foreground: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  font: FontKey;
  titleFont?: FontKey;
  buttonStyle: ButtonStyle;
  avatarShape: AvatarShape;
  spacing: Spacing;
  effect: Effect;
  entryAnimation?: EntryAnimation;
  buttonHover?: ButtonHover;
  buttonWidth?: ButtonWidth;
  customFontUrl?: string;
  customFontName?: string;
  darkModeAuto?: boolean;
  cursor?: CursorStyle;
  clickSound?: ClickSound;
  hideBranding?: boolean;
  coverFade?: boolean;
  avatarPlain?: boolean;
};

export type BlockType =
  | "link"
  | "text"
  | "image"
  | "video"
  | "divider"
  | "newsletter"
  | "whatsapp"
  | "music"
  | "social-embed"
  | "form"
  | "countdown"
  | "faq"
  | "testimonials"
  | "map"
  | "events"
  | "products"
  | "grid"
  | "image-carousel"
  | "product-grid"
  | "product-carousel"
  | "button-grid"
  | "spacer";

export type GridColumns = 1 | 2 | 3;

export type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "phone";
  required?: boolean;
};

export type BlockData =
  | { kind: "link"; label: string; url: string; icon?: string }
  | { kind: "text"; content: string; align?: "left" | "center" | "right" }
  | { kind: "image"; url: string; alt?: string; href?: string }
  | { kind: "video"; provider: "youtube" | "vimeo"; videoId: string }
  | { kind: "divider" }
  | { kind: "spacer"; height: number }
  | {
      kind: "newsletter";
      title: string;
      description?: string;
      buttonLabel: string;
      placeholder: string;
      provider?: "internal" | "resend" | "mailchimp";
      apiKey?: string;
      listId?: string;
    }
  | {
      kind: "whatsapp";
      label: string;
      phone: string;
      message?: string;
    }
  | {
      kind: "music";
      provider: "spotify" | "apple";
      url: string;
    }
  | {
      kind: "social-embed";
      provider: "instagram" | "tiktok";
      url: string;
    }
  | {
      kind: "form";
      title: string;
      submitLabel: string;
      successMessage?: string;
      fields: FormField[];
    }
  | {
      kind: "countdown";
      title: string;
      targetDate: string; // ISO
      finishedMessage?: string;
    }
  | {
      kind: "faq";
      items: { q: string; a: string }[];
    }
  | {
      kind: "testimonials";
      items: { name: string; role?: string; quote: string; avatarUrl?: string }[];
    }
  | {
      kind: "map";
      query: string; // endereço ou "lat,lng"
      label?: string;
    }
  | {
      kind: "events";
      items: { title: string; date: string; city?: string; url?: string }[];
    }
  | {
      kind: "products";
      items: { title: string; price?: string; imageUrl?: string; url?: string }[];
    }
  | {
      kind: "grid";
      columns: GridColumns;
      items: { title?: string; imageUrl?: string; url?: string }[];
    }
  | {
      kind: "image-carousel";
      aspect?: "1:1" | "3:4" | "12:16" | "9:16" | "4:3" | "16:12" | "16:9";
      items: { imageUrl: string; caption?: string; url?: string }[];
    }
  | {
      kind: "product-grid";
      columns: GridColumns;
      items: { title: string; price?: string; imageUrl?: string; url?: string }[];
    }
  | {
      kind: "product-carousel";
      items: { title: string; price?: string; imageUrl?: string; url?: string }[];
    }
  | {
      kind: "button-grid";
      columns: GridColumns;
      style?: "filled" | "plain";
      items: { label: string; url: string; icon?: string }[];
    };

export type EventType = "view" | "click";

export type User = typeof user.$inferSelect;
export type Page = typeof page.$inferSelect;
export type Block = typeof block.$inferSelect;
export type Event = typeof event.$inferSelect;
