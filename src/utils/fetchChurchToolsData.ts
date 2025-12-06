import { churchtoolsClient } from '@churchtools/churchtools-client'

/**
 * Lädt mehrere vordefinierte Endpunkte parallel vom ChurchTools-API
 * und gibt ein strukturiertes Objekt mit { info, data } pro Key zurück.
 * 
 * GET
/groups/{groupId}/children

 */
export async function fetchChurchToolsData() {
  const endpoints = [
    { key: 'person', url: '/whoami', info: 'Geladen von /whoami' },
    { key: 'serviceGroups', url: '/servicegroups', info: 'Geladen von /servicegroups' },
    { key: 'events', url: '/events', info: 'Geladen von /events' },
    { key: 'groups', url: '/groups', info: 'Geladen von /groups' },
    { key: 'persons', url: '/persons/1/groups', info: 'Geladen von /persons/{personId}/groups' },
    { key: 'groups2', url: '/groups/569/roles', info: 'Geladen von /groups/{groupId}/roles' },
    { key: 'groupsmebers', url: '/groups/573/members', info: 'Geladen von /groups/{groupId}/members' },
     { key: 'groups_children', url: '/groups/566/children', info: 'Geladen von /groups/{groupId}/children' },
  ]

  // 1️⃣ alle Requests parallel starten, Fehler pro Endpoint abfangen
  const results = await Promise.allSettled(endpoints.map(e => churchtoolsClient.get<any>(e.url)))

  // 2️⃣ Daten aufbereiten
  const rawDataMap = Object.fromEntries(
    endpoints.map((e, i) => {
      const res = results[i]
      if (res.status === 'rejected') {
        console.warn(`[fetchChurchToolsData] ${e.url} fehlgeschlagen:`, res.reason)
        return [e.key, { info: e.info, data: null, error: true }]
      }

      let data = res.value

      // 👉 beim Key 'persons' gezielt filtern
      if (e.key === 'persons' && Array.isArray(data)) {
        data = data.filter(
          (item: any) =>
            item.group?.domainIdentifier === '569' &&
            item.groupTypeRoleId === 16
        )
      }

      return [e.key, { info: e.info, data, error: false }]
    })
  )

  console.log('[fetchChurchToolsData] Ergebnis:', rawDataMap)
  return rawDataMap
}
