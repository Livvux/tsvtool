# matchpfote API v1 - Integrationsleitfaden

Dieser Leitfaden hilft dir dabei, die matchpfote API v1 in dein Tierverwaltungstool zu integrieren.

## Voraussetzungen

- **PLUS-Abonnement**: API-Zugriff ist nur für Organisationen mit PLUS-Abonnement verfügbar
- **Organisationskonto**: Du musst Teil einer verifizierten Organisation sein
- **Berechtigung**: Nur Organisation-Besitzer können API Keys erstellen

## Setup

### 1. API Key erstellen

1. Logge dich in dein matchpfote-Konto ein
2. Navigiere zu `/dashboard/api-keys`
3. Klicke auf "Neuen API-Schlüssel erstellen"
4. Gib einen beschreibenden Namen ein (z.B. "Produktions-Server", "Entwicklungs-Umgebung")
5. Optional: Setze ein Ablaufdatum für zusätzliche Sicherheit
6. **WICHTIG**: Kopiere den API Key sofort, da er nur einmal angezeigt wird!

### 2. API Key sicher speichern

**Niemals** API Keys in Version Control committen. Verwende stattdessen:

- **Environment Variables**: `.env` Dateien (nicht committen!)
- **Secret Management**: AWS Secrets Manager, HashiCorp Vault, etc.
- **Config Files**: Lokale Config-Dateien außerhalb des Repositories

**Beispiel `.env`:**
```bash
MATCHPFOTE_API_KEY=mp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MATCHPFOTE_API_URL=https://matchpfote.de/api/v1
```

## Integration

### Basis-Client-Implementierung

#### JavaScript/TypeScript

```typescript
class MatchpfoteApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://matchpfote.de/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Tierprofile abrufen
  async getAnimals(params?: {
    species?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.species) query.append('species', params.species);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return this.request(`/animals?${query.toString()}`);
  }

  // Tierprofil erstellen
  async createAnimal(animalData: any) {
    return this.request('/animals', {
      method: 'POST',
      body: JSON.stringify(animalData),
    });
  }

  // Tierprofil aktualisieren
  async updateAnimal(id: string, animalData: any) {
    return this.request(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animalData),
    });
  }

  // Tierprofil löschen
  async deleteAnimal(id: string) {
    return this.request(`/animals/${id}`, {
      method: 'DELETE',
    });
  }
}

// Verwendung
const client = new MatchpfoteApiClient(process.env.MATCHPFOTE_API_KEY!);
const animals = await client.getAnimals({ page: 1, limit: 10 });
```

#### Python

```python
import os
import requests
from typing import Optional, Dict, Any

class MatchpfoteApiClient:
    def __init__(self, api_key: str, base_url: str = 'https://matchpfote.de/api/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        }

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f'{self.base_url}{endpoint}'
        response = requests.request(method, url, headers=self.headers, **kwargs)
        response.raise_for_status()
        return response.json()

    def get_animals(self, species: Optional[str] = None, 
                    status: Optional[str] = None,
                    page: int = 1, limit: int = 10):
        params = {'page': page, 'limit': limit}
        if species:
            params['species'] = species
        if status:
            params['status'] = status
        return self._request('GET', '/animals', params=params)

    def create_animal(self, animal_data: Dict[str, Any]):
        return self._request('POST', '/animals', json=animal_data)

    def update_animal(self, animal_id: str, animal_data: Dict[str, Any]):
        return self._request('PUT', f'/animals/{animal_id}', json=animal_data)

    def delete_animal(self, animal_id: str):
        return self._request('DELETE', f'/animals/{animal_id}')

# Verwendung
client = MatchpfoteApiClient(os.getenv('MATCHPFOTE_API_KEY'))
animals = client.get_animals(page=1, limit=10)
```

## Rate Limiting

Die API hat ein Rate Limit von 100 Requests pro Minute. Implementiere Retry-Logik:

```typescript
async function requestWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        // Rate limit exceeded, wait before retry
        const retryAfter = error.headers?.['retry-after'] || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Synchronisation

### Einmalige Synchronisation

Für die erste Synchronisation aller Tierprofile:

```typescript
async function syncAllAnimals(client: MatchpfoteApiClient) {
  let page = 1;
  let hasMore = true;
  const allAnimals = [];

  while (hasMore) {
    const response = await client.getAnimals({ page, limit: 100 });
    allAnimals.push(...response.data);
    
    hasMore = page < response.meta.pages;
    page++;
  }

  return allAnimals;
}
```

### Inkrementelle Synchronisation

Für regelmäßige Updates:

```typescript
async function syncUpdates(client: MatchpfoteApiClient, lastSync: Date) {
  // Hole alle Tiere, die seit letztem Sync aktualisiert wurden
  const response = await client.getAnimals();
  
  return response.data.filter(
    animal => new Date(animal.updatedAt) > lastSync
  );
}
```

## Fehlerbehandlung

### Typische Fehler

1. **401 Unauthorized**: API Key ungültig oder abgelaufen
   - Lösung: Neuen API Key erstellen

2. **403 Forbidden**: Kein PLUS-Abonnement
   - Lösung: Abonnement upgraden

3. **429 Too Many Requests**: Rate Limit überschritten
   - Lösung: Retry mit exponential backoff

4. **400 Bad Request**: Ungültige Daten
   - Lösung: Request-Body validieren

### Error Handling Beispiel

```typescript
try {
  const animal = await client.createAnimal(animalData);
} catch (error: any) {
  if (error.status === 401) {
    console.error('API Key ungültig. Bitte neuen Key erstellen.');
  } else if (error.status === 403) {
    console.error('Kein PLUS-Abonnement. Bitte upgraden.');
  } else if (error.status === 429) {
    console.error('Rate Limit überschritten. Bitte später versuchen.');
  } else {
    console.error('Unerwarteter Fehler:', error.message);
  }
}
```

## Best Practices

1. **Caching**: Cache Tierprofile lokal, um API-Calls zu reduzieren
2. **Batch Operations**: Nutze Pagination für große Datenmengen
3. **Idempotenz**: Implementiere idempotente Updates (nur geänderte Felder)
4. **Logging**: Logge alle API-Calls für Debugging
5. **Monitoring**: Überwache Rate Limits und Fehlerraten

## Troubleshooting

### API Key wird nicht akzeptiert

- Prüfe, ob der Key korrekt kopiert wurde (keine Leerzeichen)
- Stelle sicher, dass der Key mit `mp_` beginnt
- Prüfe, ob der Key noch aktiv ist (`isActive: true`)
- Prüfe, ob der Key abgelaufen ist (`expiresAt`)

### Rate Limit Probleme

- Reduziere Request-Frequenz
- Implementiere Caching
- Nutze Batch-Operations wo möglich

### Daten werden nicht aktualisiert

- Prüfe, ob die Organisation PLUS-Abonnement hat
- Prüfe, ob der API Key der richtigen Organisation gehört
- Validiere Request-Body Format

## Support

Bei Fragen oder Problemen:
- E-Mail: support@matchpfote.de
- Dokumentation: `/docs/api/v1/README.md`

