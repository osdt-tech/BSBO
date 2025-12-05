// src/composables/usPermissions.ts

import { ref, computed, onMounted } from 'vue'
import { churchtoolsClient } from '@churchtools/churchtools-client'
import type { Person } from '../utils/ct-types'
import { fetchGroupChildren } from '../utils/fetchGroupChildren'

// ---------------------------------------------
//  Konstanten & Initialisierung
// ---------------------------------------------
const ADMINISTRATION_GROUP_ID = '569'
const ADMINISTRATION_ROLE_ID = 16
const TEILNEHMER_PARENT_GROUP_ID = '566'
const TEILNEHMER_ROLE_ID = 15
const GROUP_TYPE_ROLE_ID = 8

let TEILNEHMER_GROUP_IDS: string[] = []

// einmalig beim Laden abrufen
;(async () => {
  try {
    const children = await fetchGroupChildren(TEILNEHMER_PARENT_GROUP_ID)
    TEILNEHMER_GROUP_IDS = children.map((c) => c.domainIdentifier)
    console.log('[usePermissions] Geladene Teilnehmer-Gruppen:', TEILNEHMER_GROUP_IDS)
  } catch (err) {
    console.error('❌ Fehler beim Laden der Gruppen-Kinder:', err)
  }
})()

// ---------------------------------------------
//  Logging-Helfer
// ---------------------------------------------
function log(label: string, ...data: any[]) {
  if (import.meta.env.DEV) {
    const ts = new Date().toISOString().split('T')[1].replace('Z', '')
    console.log(`[usePermissions] ${ts} ${label}`, ...data)
  }
}

function error(label: string, ...data: any[]) {
  const ts = new Date().toISOString().split('T')[1].replace('Z', '')
  console.error(`[usePermissions ❌] ${ts} ${label}`, ...data)
}

// ---------------------------------------------
//  Rechte & Sichtbarkeiten für Benutzer
// ---------------------------------------------
export function usePermissions(user: Person) {
  const groups = ref<any[]>([])

  onMounted(async () => {
    try {
      log(`Lade Gruppendaten für Person ${user.id} …`)
      const res = await churchtoolsClient.get<any>(`/persons/${user.id}/groups`)
      groups.value = Array.isArray(res) ? res : []
      log(`Geladene Gruppen (${groups.value.length}):`, groups.value)
    } catch (err) {
      error(`Fehler beim Laden von /persons/${user.id}/groups`, err)
    }
  })

  const groupIds = computed<string[]>(() => {
    const ids = groups.value
      .map((m: any) => m.group?.domainIdentifier?.toString())
      .filter((id: string | undefined): id is string => !!id)
    log('Berechnete groupIds:', ids)
    return ids
  })

  const isAdministration = computed(() => {
    const value = groups.value.some(
      (item: any) =>
        item.group?.domainIdentifier === ADMINISTRATION_GROUP_ID &&
        item.groupTypeRoleId === ADMINISTRATION_ROLE_ID
    )
    log('isAdministration =', value)
    return value
  })

  const isTeilnehmer = computed(() => {
    const value = groups.value.some(
      (item: any) =>
        TEILNEHMER_GROUP_IDS.includes(item.group?.domainIdentifier?.toString()) &&
        item.groupTypeRoleId === TEILNEHMER_ROLE_ID
    )
    log('isTeilnehmer =', value)
    return value
  })

  const canSeeAdminFeatures = computed(() => {
    const value = isAdministration.value && !isTeilnehmer.value
    log('canSeeAdminFeatures =', value)
    return value
  })

  return {
    groupIds,
    isAdministration,
    isTeilnehmer,
    canSeeAdminFeatures,
  }
}

// ---------------------------------------------
//  Globale Teilnehmer-Abfrage über mehrere Gruppen
// ---------------------------------------------
export async function getAllTeilnehmer(groupIdsToUse?: string[]): Promise<any[]> {
  try {
    // Wenn keine spezifischen Gruppen übergeben wurden, alle untergeordneten Gruppen holen
    if (!groupIdsToUse || !groupIdsToUse.length) {
      if (!TEILNEHMER_GROUP_IDS.length) {
        const children = await fetchGroupChildren(TEILNEHMER_PARENT_GROUP_ID)
        TEILNEHMER_GROUP_IDS = children.map((c) => c.domainIdentifier)
      }
    } else {
      TEILNEHMER_GROUP_IDS = groupIdsToUse
    }

    let allMembers: any[] = []

    for (const gid of TEILNEHMER_GROUP_IDS) {
      log(`Lade Mitglieder aus Gruppe ${gid} …`)
      const res = await churchtoolsClient.get<any>(`/groups/${gid}/members`)

      const members = Array.isArray(res)
        ? res.filter(
            (m: any) =>
              m.groupTypeRoleId === GROUP_TYPE_ROLE_ID &&
              m.personId
          )
        : []

      log(`➡️ ${members.length} Mitglieder in Gruppe ${gid}`)
      allMembers.push(...members)
    }

    log(`➡️ Gesamt ${allMembers.length} Teilnehmer aus ${TEILNEHMER_GROUP_IDS.length} Gruppen`)
    return allMembers
  } catch (err) {
    error('Fehler beim Laden aller Teilnehmer', err)
    return []
  }
}

