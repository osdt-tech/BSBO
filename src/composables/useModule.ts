// src/composables/useModule.ts
import { ref } from 'vue'
import {
  getOrCreateModule,
  getCustomDataCategory,
  createCustomDataCategory
} from '../utils/kv-store'

const cached = {
  module: ref<any | null>(null),
  categories: new Map<string, any>()
}

/**
 * Initialisiert das Modul „BBGBO App“ und legt bei Bedarf die angegebene Kategorie an.
 */
export async function useKvStore(KEY?: string, categoryShorty?: string) {
  const moduleKey = KEY || 'BSBO'
  const categoryKey = categoryShorty || `${moduleKey.toLowerCase()}-aufgaben`

  // 1️⃣ Modul nur einmal laden
  if (!cached.module.value) {
    cached.module.value = await getOrCreateModule(
      moduleKey,
      categoryKey,
      'BSBO-Aufgabenverwaltung'
    )
  }
  const module = cached.module.value

  // 2️⃣ Kategorie prüfen / anlegen
  if (!cached.categories.has(categoryKey)) {
    try {
      let category = await getCustomDataCategory<object>(categoryKey)
      if (!category) {
        await createCustomDataCategory(
          {
            customModuleId: module.id,
            name: moduleKey,
            shorty: categoryKey,
            description: 'BSBO-Aufgabenverwaltung'
          },
          module.id
        )
        category = await getCustomDataCategory<object>(categoryKey)
      }
      cached.categories.set(categoryKey, category)
    } catch (err: any) {
      // Häufige Ursache: fehlende Berechtigung (403) oder fehlende Kategorie. Wir loggen und cachen null, damit die UI sinnvoll reagieren kann.
      console.warn('[useKvStore] Kategorie konnte nicht geladen/angelegt werden:', err?.message || err)
      cached.categories.set(categoryKey, null)
    }
  }

  const category = cached.categories.get(categoryKey)
  return { module, category }
}
