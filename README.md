# BSBO
Extension für Churchtools Wettbewerb

📘 Aufgaben‑Verwaltung – Bibelseminar Bad Oeynhausen
Diese Vue‑Komponente dient der Verwaltung, Anzeige und Verteilung von Aufgaben aus dem ChurchTools‑KV‑Store.
Sie wird u. a. von Dozenten und Administratoren zur Pflege von Lehr‑ und Studienaufgaben genutzt.

⚙️ Funktionsübersicht
💾 Laden, Speichern und Löschen von Aufgaben im KV‑Store
📋 Kategorisierte Darstellung nach Typ oder Monat
🧮 Status‑ und Notenverwaltung mit automatischer Notenanzeige
➕ Neue Aufgabe anlegen über ein separates Formular (<TaskCreateForm>)
🧩 Verteilung an Gruppen über initKvStore
⚙️ Rohdaten‑Ansicht (zur Debug‑Kontrolle der geladenen ChurchTools‑Daten)
🧩 Abhängigkeiten und benötigte Dateien
Die Komponente setzt folgende Module und Hilfsfunktionen voraus:

Tabelle


🧩 Abhängigkeiten und Module
Erforderliche Dateien und ihre Aufgaben:

utils/kv-store.ts
→ Zugriff auf den ChurchTools‑KV‑Store (lesen, schreiben, löschen)

composables/useModule.ts
→ Stellt useKvStore bereit (Modul‑ und Kategoriebestimmung)

composables/usePermissions.ts
→ Prüft Benutzerrechte (canSeeAdminFeatures)

utils/fetchChurchToolsData.ts
→ Lädt Personendaten aus ChurchTools

utils/fetchGroupChildren.ts
→ Lädt Gruppen für die Aufgabenverteilung

data/initKvStore.ts
→ Verteilt Aufgaben an ausgewählte Gruppen

components/TaskCreateForm.vue
→ Formular zum Erstellen neuer Aufgaben

components/UploadJson.vue(optional)
→ Ermöglicht JSON‑Import von Aufgaben

🧠 Voraussetzungen
Läuft innerhalb eines ChurchTools‑Moduls oder Plugins
Der eingeloggte Benutzer wird als Prop user (Typ Person) übergeben
Optional: Prop KEY (API‑/Modul‑Key) für KV‑Store‑Zugriff
Schreib‑ und Leserechte auf die ChurchTools‑APIs müssen eingerichtet sein
🔐 Zugriffsrechte
Nur Benutzer mit Admin‑Rechten (canSeeAdminFeatures) sehen zusätzliche Funktionen:

Rohdaten anzeigen
Speichern
Neue Aufgabe anlegen
Aufgabe verteilen
Löschen
Nur Benutzer mit Admin‑Rechten (canSeeAdminFeatures) sehen diese zusätzlichen Funktionen:

🧾 Rohdaten anzeigen
💾 Speichern
➕ Neue Aufgabe anlegen
📤 Aufgabe verteilen
🗑️ Löschen

»Rohdaten anzeigen«
»Speichern«
»Neue Aufgabe anlegen«
»Aufgabe verteilen«
»Löschen«
🚀 Nutzung / Ablauf
Initiales Laden

Beim Mounten werden Daten über loadAufgabeFromStore() geladen.
Aufgaben werden nach Kategorie bzw. Abgabedatum gefiltert und sortiert.
Aufgaben anlegen

Über den Button »Neue Aufgabe anlegen« öffnet sich ein Formular (TaskCreateForm).
Nach dem Speichern wird die Aufgabe automatisch neu geladen.
Status und Note

Der Status (z. B. teilgenommen, nicht erfüllt, Note 1 – 4) kann direkt in der Liste geändert werden.
Die Note wird automatisch berechnet.
Verteilen an Gruppen

Dropdown öffnen → Gruppen auswählen → »Aufgabe verteilen« klicken.
Die Aufgaben werden über initKvStore an alle Gruppenmitglieder verteilt.
Metadaten wie Zeitpunkt und Gruppen werden gespeichert.
Löschen

Einzelne Aufgaben oder komplette Kategorie »aufgaben« können gelöscht werden.
⚒️ Einrichtungsschritte / ToDo
KEY übergeben:
Die Komponente benötigt den Modul‑/API‑KEY für den ChurchTools‑KV‑Store.
vue

Kopieren
<AufgabenView :user="currentUser" KEY="meinModuleKey" />
ChurchTools‑API einrichten:
Zugriff auf getCustomDataValues, createCustomDataValue usw. sicherstellen.

Gruppen‑ID prüfen:
In fetchGroupChildren('566') die ID deiner Hauptgruppe anpassen:

ts

Kopieren
gruppenOptions.value = await fetchGroupChildren('DEINE_GRUPPEN_ID')
KV‑Kategorie sicherstellen:
Im ChurchTools‑Modul muss die Kategorie »aufgaben« angelegt oder automatisch erstellt werden.

Optional:
Testdaten über UploadJson.vue importieren (falls vorhanden).

🪄 Fehlerbehebung
Wenn beim Laden ein Fehler angezeigt wird:

Über den roten Button »Kategorie ‹aufgaben› löschen« kann die komplette Kategorie im KV‑Store gelöscht (zurückgesetzt) werden.
Danach wird sie beim nächsten Speichern automatisch neu angelegt.
📄 Props
Tabelle


Property	Typ	Beschreibung
user	Person	Der aktuell eingeloggte Benutzer
KEY	string(optional)	API-/Modul‑Key zur Identifikation des KV‑Stores
💬 Hinweise für Entwickler
Die Komponente nutzt Composition API (<script setup lang="ts">).
Daten werden vollständig reaktiv über ref() und computed() verwaltet.
Beim Statuswechsel wird updateTaskStatus() aufgerufen, was direkt in den KV‑Store schreibt.
onMounted() lädt automatisch Aufgaben, Rohdaten und Gruppen.
📍 Ziel:
Eine zuverlässige Vue‑Verwaltung für Aufgaben innerhalb des ChurchTools‑Ökosystems, die einfach gepflegt und erweitert werden kann.
