# Tierverwaltungs-Tool

**Stack:** Next.js 16 + Convex + Clerk Authentication

**Letzte Aktualisierung:** 2025-12-01

## 1\. Komponenten & Akteure

### A. Input - Labels & Login bulgarisch möglich (Bulgarisches Team)

  * **Aktion:** Führt "Login, Eingaben, absenden" durch.
  * **Sprache:** Die Eingaben erfolgen auf Bulgarisch.
  * **Output:** Erzeugt ein **"Tierprofil ENTWURF"**.

### B. Tierprofil ENTWURF (Daten-Status)

  * Dies ist ein temporärer Datenstatus.
  * **Status:** `ENTWURF`
  * **Datenstruktur:** Siehe Abschnitt 3 (Felder).

### C. Manager (Deutsches Team)

  * **Aktion:** Führt "Login" durch.
  * **Rolle:** Empfängt akzeptierte Entwürfe.
  * **Aufgabe:** "Daten ändern, anpassen" (z.B. Übersetzen, Korrigieren, Anreichern).
  * **Interaktion:** Interagiert mit der "Zentralen Plattform", um Daten zu finalisieren.

### D. Zentrale Plattform für Tierverwaltung

  * Dies ist das Kernsystem (Backend, z.B. Convex).
  * **Funktionen:**
      * Datenbank
      * Geschützter Login
      * Tier-Verwaltung
  * **Schnittstellen (APIs):**
      * Schnittstelle zur Website (`tsvstreunerpfoten.de` WordPress Basis)
      * Schnittstelle zu anderen Tierplattformen (z.B. `shelta?` über Browserautomatisierung wie Playwright)
      * Schnittstelle zu sozialen Medien (Facebook, Instagram, X).

### E. Externe Ausgaben (Distribution)

  * Website (TSVStrassenpfoten.de - WordPress CMS) ✅ Implementiert
  * Facebook Page ✅ Implementiert
  * Instagram Page ⚠️ Placeholder (benötigt Graph API /media + /media_publish)
  * X ⚠️ Placeholder (benötigt OAuth 1.0a)
  * matchpfote ✅ Implementiert (mit Rate Limiting & Retry)

-----

## 2.1 Route-Struktur (aktuell)

```
app/
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx  # Clerk Sign-In
│   └── sign-up/[[...sign-up]]/page.tsx  # Clerk Sign-Up
├── api/convex/[...path]/route.ts         # Convex API Proxy
├── dashboard/
│   ├── layout.tsx                        # Dashboard Layout mit Navigation
│   ├── page.tsx                          # Dashboard Home (Role-based Redirect)
│   ├── admin/
│   │   ├── settings/page.tsx             # Admin Settings
│   │   └── users/page.tsx                # User Management
│   ├── animals/page.tsx                  # Finalisierte Tiere
│   ├── input/page.tsx                    # Tier-Erstellung (Bulgarisch)
│   └── manager/
│       ├── [id]/page.tsx                 # Tier bearbeiten
│       └── drafts/page.tsx               # Akzeptierte Entwürfe
├── error.tsx                             # Error Boundary
├── layout.tsx                            # Root Layout
├── not-found.tsx                         # 404 Page
└── page.tsx                              # Landing Page
```

-----

## 2\. Workflow / Datenfluss

Der Prozess beschreibt den Weg eines Tierprofils von der Erstellung bis zur Veröffentlichung.

1.  **Erstellung (Input -\> Entwurf):**

      * Der Akteur "Input (Bulgarisches Team)" loggt sich ein und sendet die Daten für ein neues Tierprofil auf Bulgarisch ab.
      * Das System erstellt ein **"Tierprofil ENTWURF"** mit `STATUS = ENTWURF`.

2.  **Review-Prozess (Entwurf -\> Manager):**

      * Das "Tierprofil ENTWURF" durchläuft eine Prüfung.
      * **Pfad A (Ablehnung):** Das Profil wird abgelehnt ("Ablehnung") oder per "Email=\>Delete" gelöscht. (Rote Pfeile)
      * **Pfad B (Annahme):** Das Profil wird akzeptiert ("accept"). Die Daten werden an den "Manager (Deutsche Mädels)" geliefert.

3.  **Management & Finalisierung (Manager -\> Plattform):**

      * Der "Manager" (Deutsches Team) loggt sich ein.
      * Er/Sie bearbeitet das akzeptierte Profil (ändert/passt Daten an) und speist es in die **"Zentrale Plattform für Tierverwaltung"** ein.
      * Die Daten werden in der Plattform als **"Verwaltet Tiere"** (finalisierter Status) gespeichert.

4.  **Distribution (Plattform -\> Externe Kanäle):**

      * Die "Zentrale Plattform" verteilt die finalisierten Tierdaten automatisch über ihre Schnittstellen an die verbundenen Kanäle:
          * Website TSVStrassenpfoten.de - Wordpress - Application Password vorhanden. ✅
          * Facebook Page - Graph API v18.0 ✅
          * Instagram Page - Graph API /media + /media_publish ⚠️ TODO
          * X - OAuth 1.0a ⚠️ TODO
          * matchpfote - REST API mit Rate Limiting ✅

-----

## 2.2 Environment Variables

Benötigte Environment Variables (siehe `.env.example`):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_ISSUER_URL=

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Google Translate
GOOGLE_TRANSLATE_API_KEY=

# WordPress (Avada Portfolio)
WORDPRESS_URL=https://tsvstrassenpfoten.de
WORDPRESS_APP_USERNAME=
WORDPRESS_APP_PASSWORD=

# Facebook (Graph API v18.0)
FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=

# Instagram (Graph API - für Bild-Upload)
INSTAGRAM_BUSINESS_ACCOUNT_ID=
INSTAGRAM_ACCESS_TOKEN=

# X/Twitter (OAuth 1.0a)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

# matchpfote
MATCHPFOTE_API_KEY=
MATCHPFOTE_API_URL=https://matchpfote.de/api/v1
```

-----

## 3\. Datenstruktur (Felder)

Definiertes Schema für das Tierprofil:


// Entry-ID 
* @name{string}
* @animal{string} (z.B. weiblich/männlich)
* @breed{string} (z.B. Hund, Katze)
* @rasse{string}
* @geburtsdatum{string} (z.B. TT.MM.JJJJ)
* @shoulder{string} (in cm)
* @color{string} (Farbe, z.B. ??, ??, ??)
* @webLink{string} (möglichst AutoImport Web ? -> Bild ? )
* @descShort{string} (ca 2 Sätze)
* @videoLink{string} (z.B. im Shelter von Razgrad)
* @eigenschaften{string} (z.B. Zuhause (drin))
* @kastriert{string} (JA/NEIN)
* @geimpft{string} (JA/NEIN)
* @gechipt{string} (vollständig/teilweise/nein)
* @blood{string}
* @verträglich{string} (z.B. Rüde, Katze, getrennt, sozial)
* @verträglichText{string}
* @health{string} (JA/NEIN)
* @healthText{string} (JA/NEIN -> kann getestet werden)
* @status{string} (z.B. in BG)
* @gallery{string} (Bilder/Videos -> Link oder DataUpload)
* @profile{string} (sämtliche Daten auf de gepflegt)