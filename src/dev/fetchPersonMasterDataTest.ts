import { fetchPersonMasterData } from '../composables/fetchdata.ts'
import type { Person } from '../utils/ct-types'

// Dummy‑Person oder echte Person aus deinem Login‑Kontext
const testUser: Person = { id: 1, firstName: 'Armin', lastName: 'Adendorf' } as Person

fetchPersonMasterData(testUser).then(data => {
  console.log('Ergebnis:', data)
})
