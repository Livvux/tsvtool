# Environment Variables - Wo werden ENVs gesetzt?

## Übersicht

TSVTool verwendet zwei verschiedene Arten von Environment Variables:

1. **Next.js ENVs** - Für Frontend/Client und Next.js Server
2. **Convex ENVs** - Für Convex Backend Actions

## ⚠️ Wichtige Regel

**Convex Actions haben KEINEN Zugriff auf Next.js ENVs (`.env.local` oder Vercel ENVs).**

Wenn eine Convex Action `process.env.VARIABLE_NAME` verwendet, muss diese Variable **zwingend in Convex** gesetzt werden, nicht in Next.js oder Vercel.

---

## 🎯 Empfohlene Strategie: Hybrid-Ansatz

**Beste Lösung für Production:**

- ✅ **Next.js ENVs** (`NEXT_PUBLIC_*`) → **Vercel Dashboard**
- ✅ **Convex ENVs** (API Keys, Secrets) → **Convex Dashboard**

**Warum?**

- Next.js ENVs sind für Frontend/Client und werden von Vercel automatisch bereitgestellt
- Convex ENVs sind für Backend Actions und müssen in Convex sein (Vercel hat keinen Zugriff)
- Klare Trennung: Frontend = Vercel, Backend = Convex

---

## 🔄 Alternative: Alles in Convex (möglich, aber nicht ideal)

**Können wir alles in Vercel setzen?**

❌ **Nein!** Convex Actions können **NICHT** auf Vercel ENVs zugreifen.

**Können wir alles in Convex setzen?**

✅ **Ja, technisch möglich**, aber:

- `NEXT_PUBLIC_*` Variablen müssen trotzdem im Frontend verfügbar sein
- Next.js kann nicht direkt auf Convex ENVs zugreifen
- Du müsstest ein Sync-Script verwenden (siehe `scripts/sync-env-to-convex.ts`)

**Empfehlung:** Bleibe beim Hybrid-Ansatz (Next.js in Vercel, Convex in Convex)

---

## 1. Next.js Environment Variables

### Wo setzen?

- **Lokal**: `.env.local` (nicht in Git committed)
- **Production (Vercel)**: Vercel Dashboard → Project Settings → Environment Variables

### Welche ENVs gehören hierher?

Alle ENVs, die:

- Mit `NEXT_PUBLIC_` beginnen (für Frontend/Client)
- Vom Next.js Server verwendet werden (z.B. in API Routes, Server Actions)

### Aktuelle Next.js ENVs:

```env
# Convex URL (für Next.js Client)
NEXT_PUBLIC_CONVEX_URL=https://adjoining-ptarmigan-162.convex.cloud

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # lokal
# NEXT_PUBLIC_SITE_URL=https://tsvstrassenpfoten.de  # production

# Clerk (für Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# R2 Public URL (für Frontend)
NEXT_PUBLIC_R2_URL=https://pub-240064592c8d49b8abcde6f81a12bfc9.r2.dev
```

---

## 2. Convex Environment Variables

### Wo setzen?

**NUR in Convex Dashboard** (nicht in `.env.local` oder Vercel):

```bash
# Lokal (für Development)
npx convex env set VARIABLE_NAME value

# Oder im Convex Dashboard:
# https://dashboard.convex.dev/d/[deployment]/settings/environment-variables
```

### Welche ENVs gehören hierher?

Alle ENVs, die:

- Von Convex Actions verwendet werden (`convex/*.ts` Dateien mit `"use node"`)
- Sensitive API Keys enthalten (nie im Frontend!)
- Von Convex Functions benötigt werden

### Aktuelle Convex ENVs:

```bash
# Translation Service (wähle "google" oder "microsoft")
npx convex env set TRANSLATION_SERVICE google

# Google Translate API (wenn TRANSLATION_SERVICE=google)
npx convex env set GOOGLE_TRANSLATE_API_KEY your-api-key

# Microsoft Azure Translator (wenn TRANSLATION_SERVICE=microsoft)
npx convex env set AZURE_TRANSLATOR_KEY your-azure-key
npx convex env set AZURE_TRANSLATOR_REGION westeurope  # z.B. westeurope, germanywestcentral

# WordPress
npx convex env set WORDPRESS_URL https://tsvstrassenpfoten.de
npx convex env set WORDPRESS_APP_USERNAME Lucas
npx convex env set WORDPRESS_APP_PASSWORD "your-app-password"

# Facebook
npx convex env set FACEBOOK_PAGE_ID your-page-id
npx convex env set FACEBOOK_ACCESS_TOKEN your-access-token

# Instagram
npx convex env set INSTAGRAM_BUSINESS_ACCOUNT_ID your-account-id
npx convex env set INSTAGRAM_ACCESS_TOKEN your-access-token

# X (Twitter)
npx convex env set TWITTER_API_KEY your-api-key
npx convex env set TWITTER_API_SECRET your-api-secret
npx convex env set TWITTER_ACCESS_TOKEN your-access-token
npx convex env set TWITTER_ACCESS_TOKEN_SECRET your-access-token-secret

# matchpfote
npx convex env set MATCHPFOTE_API_KEY your-api-key
npx convex env set MATCHPFOTE_API_URL https://matchpfote.de/api/v1

# Cloudflare R2 (für Convex Actions)
npx convex env set R2_ACCOUNT_ID your-account-id
npx convex env set R2_ACCESS_KEY_ID your-access-key-id
npx convex env set R2_SECRET_ACCESS_KEY your-secret-access-key
npx convex env set R2_BUCKET_NAME tsvtool
npx convex env set R2_PUBLIC_URL https://pub-240064592c8d49b8abcde6f81a12bfc9.r2.dev

# Convex Auth (für Clerk JWT Validation)
npx convex env set CLERK_ISSUER_URL https://live-roughy-46.clerk.accounts.dev
npx convex env set SITE_URL http://localhost:3000  # lokal
# npx convex env set SITE_URL https://tsvstrassenpfoten.de  # production
```

---

## 3. Deployment auf Vercel

### Next.js ENVs in Vercel setzen:

1. Gehe zu Vercel Dashboard → Project Settings → Environment Variables
2. Füge alle `NEXT_PUBLIC_*` Variablen hinzu
3. Setze für Production und Preview Environments

### Convex ENVs bleiben in Convex:

- **Wichtig**: Convex ENVs müssen NICHT in Vercel gesetzt werden
- Sie bleiben in Convex Dashboard
- Für Production: Setze `SITE_URL` in Convex auf die Production URL

---

## 4. Checkliste für neue ENVs

Wenn du eine neue ENV hinzufügst:

- [ ] **Wird sie im Frontend/Client verwendet?** → Next.js ENV mit `NEXT_PUBLIC_` Prefix
- [ ] **Wird sie in einer Convex Action verwendet?** → Convex ENV (ohne Prefix)
- [ ] **Ist sie ein API Key oder Secret?** → Immer Convex ENV (nie im Frontend!)
- [ ] **Wird sie in `convex/*.ts` Dateien verwendet?** → Convex ENV

---

## 5. Aktuelle Probleme & Lösungen

### Problem: "Convex URL nicht konfiguriert"

**Lösung**: Convex URL wird automatisch erkannt, wenn die Action läuft. Die Prüfung zeigt jetzt "Verbunden (Action läuft erfolgreich)".

### Problem: "Cloudflare R2 nicht konfiguriert"

**Lösung**: R2 ENVs müssen in Convex gesetzt werden:

```bash
npx convex env set R2_ACCOUNT_ID 40f4d4e010f358d7aea47e7b10d02a47
npx convex env set R2_ACCESS_KEY_ID 13949331e2375403f37f27f2ca0ab2ff
npx convex env set R2_SECRET_ACCESS_KEY f948b55bfbb6a6b3c8f8288cf2d76fa39e20b49584c2c9540fe63e0c9c31461f
npx convex env set R2_BUCKET_NAME tsvtool
npx convex env set R2_PUBLIC_URL https://pub-240064592c8d49b8abcde6f81a12bfc9.r2.dev
```

### Problem: "WordPress wird erkannt, aber andere APIs nicht"

**Lösung**: WordPress ENVs sind bereits in Convex gesetzt. Andere APIs müssen ebenfalls in Convex gesetzt werden (siehe Liste oben).

---

## 6. Translation Service Konfiguration

TSVTool unterstützt zwei Übersetzungsdienste:

### Google Translate (Standard)

- **Kosten**: ~$20 pro 1 Million Zeichen
- **Einrichtung**: Einfach, nur API Key erforderlich

```bash
npx convex env set TRANSLATION_SERVICE google
npx convex env set GOOGLE_TRANSLATE_API_KEY your-api-key
```

### Microsoft Azure Translator (Kostenersparnis)

- **Kosten**: ~$10 pro 1 Million Zeichen (50% günstiger!)
- **Free Tier**: 2 Millionen Zeichen/Monat kostenlos
- **Einrichtung**: Azure Portal → Cognitive Services → Translator erstellen

```bash
npx convex env set TRANSLATION_SERVICE microsoft
npx convex env set AZURE_TRANSLATOR_KEY your-azure-key
npx convex env set AZURE_TRANSLATOR_REGION westeurope
```

**Verfügbare Azure Regionen:**

- `westeurope` (Amsterdam)
- `germanywestcentral` (Frankfurt)
- `northeurope` (Dublin)
- Weitere: https://learn.microsoft.com/azure/ai-services/translator/reference/v3-0-reference#base-urls

### Wechsel zwischen Services

Um den Service zu wechseln, ändere einfach `TRANSLATION_SERVICE`:

```bash
# Zu Microsoft wechseln
npx convex env set TRANSLATION_SERVICE microsoft

# Zu Google wechseln
npx convex env set TRANSLATION_SERVICE google
```

---

## 8. Best Practices

1. **Nie API Keys im Frontend**: Alle API Keys gehören in Convex ENVs
2. **NEXT*PUBLIC* nur für öffentliche Daten**: Nur Daten, die im Browser sichtbar sein dürfen
3. **Convex ENVs für Backend**: Alle Backend-Logik verwendet Convex ENVs
4. **Dokumentation**: Aktualisiere diese Datei, wenn neue ENVs hinzugefügt werden

---

## 9. Prüfen der ENV-Konfiguration

Die Settings-Seite unter `/dashboard/admin/settings` zeigt den Status aller API-Konfigurationen:

- ✅ **Verbunden**: ENV ist gesetzt und API funktioniert
- ⚠️ **Nicht konfiguriert**: ENV fehlt oder ist nicht vollständig
- ✗ **Fehler**: ENV ist gesetzt, aber API-Verbindung schlägt fehl

---

_Letzte Aktualisierung: 2025-12-01_
