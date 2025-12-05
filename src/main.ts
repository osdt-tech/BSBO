import { createApp } from 'vue'
import App from './App.vue'

// Typen & CT-Client
import type { Person } from './utils/ct-types'
import { churchtoolsClient } from '@churchtools/churchtools-client'


// Tailwind
import './assets/tailwind.css'

// ⚡️ MDI-Icons dynamisch via CDN laden
const mdiLink = document.createElement('link')
mdiLink.rel = 'stylesheet'
mdiLink.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css'
document.head.appendChild(mdiLink)



// Nur im Dev‑Modus CSS resetten
if (import.meta.env.MODE === 'development') {
  import('./utils/reset.css')
}

// 🛠 ChurchTools-Setup
declare const window: Window &
  typeof globalThis & {
    settings: { base_url?: string }
  }

const baseUrl = window.settings?.base_url ?? import.meta.env.VITE_BASE_URL
churchtoolsClient.setBaseUrl(baseUrl)

const username = import.meta.env.VITE_USERNAME
const password = import.meta.env.VITE_PASSWORD

if (import.meta.env.MODE === 'development' && username && password) {
  await churchtoolsClient.post('/login', { username, password })
}

const KEY = import.meta.env.VITE_KEY
export { KEY }

// 👤 eingeloggten Benutzer laden
const user = await churchtoolsClient.get<Person>('/whoami')

console.log("HHHH")
 console.log(user.id)



// 🎉 App starten
createApp(App, { user, KEY })
  .mount('#app')
