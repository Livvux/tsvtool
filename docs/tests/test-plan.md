# TSVTool Test Plan

**Erstellt:** 2025-12-01
**Ziel:** >60% Test Coverage als Zwischenstufe

## 1. Übersicht

### Test-Framework
- **Vitest 2.1.8** - Test Runner
- **@testing-library/react** - Component Testing
- **jsdom** - DOM Environment
- **v8** - Coverage Provider

### Befehle
```bash
pnpm test              # Tests ausführen
pnpm test:ui           # Tests mit UI
pnpm test:coverage     # Tests mit Coverage Report
```

## 2. Test-Kategorien

### 2.1 Unit Tests

#### Lib-Funktionen (`__tests__/lib/`)

| Datei | Status | Beschreibung |
|-------|--------|--------------|
| `validation.test.ts` | ✅ | Validierungsfunktionen (Date, Required) |
| `logger.test.ts` | ✅ | Logger-Utility |
| `animal-helpers.test.ts` | ✅ NEU | Status-Farben, Badges, DateTime-Formatierung |

#### Convex-Funktionen (`__tests__/convex/`)

| Datei | Status | Beschreibung |
|-------|--------|--------------|
| `distribution.test.ts` | ✅ NEU | Distribution-Logik (Mock-Tests) |

### 2.2 Component Tests (`__tests__/components/`)

| Datei | Status | Beschreibung |
|-------|--------|--------------|
| `AnimalCard.test.tsx` | ✅ | Animal Card Rendering |
| `DistributionStatus.test.tsx` | ✅ | Distribution Status Anzeige |

### 2.3 Integration Tests (`__tests__/integration/`)

| Datei | Status | Beschreibung |
|-------|--------|--------------|
| `manager-flow.test.ts` | ✅ NEU | Kompletter Manager-Workflow |

## 3. Test-Szenarien

### 3.1 Validation Tests

- [x] Required-Field-Validierung
- [x] Datums-Format-Validierung (TT.MM.JJJJ)
- [ ] Shoulder Height Validierung (1-200 cm)
- [ ] Seeking Home Since Jahr (2000-current)
- [ ] Gallery Minimum (1 Bild)
- [ ] descShort Minimum (20 Zeichen)

### 3.2 Distribution Tests

- [x] WordPress Endpoint-Konfiguration
- [x] Facebook Graph API v18.0
- [x] Instagram Media/MediaPublish Endpoints
- [x] X/Twitter API v2 Endpoint
- [x] Text-Formatierung pro Plattform
- [x] Retry-Logik (3 Versuche, exponential backoff)

### 3.3 Manager Flow Tests

- [x] Animal-Erstellung mit ENTWURF Status
- [x] Pflichtfeld-Validierung
- [x] Status-Transitionen (ENTWURF → AKZEPTIERT → FINALISIERT)
- [x] Übersetzungs-Workflow
- [x] Finalisierungs-Berechtigung (nur Manager/Admin)
- [x] Distribution nach Finalisierung
- [x] RBAC (Role-Based Access Control)

### 3.4 UI Component Tests

- [x] AnimalCard Rendering
- [x] DistributionStatus Anzeige
- [ ] Input Form Validierung
- [ ] Manager Edit Form
- [ ] Navigation basierend auf Rolle

## 4. Noch zu implementierende Tests

### Priorität 1 (Kritisch)

1. **Backend Validation Tests**
   - Vollständige Validierung in `convex/validation.ts`
   - Edge Cases (leere Felder, ungültige Formate)

2. **API Integration Tests**
   - WordPress API Response Handling
   - Facebook API Error Handling
   - Instagram Container Status Check
   - X OAuth Signature Validierung

### Priorität 2 (Wichtig)

1. **Form Component Tests**
   - Input Page Form Submission
   - Manager Edit Page Updates
   - Error State Handling

2. **Authentication Tests**
   - Clerk Integration
   - Role-Based Navigation
   - Protected Routes

### Priorität 3 (Nice-to-Have)

1. **E2E Tests**
   - Kompletter User Journey
   - Cross-Browser Testing

2. **Performance Tests**
   - Large Dataset Handling
   - Image Upload Performance

## 5. Coverage-Ziele

| Bereich | Aktuell | Ziel (Phase 1) | Ziel (Final) |
|---------|---------|----------------|--------------|
| Statements | ~5% | 60% | 80% |
| Branches | ~5% | 50% | 70% |
| Functions | ~5% | 60% | 80% |
| Lines | ~5% | 60% | 80% |

## 6. Test-Ausschlüsse

Die folgenden Bereiche sind von der Coverage ausgeschlossen:
- `node_modules/`
- `convex/_generated/`
- `**/*.config.*`
- `**/types/**`
- `**/*.d.ts`

## 7. Nächste Schritte

1. ✅ Unit Tests für `lib/animal-helpers.ts`
2. ✅ Mock Tests für `convex/distribution.ts`
3. ✅ Integration Test für Manager-Flow
4. [ ] UI Form Component Tests
5. [ ] Backend Validation Tests (convex/validation.ts)
6. [ ] Coverage auf 60% erhöhen
7. [ ] CI/CD Integration für automatische Tests

---

*Letztes Update: 2025-12-01*

