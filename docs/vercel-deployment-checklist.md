# Vercel Deployment Checklist

## ✅ Build-Time Environment Variables (KRITISCH)

Diese Variablen **MÜSSEN** zur Build-Zeit verfügbar sein und im Vercel Dashboard gesetzt werden:

### Required Build-Time Variables

- [ ] `NEXT_PUBLIC_CONVEX_URL` - Convex Deployment URL
  - **Beispiel:** `https://curious-retriever-679.convex.cloud`
  - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
  - **Wichtig:** Muss für **Production**, **Preview** und **Development** gesetzt sein

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk Publishable Key
  - **Format:** `pk_live_...` oder `pk_test_...`
  - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
  - **Wichtig:** Muss für **Production**, **Preview** und **Development** gesetzt sein

- [ ] `NEXT_PUBLIC_SITE_URL` - Production Site URL
  - **Beispiel:** `https://tsvtool.xyz` (Production)
  - **Beispiel:** `http://localhost:3000` (Development)
  - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
  - **Wichtig:** Muss für **Production** und **Preview** gesetzt sein

### Optional Build-Time Variables

- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Default: `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Default: `/sign-up`
- [ ] `NEXT_PUBLIC_R2_URL` - R2 Public URL (wenn verwendet)

---

## ✅ Runtime Environment Variables

Diese Variablen werden zur Runtime benötigt (nicht zur Build-Zeit):

- [ ] `CLERK_SECRET_KEY` - Clerk Secret Key (Server-side only)
  - **Wichtig:** NICHT als Build-Time Variable setzen!
  - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
  - **Scope:** Nur Production/Preview (nicht Development)

---

## ✅ Vercel Configuration Files

### vercel.json

Die `vercel.json` ist korrekt konfiguriert:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Status:** ✅ Korrekt konfiguriert

### next.config.ts

Die Next.js Konfiguration ist optimiert:

- ✅ `output: 'standalone'` - Optimiert für Vercel
- ✅ Package import optimization
- ✅ Cache headers konfiguriert
- ✅ Security headers gesetzt

**Status:** ✅ Korrekt konfiguriert

---

## ✅ Build Configuration

### Build Command

```bash
NODE_OPTIONS='--max-old-space-size=8192' pnpm build
```

**Status:** ✅ In `vercel.json` korrekt gesetzt

### Memory Allocation

- **Build Memory:** 8192 MB (8 GB)
- **Status:** ✅ Ausreichend für aktuelles Projekt

---

## ✅ Deployment Checklist

### Vor dem Deployment

- [ ] Alle `NEXT_PUBLIC_*` Variablen im Vercel Dashboard gesetzt
- [ ] `CLERK_SECRET_KEY` im Vercel Dashboard gesetzt (nur Production/Preview)
- [ ] `NEXT_PUBLIC_SITE_URL` auf Production URL gesetzt
- [ ] Type-Check erfolgreich: `pnpm type-check`
- [ ] Build lokal erfolgreich: `pnpm build`
- [ ] Linting erfolgreich: `pnpm lint`

### Nach dem Deployment

- [ ] Build in Vercel erfolgreich
- [ ] Keine Build-Time Errors
- [ ] Application läuft ohne 500 Errors
- [ ] Authentication funktioniert (Clerk)
- [ ] Convex Connection funktioniert
- [ ] Alle Routen erreichbar

---

## ⚠️ Wichtige Hinweise

### Build-Time vs. Runtime Variables

**NEXT_PUBLIC_* Variablen:**
- ✅ Werden zur **Build-Zeit** in den JavaScript Bundle eingebaut
- ✅ Müssen im Vercel Dashboard gesetzt sein
- ✅ Werden automatisch zur Build-Zeit verfügbar gemacht

**Server-side Secrets (z.B. CLERK_SECRET_KEY):**
- ✅ Werden nur zur **Runtime** benötigt
- ✅ Müssen im Vercel Dashboard gesetzt sein
- ❌ Sollten NICHT als Build-Time Secrets konfiguriert werden

### Docker Builds (falls verwendet)

Wenn Docker Builds verwendet werden, müssen Build-Time Variablen als `--build-arg` übergeben werden:

```dockerfile
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
```

**Aktuell:** Keine Docker Builds konfiguriert ✅

---

## 🔍 Troubleshooting

### Build schlägt fehl mit "Missing environment variable"

**Problem:** `NEXT_PUBLIC_*` Variable fehlt zur Build-Zeit

**Lösung:**
1. Gehe zu Vercel Dashboard → Project Settings → Environment Variables
2. Füge die fehlende Variable hinzu
3. Stelle sicher, dass sie für **Production**, **Preview** und **Development** gesetzt ist
4. Redeploy das Projekt

### Runtime Error: "Clerk not configured"

**Problem:** `CLERK_SECRET_KEY` fehlt oder `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ist falsch

**Lösung:**
1. Prüfe Vercel Dashboard → Environment Variables
2. Stelle sicher, dass beide Keys gesetzt sind
3. Prüfe, ob die Keys korrekt sind (keine Leerzeichen, vollständig)

### Convex Connection Error

**Problem:** `NEXT_PUBLIC_CONVEX_URL` ist falsch oder fehlt

**Lösung:**
1. Prüfe Convex Dashboard für die korrekte URL
2. Stelle sicher, dass `NEXT_PUBLIC_CONVEX_URL` im Vercel Dashboard gesetzt ist
3. Prüfe, ob die URL mit `https://` beginnt

---

## 📋 Quick Reference

### Vercel Dashboard Navigation

1. **Environment Variables setzen:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Klicke "Add New"
   - Setze Name, Value und Environment (Production/Preview/Development)

2. **Build Logs prüfen:**
   - Vercel Dashboard → Project → Deployments
   - Klicke auf einen Deployment
   - Prüfe "Build Logs" Tab

3. **Runtime Logs prüfen:**
   - Vercel Dashboard → Project → Deployments
   - Klicke auf einen Deployment
   - Prüfe "Function Logs" Tab

---

## ✅ Aktueller Status

**Letzte Prüfung:** 2025-01-27

- ✅ `vercel.json` korrekt konfiguriert
- ✅ `next.config.ts` optimiert
- ✅ Build-Command korrekt
- ⚠️ **Action Required:** Prüfe, ob alle `NEXT_PUBLIC_*` Variablen im Vercel Dashboard gesetzt sind

---

**Nächste Schritte:**
1. Prüfe Vercel Dashboard auf fehlende Environment Variables
2. Setze alle `NEXT_PUBLIC_*` Variablen für Production, Preview und Development
3. Teste Deployment auf Preview Environment
4. Verifiziere, dass alle Features funktionieren

