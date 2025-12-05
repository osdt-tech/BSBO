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
export async function useKvStore(KEY?: string, categoryShorty = 'BSBO-aufgaben') {
  // 1️⃣ Modul nur einmal laden
  if (!cached.module.value) {
    cached.module.value = await getOrCreateModule(
      KEY || 'BSBO',
      categoryShorty,
      'BSBO-Aufgabenverwaltung'
    )
  }
  const module = cached.module.value

  // 2️⃣ Kategorie prüfen / anlegen
  if (!cached.categories.has(categoryShorty)) {
    let category = await getCustomDataCategory<object>(categoryShorty)
    if (!category) {
      await createCustomDataCategory(
        {
          customModuleId: module.id,
          name: KEY || 'BSBO',
          shorty: categoryShorty,
          description: 'BSBO-Aufgabenverwaltung'
        },
        module.id
      )
      category = await getCustomDataCategory<object>(categoryShorty)
    }
    cached.categories.set(categoryShorty, category)
  }

  const category = cached.categories.get(categoryShorty)
  return { module, category }
}
