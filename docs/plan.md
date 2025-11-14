# Tierverwaltungs-Tool

**Stack:** Next.js 16 + Convex

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

  * Website (TSVStrassenpfoten.de - WordPress CMS)
  * Facebook Page
  * Instagram Page
  * X

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
          * Website TSVStrassenpfoten.de - Wordpress - Application Password vorhanden.
          * Facebook Page
          * Instagram Page
          * X

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