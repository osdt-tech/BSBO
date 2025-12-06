# 📋 BSBO – Aufgabenverwaltung für ChurchTools

Eine moderne Vue 3 + TypeScript-Anwendung zur Verwaltung und Verteilung von Aufgaben im ChurchTools-Ökosystem. Administratoren können Aufgaben erstellen, kategorisieren, verteilen und verwalten; Teilnehmer können ihre zugewiesenen Aufgaben einsehen und deren Status aktualisieren.

---

## ✨ Hauptfunktionen

### 👤 Für Administratoren
- ✅ Aufgaben erstellen, bearbeiten und löschen
- 📤 Aufgaben an mehrere Gruppen gleichzeitig verteilen
- 📊 Status und Noten verwalten (automatische Notenberechnung)
- 🔍 Rohdaten und Verteilungsprotokoll anzeigen
- 💾 Alle Daten persistent im ChurchTools-KV-Store speichern

### 👥 Für Teilnehmer
- 📖 Alle zugewiesenen Aufgaben einsehen
- 🏷️ Aufgaben nach Kategorie oder Monat filtern
- 📅 Aktuelle und überfällige Aufgaben unterscheiden
- 📝 Status aktualisieren (z. B. „teilgenommen", „erfüllt")

---

## 🚀 Installation & Einrichtung

### Voraussetzungen
- ChurchTools-Instanz mit API-Zugriff
- Benutzer mit Admin-Rechten (für Einrichtung)
- Zugriffsrechte auf:
  - Custom Data Values (KV-Store) im eigenen Modul
  - Gruppen und Gruppenmitglieder
  - Personendaten (`/whoami`, `/persons/{id}/groups`)

### 1. Modul registrieren
Die App erstellt automatisch beim ersten Start:
- Ein Custom Module mit dem Namen `BSBO` (oder deinem KEY)
- Eine Datenkategorie `bsbo-aufgaben` (oder `{KEY}-aufgaben`)

Keine manuelle Einrichtung im KV-Store nötig!

### 2. Gruppen-IDs konfigurieren
In `src/composables/usePermissions.ts` passen Sie die Gruppen-IDs an Ihre Struktur an:

```typescript
const ADMINISTRATION_GROUP_ID = '569'       // Administratoren-Gruppe
const TEILNEHMER_PARENT_GROUP_ID = '566'    // Hauptgruppe der Teilnehmer
```

Diese IDs finden Sie in ChurchTools unter: **Gruppen** → Gruppen-ID (rechts im Reiter).

### 3. Environment-Variablen (optional, für Entwicklung)
Kopieren Sie `.env.example` zu `.env` und füllen Sie aus:

```env
VITE_BASE_URL=https://your-churchtools-instance.de
VITE_KEY=BSBO
VITE_USERNAME=admin@example.com
VITE_PASSWORD=your-password
```

**Für Produktion:** Diese Variablen werden automatisch aus der ChurchTools-Umgebung geladen.

---

## 📖 Benutzerhandbuch

### Aufgabe erstellen (Admin)
1. Klick auf **„Neue Aufgabe anlegen"**
2. Ausfüllen:
   - **Titel**: Beschreibung der Aufgabe
   - **Kategorie**: TEST, Aufgaben, Vorlesung, etc.
   - **Abgabedatum**: Deadline
   - **Anwendungsbereich**: TEST, optional, etc.
3. Speichern → Aufgabe erscheint in der Liste

### Aufgabe verteilen (Admin)
1. Aufgabe anklicken
2. Im Bereich **„Verteilen an Gruppen"**:
   - Dropdown öffnen
   - Gewünschte Jahrgänge/Gruppen wählen (z. B. Jahrgang 2024, 2025)
3. Klick auf **„Aufgabe verteilen"**
   - Die Aufgabe wird an alle Gruppenmitglieder weitergegeben
   - Info zeigt: Zeitstempel und Anzahl Empfänger

### Aufgabe bearbeiten
1. **Status ändern**: Dropdown im Feld „Status" auswählen
   - Note wird automatisch berechnet
2. **Speichern**: Button oben rechts → ✅ Bestätigung
3. **Löschen**: Rotes Kreuz-Symbol am Ende der Aufgabe

### Als Teilnehmer (nach Anmeldung)
- Ihre zugewiesenen Aufgaben erscheinen automatisch
- Filtern nach **Alle**, **Aktuell**, oder **Kategorie**
- Status aktualisieren (nur Lesezugriff, Admin speichert)

---

## ⚙️ Technische Details

### Dateistruktur
```
src/
├── components/tasks/
│   ├── TasksPage.vue          # Hauptseite (Admin & Teilnehmer)
│   ├── TaskList.vue           # Aufgabenliste mit Filterung
│   ├── TaskCard.vue           # Einzelne Aufgabenkarte
│   ├── TaskCreateForm.vue     # Formular zum Erstellen
│   ├── TaskHeader.vue         # Top-Navigation
│   └── RawDataModal.vue       # Rohdaten-Debugger
├── composables/
│   ├── useModule.ts           # KV-Store & Modul-Zugang
│   ├── useCreateTask.ts       # Task-Erstellung
│   └── usePermissions.ts      # Admin-Rechte & Gruppen
├── utils/
│   ├── kv-store.ts            # KV-Store API-Wrapper
│   ├── ct-types.d.ts          # TypeScript-Typen (ChurchTools)
│   ├── fetchChurchToolsData.ts # API-Abfragen
│   └── fetchGroupChildren.ts  # Gruppen-Hierarchie
└── data/
    └── initKvStore.ts         # Verteil-Logik
```

### Abhängigkeiten
- **Vue 3** + **TypeScript** + **Composition API**
- **Tailwind CSS** für Styling
- **Vite** als Build-Tool
- **ChurchTools Client** (`@churchtools/churchtools-client`)
- **Material Design Icons** (MDI) via CDN

### API-Endpunkte (verwendet)
```
GET   /whoami                           # Benutzer-Info
GET   /persons/{id}/groups              # Benutzer-Gruppen
GET   /groups/{id}/children             # Untergruppen
GET   /groups/{id}/members              # Gruppenmitglieder
GET   /custommodules                    # Module auflisten
POST  /custommodules                    # Modul erstellen
GET   /custommodules/{id}/customdatacategories
POST  /custommodules/{id}/customdatacategories
GET   /custommodules/{id}/customdatacategories/{catId}/customdatavalues
POST  /custommodules/{id}/customdatacategories/{catId}/customdatavalues
PUT   /custommodules/{id}/customdatacategories/{catId}/customdatavalues/{valId}
```

---

## 🔧 Fehlerbehebung

### „Fehler beim Laden der Daten"
**Ursache:** Keine Berechtigung auf KV-Store oder fehlende Kategorie.

**Lösung:**
1. Eingeloggt als Admin?
2. Button **„Kategorie ‹aufgaben› löschen"** (unten) → löscht alte Daten
3. Seite neu laden → Kategorie wird automatisch neu erstellt

### Aufgabe wird nicht angezeigt
**Ursache:** Kategorie-Shorty stimmt nicht überein oder falsche Gruppen-ID.

**Lösung:**
1. Inspiziert die Browser-Console (F12 → Console)
2. Prüft: `Module bsbo found:` und Kategorie-Info
3. Passt `TEILNEHMER_PARENT_GROUP_ID` in `usePermissions.ts` an

### Dropdown wird abgeschnitten
**Bereits behoben:** Overflow entfernt, Dropdown sollte vollständig sichtbar sein.

### Teilnehmer sehen verteilte Aufgaben nicht
**Ursache:** Falsche Rollen-IDs oder Gruppenmitgliedschaft.

**Lösung:**
1. Teilnehmer muss in der korrekten Gruppe (z. B. Jahrgang 2024) sein
2. Admin-Console prüfen: Ist die Person als Teilnehmer eingetragen?
3. Nötigenfalls `GROUP_TYPE_ROLE_ID` in `usePermissions.ts` anpassen

---

## 📦 Entwicklung & Deployment

### Dev-Server starten
```bash
npm install
npm run dev
```

### Build für Produktion
```bash
npm run build
```

### Deploy zu ChurchTools-Erweiterung
```bash
npm run deploy
```

---

## 🔐 Sicherheit & Datenschutz

- ✅ Alle Daten speichern im ChurchTools-KV-Store (nicht extern)
- ✅ Authentifizierung über ChurchTools-Session
- ✅ Admin-Rechte werden serverseitig geprüft (Gruppen-Rollen)
- ✅ HTTPS-only Kommunikation mit ChurchTools-API

---

## 📞 Support & Beitragen

Falls Bugs oder Verbesserungen anfallen:
1. Öffnet ein **Issue** im Repository
2. Mit Details: Schritte zum Reproduzieren + Browser-Console-Fehler
3. Gerne auch Pull Requests willkommen!

---

**Version:** 1.0.0 | **Letztes Update:** Dezember 2025 | **Lizenz:** MIT
