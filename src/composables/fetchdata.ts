

// src/composables/fetchdata.ts


import type { Person, PersonMasterData } from '../utils/ct-types'
import { churchtoolsClient } from '@churchtools/churchtools-client';



export async function fetchPersonMasterData(user: Person): Promise<PersonMasterData | null> {
  // if (!user?.id) {
  //   console.warn('[fetchPersonMasterData] Kein user.id vorhanden')
  //   return null
  // }

  try {
    const res = await churchtoolsClient.get<PersonMasterData | { data?: PersonMasterData }>(`/persons/${user.id}`,)
  //  console.log('[PersonMasterData]', data)

    // Antwort normalisieren
    const data =
      (res as any)?.data && typeof (res as any).data === 'object'
        ? (res as any).data
        : (res as any)

    console.log('[PersonMasterData]', data)
    return data
  } catch (err) {
    console.error('[fetchPersonMasterData] Fehler beim Abruf:', err)
    return null
  }
}