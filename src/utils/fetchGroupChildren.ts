import { churchtoolsClient } from '@churchtools/churchtools-client'

export interface GroupChild {
  title: string
  domainIdentifier: string
}

/**
 * Lädt die Untergruppen einer Gruppe (z. B. 566) aus ChurchTools.
 */
export async function fetchGroupChildren(
  parentGroupId: string
): Promise<GroupChild[]> {
  try {
    const res = await churchtoolsClient.get<any[]>(
      `/groups/${parentGroupId}/children`
    )

    if (!Array.isArray(res)) return []

    return res.map((g) => ({
      title: g.title,
      domainIdentifier: g.domainIdentifier,
    }))
  } catch (err) {
    console.error('❌ Fehler beim Laden der Untergruppen', err)
    return []
  }
}
