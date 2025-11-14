# TSVTool - Tierverwaltungs-System für TSV Strassenpfoten e.V.

Ein modernes Tierverwaltungs-Tool für TSV Strassenpfoten e.V., gebaut mit Next.js 16 und Convex.

## Features

- **Rollenbasiertes Zugriffssystem**
  - Admin: Vollzugriff, Benutzerverwaltung
  - Input: Bulgarisches Team - Erstellung von Tierprofilen
  - Manager: Deutsches Team - Bearbeitung und Finalisierung

- **Automatische Workflows**
  - Automatische Validierung von Entwürfen
  - Automatische Übersetzung von Bulgarisch → Deutsch (Google Translate API)
  - Automatische Distribution zu externen Plattformen

- **Integrationen**
  - WordPress (Avada Portfolio)
  - Facebook
  - Instagram
  - X (Twitter)
  - matchpfote API

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend:** Convex (Database, Auth, File Storage, Actions)
- **Authentifizierung:** Convex Auth mit Email/Passwort
- **Styling:** Tailwind CSS mit TSV Strassenpfoten Branding

## Installation

### Voraussetzungen

- Node.js 18+
- pnpm (empfohlen) oder npm

### Setup

1. Repository klonen und Dependencies installieren:

```bash
pnpm install
```

2. Convex Setup:

```bash
npx convex dev
```

3. Environment Variables konfigurieren (`.env.local`):

```env
# Convex
CONVEX_DEPLOYMENT=<your-deployment-url>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

# Google Translate
GOOGLE_TRANSLATE_API_KEY=<your-api-key>

# WordPress
WORDPRESS_URL=https://tsvstrassenpfoten.de
WORDPRESS_APP_USERNAME=<username>
WORDPRESS_APP_PASSWORD=<app-password>

# Facebook
FACEBOOK_PAGE_ID=<page-id>
FACEBOOK_ACCESS_TOKEN=<access-token>

# Instagram
INSTAGRAM_BUSINESS_ACCOUNT_ID=<account-id>
INSTAGRAM_ACCESS_TOKEN=<access-token>

# X (Twitter)
TWITTER_API_KEY=<api-key>
TWITTER_API_SECRET=<api-secret>
TWITTER_ACCESS_TOKEN=<access-token>
TWITTER_ACCESS_TOKEN_SECRET=<access-token-secret>

# matchpfote
MATCHPFOTE_API_KEY=<api-key>
MATCHPFOTE_API_URL=https://matchpfote.de/api/v1
```

4. Development Server starten:

```bash
pnpm dev
```

Die Anwendung ist nun unter `http://localhost:3000` verfügbar.

## Workflow

### 1. Input (Bulgarisches Team)

- Login mit `input` Rolle
- Neues Tierprofil erstellen (auf Bulgarisch)
- Formular ausfüllen und Bilder hochladen
- Absenden → Status: `ENTWURF`

### 2. Automatische Validierung

- System validiert automatisch alle Pflichtfelder
- Bei Erfolg: Status → `AKZEPTIERT`
- Bei Fehler: Status → `ABGELEHNT`

### 3. Automatische Übersetzung

- Bei Status `AKZEPTIERT` → Google Translate API
- Übersetzt: Beschreibung, Charaktereigenschaften, Kompatibilität
- Speichert Original (BG) und Übersetzung (DE)

### 4. Manager (Deutsches Team)

- Login mit `manager` Rolle
- Sieht akzeptierte Entwürfe
- Bearbeitet und optimiert Übersetzungen
- Finalisiert → Status: `FINALISIERT`

### 5. Automatische Distribution

- Bei Status `FINALISIERT` → Automatische Verteilung
- WordPress (Avada Portfolio post_type)
- Facebook Page Post
- Instagram Post
- X (Twitter) Tweet
- matchpfote API Sync

## Branding

Das Design folgt dem TSV Strassenpfoten Branding:

- **Farben:**
  - Accent: #09202C
  - Primary: #5C82A1
  - Background: #FFFFFF
  - Text Primary: #4A4E57
  - Input Border: #CCCCCC

- **Typography:** HelveticaNowText

## Projektstruktur

```
TSVTool/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes
│   ├── (dashboard)/        # Protected dashboard routes
│   └── ...
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   ├── animal/             # Animal-specific components
│   └── ...
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── auth.ts             # Authentication
│   ├── animals.ts          # Animal CRUD
│   ├── validation.ts       # Auto-validation
│   ├── translation.ts      # Google Translate integration
│   ├── distribution.ts     # External platform distribution
│   └── matchpfote.ts       # matchpfote API integration
├── lib/                    # Utility functions
├── types/                  # TypeScript types
└── docs/                   # Documentation
```

## Scripts

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Build for production

# Type Check
pnpm type-check       # Run TypeScript type checking

# Linting
pnpm lint             # Run ESLint
```

## Admin Setup

### Erster Admin-Benutzer

Nach dem ersten Deployment:

1. Manuell einen Admin-Benutzer in Convex erstellen
2. In Convex Dashboard → `users` Table → Add Document
3. Felder setzen:
   - `email`: admin@example.com
   - `role`: "admin"
   - `name`: "Admin"

### Weitere Benutzer

Als Admin:
1. Login unter `/login`
2. Navigiere zu `/dashboard/admin/users`
3. Verwalte Benutzer und Rollen

## Lizenz

Privates Projekt für TSV Strassenpfoten e.V.

## Support

Bei Fragen oder Problemen: [support@tsvstrassenpfoten.de](mailto:support@tsvstrassenpfoten.de)

