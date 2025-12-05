// /**
//  * src/utils/import_from_notion.ts
//  * Liest lokale Aufgabe(n) aus JSON-Datei(n) und legt sie im ChurchTools KV‑Store ab.
//  */

// import { readFile } from 'node:fs/promises'
// import {
//   getOrCreateModule,
//   getCustomDataCategory,
//   createCustomDataCategory,
//   getCustomDataValues,
//   createCustomDataValue,
//   updateCustomDataValue
// } from './kv-store.ts'

// // ---------- Import- und Sync-Funktion ----------

// export async function importAufgabeFromNotion(KEY?: string) {
//   try {
//     // 📄 JSON-Datei lesen
//     const fileUrl = new URL('../data/aufgabe.json', import.meta.url)
//     const raw = await readFile(fileUrl, 'utf8')
//     const aufgabeJson = JSON.parse(raw)

//     console.log('🚀 Importiere Aufgabe:', aufgabeJson.properties?.['Aufgabe']?.title?.[0]?.plain_text ?? aufgabeJson.id)

//     // 📦 Modul holen oder anlegen
//     const module = await getOrCreateModule(
//       KEY || 'bbgbo-app',
//       'BBGBO App',
//       'BBGBO Aufgabenverwaltung'
//     )

//     // 📂 Kategorie sicherstellen
//     let category = await getCustomDataCategory<object>('aufgaben')
//     if (!category) {
//       console.log('📁 Kategorie "aufgaben" wird neu erstellt …')
//       await createCustomDataCategory(
//         {
//           customModuleId: module.id,
//           name: 'Aufgaben',
//           shorty: 'aufgaben',
//           description: 'Gespeicherte Aufgaben-Datensätze (importiert aus Notion)'
//         },
//         module.id
//       )
//       category = await getCustomDataCategory<object>('aufgaben')
//     }

//     // 🗝️ Struktur für den KV‑Eintrag
//     const dataKey = aufgabeJson.id || 'default'
//     const dataValue = JSON.stringify(aufgabeJson)

//     // 🔍 Prüfen, ob vorhanden
//     const allValues = await getCustomDataValues<{ key: string; value: any }>(category!.id, module.id)
//     const existing = allValues.find(v => v.key === dataKey)

//     if (existing) {
//       console.log(`🔄 Aktualisiere bestehenden Datensatz (${dataKey}) …`)
//       await updateCustomDataValue(category!.id, existing.id, { value: dataValue }, module.id)
//       console.log('✅ Datensatz aktualisiert.')
//     } else {
//       console.log(`💾 Lege neuen Datensatz an (${dataKey}) …`)
//       await createCustomDataValue(
//         { dataCategoryId: category!.id, value: dataValue },
//         module.id
//       )
//       console.log('✅ Neuer Datensatz gespeichert.')
//     }

//     console.log('🎉 Import abgeschlossen!')
//   } catch (error) {
//     console.error('❌ Fehler beim Import:', error)
//   }
// }

// // ---------- Direkt ausführbar machen ----------
// if (import.meta.main) {
//   importAufgabeFromNotion().then(() => {
//     console.log('✅ Fertig.')
//     process.exit(0)
//   })
// }
