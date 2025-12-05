import { ref } from 'vue'
import { useKvStore } from '../composables/useModule'
import {
  createCustomDataValue,
  getCustomDataValues,
  updateCustomDataValue,
} from '../utils/kv-store'

import type { Person } from '../utils/ct-types'

// ------------------------------------------------------------
// Composable für das Anlegen neuer Aufgaben
// ------------------------------------------------------------
export function useCreateTask(KEY?: string, user?: Person) {
  const saveMessage = ref('')

  async function showSaveMessage(text: string) {
    saveMessage.value = text
    setTimeout(() => (saveMessage.value = ''), 2500)
  }

  // ----------------------------------------------------------
  // Hauptfunktion: neuen Task erzeugen und im KV-Store speichern
  // ----------------------------------------------------------
  async function createTask(form: {
    title: string
    kategorie: string
    abgabedatum: string
    anwendungsbereich: string
  }) {
    const id = Date.now().toString()
    const task = {
      properties: {
        'Aufgabe': { title: [{ plain_text: form.title }] },
        'Kategorie': { select: { name: form.kategorie } },
        'Abgabedatum': { date: { start: form.abgabedatum } },
        'Anwendungsbereich': { select: { name: form.anwendungsbereich } },
        'AufgabenID': { number: Number(id) },
      },
      verteilMeta: {},
      selectedGroupIds: [],
    }

    try {
      // 🔑 KV-Store initialisieren
      const { module, category } = await useKvStore(KEY)

      // Benutzer-Identifikation aufbauen
      const userIdentifier =
        user?.id?.toString() ||
        [user?.firstName, user?.lastName].filter(Boolean).join('-') ||
        'unknown'

      const churchToolsId = id
      const dataKey = `ct-${churchToolsId}-${userIdentifier}`
      const dataValue = JSON.stringify({ key: dataKey, user: userIdentifier, value: task })

      const allValues = await getCustomDataValues<{ key: string; value: any }>(
        category!.id,
        module.id
      )

      const existing = allValues.find((v) => v.key === dataKey)
      if (existing) {
        await updateCustomDataValue(category!.id, existing.id, { value: dataValue }, module.id)
        console.log(`🔄 Aufgabe aktualisiert: ${form.title}`)
      } else {
        await createCustomDataValue({ dataCategoryId: category!.id, value: dataValue }, module.id)
        console.log(`💾 Neue Aufgabe gespeichert: ${form.title}`)
      }
    } catch (err) {
      console.error('❌ Fehler beim Erstellen einer neuen Aufgabe:', err)
    }
  }

  return { createTask, showSaveMessage }
}
