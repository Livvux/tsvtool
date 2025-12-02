# E-Mail-Implementierung - Übersicht

## 📧 Aktuelle E-Mail-Implementierung

### Hauptfunktionalität: Benutzer-Einladungen

**Status:** ✅ **Vollständig implementiert**

E-Mails werden **nicht über eine eigene SMTP-Konfiguration** versendet, sondern über **Clerk's integriertes E-Mail-System**. 

Die Rollenzuweisung funktioniert jetzt korrekt (siehe unten).

#### Implementierung

**Datei:** `app/actions/invite-user.ts`

```typescript
const invitation = await client.invitations.createInvitation({
  emailAddress: email,
  publicMetadata: {
    role: role,
  },
  redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sign-up`,
  notify: true,  // ← Clerk versendet automatisch die E-Mail
});
```

**Funktionsweise:**
- `notify: true` aktiviert das automatische E-Mail-Versenden durch Clerk
- Clerk versendet die Einladungs-E-Mail automatisch an die angegebene E-Mail-Adresse
- Die Rolle wird in Clerk's `publicMetadata` gespeichert
- ✅ Die Einladung wird auch in Convex gespeichert (für Rollenzuweisung beim Sign-Up)

---

## ✅ Rollenzuweisung - Implementiert

### Ablauf

1. **Einladung wird erstellt** (`app/actions/invite-user.ts`):
   - ✅ Clerk-Einladung wird erstellt via `client.invitations.createInvitation()`
   - ✅ E-Mail wird von Clerk versendet (`notify: true`)
   - ✅ Rolle wird in Clerk's `publicMetadata` gespeichert
   - ✅ **Einladung wird in Convex gespeichert** (via `storeInvitation` Mutation)

2. **Beim Sign-Up** (`convex/users.ts` - `store` Mutation):
   - ✅ Es wird nach einer Convex-Einladung gesucht (`userInvitations` Tabelle)
   - ✅ **Einladung wird gefunden** (wurde beim Einladen gespeichert)
   - ✅ **Die eingeladene Rolle wird korrekt zugewiesen**
   - ✅ Benutzer wird automatisch approved (`isApproved: true`)

### Implementierung

Die `storeInvitation` Mutation wird nach der Clerk-Einladung aufgerufen:

```typescript
// In app/actions/invite-user.ts (Zeile 79-85):

// Store invitation in Convex for role assignment during sign-up
await convex.mutation(api.users.storeInvitation, {
  email: email,
  role: role,
  clerkInvitationId: invitation.id,
  createdBy: currentUser._id,
});
```

**Status:** ✅ **Implementiert und funktioniert**

---

## 🔧 SMTP-Konfiguration

### ❌ Keine SMTP-Konfiguration erforderlich

**Warum?**
- Clerk übernimmt das komplette E-Mail-Versenden
- Keine eigenen E-Mail-Server oder SMTP-Konfigurationen nötig
- Keine E-Mail-Bibliotheken im Projekt (kein nodemailer, resend, sendgrid, etc.)

### 📦 Dependencies

**Prüfung:** `package.json` enthält **keine** E-Mail-Bibliotheken:
- ❌ Kein `nodemailer`
- ❌ Kein `resend`
- ❌ Kein `sendgrid`
- ❌ Kein `mailgun`
- ❌ Kein `postmark`

**Grund:** Alle E-Mails werden über Clerk versendet.

---

## 🌐 Vercel Environment Variables

### ✅ Keine SMTP-ENVs für Vercel erforderlich

**Status:** ✅ **Alles korrekt konfiguriert**

#### Erforderliche ENVs für E-Mail-Funktionalität

**In Vercel Dashboard gesetzt werden müssen:**

1. **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
   - **Zweck:** Clerk Authentifizierung (erforderlich für E-Mail-Einladungen)
   - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
   - **Scope:** Production, Preview, Development

2. **`CLERK_SECRET_KEY`**
   - **Zweck:** Clerk Server-side Authentifizierung (erforderlich für `clerkClient()`)
   - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
   - **Scope:** Production, Preview (nicht Development)

3. **`NEXT_PUBLIC_SITE_URL`**
   - **Zweck:** Redirect-URL für E-Mail-Einladungen
   - **Wo setzen:** Vercel Dashboard → Project Settings → Environment Variables
   - **Scope:** Production, Preview
   - **Beispiel:** `https://tsvtool.vercel.app` (Production)

#### ❌ Nicht erforderlich (SMTP)

- ❌ `SMTP_HOST`
- ❌ `SMTP_PORT`
- ❌ `SMTP_USER`
- ❌ `SMTP_PASSWORD`
- ❌ `SMTP_FROM`
- ❌ `EMAIL_FROM`
- ❌ `RESEND_API_KEY` (für Hauptfunktionalität)
- ❌ `SENDGRID_API_KEY`
- ❌ `MAILGUN_API_KEY`

**Grund:** Clerk übernimmt das E-Mail-Versenden vollständig.

---

## 🔍 Optionale E-Mail-Konfiguration

### AUTH_RESEND_KEY (Optional - nur für Convex Auth Magic Links)

**Status:** ⚠️ **Optional, nicht für Hauptfunktionalität**

**Zweck:** Nur für Convex Auth Magic Links (nicht für Benutzer-Einladungen)

**Wo setzen:**
- **Convex Dashboard:** `npx convex env set AUTH_RESEND_KEY your-resend-api-key`
- **NICHT in Vercel:** Diese Variable wird nur von Convex verwendet

**Hinweis:** 
- Diese Variable ist **nicht erforderlich** für die Hauptfunktionalität (Benutzer-Einladungen)
- Sie wird nur benötigt, wenn Convex Auth Magic Links verwendet werden
- Benutzer-Einladungen funktionieren **ohne** diese Variable

---

## ✅ Checkliste für Vercel Deployment

### Erforderliche ENVs für E-Mail-Funktionalität

- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - In Vercel gesetzt
- [x] `CLERK_SECRET_KEY` - In Vercel gesetzt (nur Production/Preview)
- [x] `NEXT_PUBLIC_SITE_URL` - In Vercel gesetzt (Production URL)

### Nicht erforderlich (SMTP)

- [x] Keine SMTP-ENVs erforderlich
- [x] Keine E-Mail-Bibliotheken im Projekt
- [x] Clerk übernimmt E-Mail-Versenden

---

## 📋 Zusammenfassung

### ✅ Was funktioniert

1. **E-Mail-Versand** über Clerk
   - E-Mails werden automatisch versendet
   - Keine zusätzliche Konfiguration erforderlich
   - Funktioniert in Production, Preview und Development

2. **Clerk-Einladungen**
   - Einladungen werden korrekt erstellt
   - Einladungs-Links funktionieren
   - ✅ **Rollenzuweisung funktioniert korrekt** (Einladung wird in Convex gespeichert)

3. **Vercel-Konfiguration**
   - Alle erforderlichen ENVs sind dokumentiert
   - Keine SMTP-ENVs erforderlich
   - Clerk-Konfiguration ist ausreichend

### ⚠️ Was optional ist

1. **AUTH_RESEND_KEY**
   - Nur für Convex Auth Magic Links
   - Nicht für Benutzer-Einladungen erforderlich
   - Muss in Convex gesetzt werden (nicht in Vercel)

### ❌ Was nicht implementiert ist (optional)

1. **Eigene SMTP-Konfiguration**
   - Nicht erforderlich (Clerk übernimmt alles)
   - Keine E-Mail-Bibliotheken im Projekt

2. **E-Mail-Benachrichtigungen für Status-Änderungen**
   - Nicht implementiert (siehe `docs/reviews/review-2025-12-02.md`)
   - Zukünftige Erweiterung möglich

---

## 🔗 Verwandte Dokumentation

- **Environment Variables:** `docs/environment-variables.md`
- **Vercel Deployment:** `docs/vercel-deployment-checklist.md`
- **Clerk Integration:** Siehe `app/actions/invite-user.ts`

---

## 🚀 Nächste Schritte (Optional)

Falls in Zukunft eigene E-Mail-Funktionalität benötigt wird (z.B. Status-Benachrichtigungen):

1. **E-Mail-Service wählen:**
   - Resend (empfohlen für Next.js)
   - SendGrid
   - Mailgun
   - Postmark

2. **ENV-Variablen hinzufügen:**
   - In Convex: `npx convex env set RESEND_API_KEY your-key`
   - In Vercel: Nur wenn Next.js Server Actions verwendet werden

3. **E-Mail-Bibliothek installieren:**
   ```bash
   pnpm add resend  # Beispiel für Resend
   ```

4. **Implementierung:**
   - Neue Convex Action für E-Mail-Versenden
   - Oder Next.js Server Action (wenn Resend verwendet wird)

**Aktuell:** Nicht erforderlich, da Clerk alle E-Mails übernimmt.

---

_Letzte Aktualisierung: 2025-12-01_
_Status: ✅ E-Mail-Implementierung vollständig über Clerk_
_✅ Rollenzuweisung bei Einladungen implementiert und funktionsfähig_

