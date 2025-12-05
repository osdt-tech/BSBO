import {
  getCustomDataValues,
  createCustomDataValue,
  // updateCustomDataValue,
} from '../utils/kv-store'
import { useKvStore } from '../composables/useModule'
import { getAllTeilnehmer } from '../composables/usePermissions'

export async function initKvStore(
  _KEY?: string,
  customData?: any,
  groupIdsToUse?: string[]
): Promise<{ count: number }> {
  console.log('🚀 KV‑Store wird initial befüllt …')

  try {
    // 1️⃣ Teilnehmer aus ausgewählten Gruppen laden
    const teilnehmer = await getAllTeilnehmer(groupIdsToUse)
    console.log(
      `👥 Gefundene Teilnehmer: ${teilnehmer.length} aus Gruppen ${groupIdsToUse?.join(', ') || '(alle)'}`
    )

    // 2️⃣ CustomData vorbereiten
    const pages = Array.isArray(customData)
      ? customData
      : customData
      ? [customData]
      : []

    if (pages.length === 0) {
      console.warn('⚠️ Keine Datensätze zum Import gefunden.')
      return { count: 0 }
    }

    // 3️⃣ KV-Kategorie vorbereiten
    const { module, category } = await useKvStore(_KEY)
    const allValues = await getCustomDataValues<{ key: string; value: any }>(
      category.id,
      module.id
    )

    // 4️⃣ Für jeden Teilnehmer speichern
    for (const person of teilnehmer) {
      const userIdentifier = person.personId?.toString() ?? 'unknown'
      console.log(`👤 Starte Import für Teilnehmer ${userIdentifier}`)

      for (const page of pages) {
        const churchToolsId =
          page.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
        const dataKey = `ct-${churchToolsId}-${userIdentifier}`

        const existing = allValues.find((v) => v.key === dataKey)
        const valueData = JSON.stringify({
          key: dataKey,
          user: userIdentifier,
          value: page,
        })

        if (existing) {
          console.log(`Datensatz schon vorhanden: ${dataKey}`)
        } else {
          await createCustomDataValue(
            { dataCategoryId: category.id, value: valueData },
            module.id
          )
          console.log(`💾 Neu gespeichert: ${dataKey}`)
        }
      }
    }

    console.log('✅ JSON‑Import für alle Teilnehmer abgeschlossen!')
    return { count: teilnehmer.length }
  } catch (err) {
    console.error('❌ Fehler beim Import:', err)
    return { count: 0 }
  }
}
