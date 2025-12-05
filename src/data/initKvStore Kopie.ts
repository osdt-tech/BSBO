// // src/data/initKvStore.ts
// import {
//   getOrCreateModule,
//   getCustomDataCategory,
//   createCustomDataCategory,
//   getCustomDataValues,
//   createCustomDataValue,
//   updateCustomDataValue,
// } from '../utils/kv-store'

// // JSON direkt importieren
// import aufgabeData from './aufgabe.json' assert { type: 'json' }

// export async function initKvStore(KEY?: string) {
//   console.log('🚀 KV‑Store wird initial aus lokaler Datei befüllt …')

//   try {
//     const userIdentifier = '1'
//     console.log(`👤 User: ${userIdentifier}`)

//     // hier keine "results"‑Schleife!
//     const pages = Array.isArray(aufgabeData) ? aufgabeData : [aufgabeData]
//     console.log(`📦 ${pages.length} lokale Datensätze geladen.`)

//     // KV‑Store vorbereiten
//     const module = await getOrCreateModule(
//       KEY || 'bbgbo-app',
//       'BBGBO App',
//       'Aufgabenverwaltung'
//     )

//     let category = await getCustomDataCategory<object>('aufgaben')
//      if (!category) {
//       await createCustomDataCategory({
//         customModuleId: module.id,
//         name: 'Aufgaben',
//         shorty: 'aufgaben',
//         description: 'Gespeicherte Aufgaben-Datensätze'
//       }, module.id)
//       category = await getCustomDataCategory<object>('aufgaben')
//     }

//     // Datensätze speichern
//     const allValues = await getCustomDataValues<{ key: string; value: any }>(
//       category!.id,
//       module.id
//     )

// for (const page of pages) {
//   // ➜ ChurchTools-ID aus den Properties holen
//   const churchToolsId = page.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'

//   // ➜ dein eindeutiger Key pro Benutzer
//   const dataKey = `ct-${churchToolsId}-${userIdentifier}`

//   const existing = allValues.find((v) => v.key === dataKey)
//   const valueData = JSON.stringify({
//     key: dataKey,
//     user: userIdentifier,
//     value: page,
//   })

//   if (existing) {
//     await updateCustomDataValue(category!.id, existing.id, { value: valueData }, module.id)
//     console.log(`🔄 Aktualisiert: ${dataKey}`)
//   } else {
//     await createCustomDataValue({ dataCategoryId: category!.id, value: valueData }, module.id)
//     console.log(`💾 Neu gespeichert: ${dataKey}`)
//   }
// }


//     console.log('✅ Lokaler JSON‑Import abgeschlossen!')
//   } catch (err) {
//     console.error('❌ Fehler beim Import aus Datei:', err)
//   }
// }
