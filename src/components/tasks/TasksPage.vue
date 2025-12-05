<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Oberer Bereich (Titel + Buttons) -->
    <div class="border-b border-slate-200 bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <!-- Titel -->
        <div class="flex items-center gap-3">
          <i class="mdi mdi-church text-3xl text-blue-600"></i>
          <div>
            <h1 class="text-xl font-semibold text-slate-900">Bibelseminar Bad Oeynhausen</h1>
            <p class="text-sm text-slate-500">Willkommen {{ fullName }} 👋</p>
            <p v-if="KEY" class="text-xs text-slate-400">KEY: {{ KEY }}</p>
          </div>
        </div>



        <button @click="goHome"
          class="flex items-center justify-center sm:justify-start gap-2 text-blue-600 hover:text-blue-800 font-medium border border-blue-100 sm:border-0 px-3 py-2 rounded-md sm:rounded-none bg-white sm:bg-transparent shadow-sm sm:shadow-none transition">
          <i class="mdi mdi-home text-lg"></i> Startseite
        </button>

        <!-- Buttons -->
        <!-- Buttons -->
        <div v-if="canSeeAdminFeatures"
        class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto"
  >
    <button @click="showRawDataModal = true" class="btn-base btn-orange">
      <i class="mdi mdi-code-json text-base leading-none"></i>
      <span>Rohdaten</span>
    </button>



    <!--  <UploadJson ref="uploadJsonRef" /> -->

    <button @click="saveAufgabeToStore" class="btn-base btn-green">
      <i class="mdi mdi-content-save text-base leading-none"></i>
      <span>Speichern</span>
    </button>

    <button @click="toggleCreateForm" class="btn-base btn-brown">
      <i class="mdi mdi-plus-circle text-base leading-none"></i>
      <span>{{ showCreateForm ? 'Formular ausblenden' : 'Neue Aufgabe anlegen' }}</span>
    </button>

        </div>

      </div>
    </div>

    <!-- Hinweis -->
    <transition name="fade">
      <div v-if="saveMessage"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-md text-sm">
        {{ saveMessage }}
      </div>
    </transition>

    <!-- 🪄 Formular mit Fade‑Transition -->
    <transition name="fade">
      <TaskCreateForm v-if="showCreateForm" :user="props.user" :KEY="props.KEY" @task-created="() => {
        showCreateForm = false
        loadAufgabeFromStore()
      }" />
    </transition>


    <!-- Hauptinhalt -->
    <main class="flex-1 pb-10 px-4 sm:px-8">
      <div class="bg-white shadow-md rounded-lg border border-slate-200 overflow-hidden">
        <!-- Kopfbereich -->
        <div
          class="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 class="text-base sm:text-lg font-semibold text-slate-800">
            Aufgaben aus dem KV-Store
          </h2>



          <div class="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <!-- Reiter-Leiste -->
            <div class="flex border-b border-slate-200 bg-slate-50 px-0 sm:px-2 overflow-x-auto">
              <button v-for="k in kategorien" :key="k" @click="aktiveKategorie = k"
                class="px-4 py-2 text-sm font-medium whitespace-nowrap" :class="aktiveKategorie === k
                  ? 'border-b-2 border-blue-600 text-blue-700'
                  : 'text-slate-600 hover:text-blue-600'">
                {{ k }}
              </button>
            </div>

            <span v-if="aufgabeData.length" class="text-xs text-slate-500 text-right">
              {{ aufgabeData.length }} Aufgaben
            </span>
          </div>
        </div>

        <!-- Kartenansicht -->
        <div v-if="aufgabeData.length" class="p-4 space-y-8">
          <!-- Gruppierung nach Monaten nur im Reiter "Alle" -->
          <template v-if="aktiveKategorie === 'Alle'">
            <div v-for="group in gruppierteAufgaben" :key="group.key" class="space-y-4">
              <!-- Monatsüberschrift + Info -->
              <div class="inline-flex items-baseline gap-2 px-3 py-1 rounded-full mb-2" :class="group.isPast
                ? 'bg-red-50 text-red-700'
                : 'bg-emerald-50 text-emerald-700'">
                <span class="text-base sm:text-lg font-semibold">
                  {{ group.label }}
                </span>
                <span v-if="group.info" class="text-xs sm:text-sm font-normal opacity-90">
                  {{ group.info }}
                </span>
              </div>

              <!-- Aufgaben dieses Monats -->
              <div class="space-y-4">
                <div v-for="(task, index) in group.tasks" :key="index"
                  class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 hover:shadow-md transition">
                  <!-- Kopf: Titel + Kategorie -->
                  <div
                    class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                    <h3 v-if="aktiveSpalten.includes('Titel')"
                      class="text-sm sm:text-base font-semibold text-slate-900">
                      {{ task.properties['Aufgabe']?.title?.[0]?.plain_text ?? '—' }}
                    </h3>
                    <span v-if="aktiveSpalten.includes('Kategorie')"
                      class="inline-flex items-center self-start px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                      {{ task.properties['Kategorie']?.select?.name ?? '—' }}
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-700">
                    <p v-if="aktiveSpalten.includes('Abgabedatum')">
                      <span class="font-semibold">Abgabedatum:</span>
                      <span class="ml-1">
                        {{ task.properties['Abgabedatum']?.date?.start ?? '—' }}
                      </span>
                    </p>

                    <p v-if="aktiveSpalten.includes('Anwendungsbereich')">
                      <span class="font-semibold">Anwendungsbereich:</span>
                      <span class="ml-1">
                        {{ task.properties['Anwendungsbereich']?.select?.name ?? '—' }}
                      </span>
                    </p>

                    <p v-if="aktiveSpalten.includes('Dozent')">
                      <span class="font-semibold">Dozent:</span>
                      <span class="ml-1">
                        {{ task.properties['Dozent']?.rich_text?.[0]?.plain_text ?? '—' }}
                      </span>
                    </p>

                    <!-- Status -->
                    <div v-if="aktiveSpalten.includes('Status')">
                      <span class="font-semibold block">Status:</span>
                      <select :value="task.properties['Status']?.select?.name || ''"
                        @change="event => updateStatusValue(task, event)" :class="[
                          'mt-1 w-full border border-slate-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                          statusColor(task.properties['Status']?.select?.name || '')
                        ]">
                        <option disabled value="">— Status wählen —</option>
                        <option value="kein Status">kein Status</option>
                        <option v-for="option in statusOptions" :key="option" :value="option">
                          {{ option }}
                        </option>
                      </select>
                    </div>

                    <!-- Note -->
                    <p v-if="aktiveSpalten.includes('Note')">
                      <span class="font-semibold">Note:</span>
                      <span class="ml-1">
                        {{ task.properties['Note Aufgabe zur Vorlesung']?.formula?.number ?? '—' }}
                      </span>
                    </p>
                  </div>

                  <!-- Aktionen -->
                  <div v-if="aktiveSpalten.includes('Aktionen')" class="mt-4 flex items-center justify-end gap-3">
                    <!-- Nur Admin -->
                    <div v-if="canSeeAdminFeatures" class="flex flex-col sm:flex-row sm:items-start gap-3">

                      <!-- 🕓 Info daneben -->
                      <div class="flex flex-col text-[11px] text-slate-500 italic">
                        <span v-if="verteilInfo[task.properties?.['AufgabenID']?.number?.toString()]">
                          Zuletzt verteilt:
                          {{ verteilInfo[task.properties?.['AufgabenID']?.number?.toString()]?.timestamp }}
                          ({{ verteilInfo[task.properties?.['AufgabenID']?.number?.toString()]?.count }} Teilnehmer)
                        </span>

                        <span v-if="verteilInfo[task.properties?.['AufgabenID']?.number?.toString()]?.gruppen?.length"
                          class="text-[10px] text-emerald-700">
                          An:
                          {{ verteilInfo[task.properties?.['AufgabenID']?.number?.toString()]?.gruppen.join(', ') }}
                        </span>
                      </div>

                      <!-- 🧩 Gruppen-Auswahl pro Aufgabe -->
                      <div class="bg-emerald-50 border border-emerald-100 rounded px-3 py-2 w-full sm:w-auto">
                        <label class="text-xs font-semibold text-emerald-700 block mb-1">
                          Verteilen an Gruppen:
                        </label>

                        <div class="relative inline-block w-60">
                          <button type="button" @click.stop="toggleDropdown(task)"
                            class="w-full flex justify-between items-center border border-slate-300 bg-white text-sm px-2 py-1 rounded shadow-sm hover:border-emerald-400 transition">
                            <span>
                              {{
                                aufgabenGruppen[task.properties['AufgabenID']?.number]?.length
                                  ? `${aufgabenGruppen[task.properties['AufgabenID']?.number].length} Gruppen ausgewählt`
                                  : 'Gruppe auswählen'
                              }}
                            </span>
                            <i class="mdi"
                              :class="showGroupDropdown[task.properties['AufgabenID']?.number] ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
                          </button>

                          <!-- Dropdown-Liste -->
                          <div v-if="showGroupDropdown[task.properties['AufgabenID']?.number]"
                            class="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded shadow-md max-h-56 overflow-y-auto">
                            <label v-for="g in gruppenOptions" :key="g.domainIdentifier"
                              class="flex items-center gap-2 px-2 py-1 hover:bg-emerald-50 cursor-pointer text-sm">
                              <input type="checkbox" :value="g.domainIdentifier"
                                v-model="aufgabenGruppen[task.properties['AufgabenID']?.number]"
                                class="rounded text-emerald-600 focus:ring-0" />
                              {{ g.title }}
                            </label>
                          </div>
                        </div>

                        <!-- Tags unten -->
                        <div v-if="aufgabenGruppen[task.properties['AufgabenID']?.number]?.length"
                          class="mt-2 flex flex-wrap gap-1 text-xs text-emerald-700">
                          <span v-for="gid in aufgabenGruppen[task.properties['AufgabenID']?.number]" :key="gid"
                            class="bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                            {{gruppenOptions.find(g => g.domainIdentifier === gid)?.title}}
                          </span>
                        </div>
                      </div>

                      <!-- 🟢 Verteilen-Button separat -->
                      <button type="button" @click.stop="verteileAufgabe(task)"
                        class="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium">
                        <i class="mdi mdi-send text-base"></i>
                        <span>Aufgabe verteilen</span>
                      </button>
                    </div>



                  </div>
                  <!-- Bestehender Lösch‑Button -->
                  <button @click="deleteTask(task)"
                    class="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium">
                    <i class="mdi mdi-delete text-base"></i>
                    <span>Löschen</span>
                  </button>

                </div>
              </div>
            </div>
          </template>

          <!-- Andere Reiter: einfache Liste ohne Monats-Gruppierung -->
          <template v-else>
            <div v-for="(task, index) in gefilterteAufgaben" :key="index"
              class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 hover:shadow-md transition">
              <!-- Kopf: Titel + Kategorie -->
              <div
                class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                <h3 v-if="aktiveSpalten.includes('Titel')" class="text-sm sm:text-base font-semibold text-slate-900">
                  {{ task.properties['Aufgabe']?.title?.[0]?.plain_text ?? '—' }}
                </h3>
                <span v-if="aktiveSpalten.includes('Kategorie')"
                  class="inline-flex items-center self-start px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                  {{ task.properties['Kategorie']?.select?.name ?? '—' }}
                </span>
              </div>

              <!-- Details -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-700">
                <p v-if="aktiveSpalten.includes('Abgabedatum')">
                  <span class="font-semibold">Abgabedatum:</span>
                  <span class="ml-1">
                    {{ task.properties['Abgabedatum']?.date?.start ?? '—' }}
                  </span>
                </p>

                <p v-if="aktiveSpalten.includes('Anwendungsbereich')">
                  <span class="font-semibold">Anwendungsbereich:</span>
                  <span class="ml-1">
                    {{ task.properties['Anwendungsbereich']?.select?.name ?? '—' }}
                  </span>
                </p>

                <p v-if="aktiveSpalten.includes('Dozent')">
                  <span class="font-semibold">Dozent:</span>
                  <span class="ml-1">
                    {{ task.properties['Dozent']?.rich_text?.[0]?.plain_text ?? '—' }}
                  </span>
                </p>

                <!-- Status -->
                <div v-if="aktiveSpalten.includes('Status')">
                  <span class="font-semibold block">Status:</span>
                  <select :value="task.properties['Status']?.select?.name || ''"
                    @change="event => updateStatusValue(task, event)" :class="[
                      'mt-1 w-full border border-slate-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                      statusColor(task.properties['Status']?.select?.name || '')
                    ]">
                    <option disabled value="">— Status wählen —</option>
                    <option value="kein Status">kein Status</option>
                    <option v-for="option in statusOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>

                <!-- Note -->
                <p v-if="aktiveSpalten.includes('Note')">
                  <span class="font-semibold">Note:</span>
                  <span class="ml-1">
                    {{ task.properties['Note Aufgabe zur Vorlesung']?.formula?.number ?? '—' }}
                  </span>
                </p>
              </div>

              <!-- Aktionen -->
              <div v-if="aktiveSpalten.includes('Aktionen')" class="mt-4 flex justify-end">
                <button @click="deleteTask(task)"
                  class="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                  title="Löschen">
                  <i class="mdi mdi-delete text-base"></i>
                  <span>Löschen</span>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Ladevorgang -->
        <div v-else-if="!hasError" class="p-6 text-center text-slate-500 text-sm">
          ⏳ Daten werden aus dem ChurchTools-KV-Store geladen …
        </div>

        <!-- Fehler -->
        <div v-else class="p-6 text-center text-slate-500 text-sm">
          ❌ Fehler beim Laden der Daten.
          <br />
          <button @click="deleteAllData"
            class="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow text-sm transition">
            <i class="mdi mdi-delete"></i> Kategorie «aufgaben» löschen
          </button>
        </div>
      </div>

      <!-- Rohdaten Vollbild-Modal -->
      <transition name="fade">
        <div v-if="showRawDataModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div class="bg-white w-full h-full overflow-auto p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-gray-800">Rohdaten (PersonMasterData)</h2>
              <button @click="showRawDataModal = false"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded">
                Schließen
              </button>
            </div>
            <!-- Alte Version -->
            <!-- <pre class="text-xs bg-gray-100 p-4 rounded overflow-auto">
  {{ formattedRawData }}
</pre> -->

            <!-- Neue Version: ausklappbare Cards -->
            <div class="space-y-3">
              <div v-for="(entry, key) in rawData" :key="key"
                class="border border-gray-200 rounded-lg bg-white shadow-sm">
                <button @click="toggleSection(key)"
                  class="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-left font-medium text-gray-800 rounded-t-lg">
                  <span>{{ key }}</span>
                  <i class="mdi" :class="expandedSections[key] ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
                </button>

                <transition name="fade">
                  <div v-if="expandedSections[key]"
                    class="p-4 text-xs text-gray-700 bg-gray-50 border-t border-gray-200 overflow-auto">
                    <p class="mb-2 italic text-gray-400">{{ entry.info }}</p>
                    <pre>{{ JSON.stringify(entry.data, null, 2) }}</pre>
                  </div>
                </transition>
              </div>
            </div>

          </div>
        </div>
      </transition>


    </main>
  </div>
</template>

<script setup lang="ts">
import TaskCreateForm from './TaskCreateForm.vue'

const showCreateForm = ref(false)
function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value
}


import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Person } from '../..//utils/ct-types'
import {
  getCustomDataValues,
  createCustomDataValue,
  updateCustomDataValue,
  deleteCustomDataValue,
  deleteCustomDataCategory
} from '../../utils/kv-store'
import UploadJson from '../UploadJson.vue'

import { useKvStore } from '../../composables/useModule'

import { initKvStore } from '../../data/initKvStore'


// ... deine Importe oben
// RICHTIG
import { usePermissions } from '../../composables/usePermissions'

import { fetchChurchToolsData } from '../../utils/fetchChurchToolsData'
import { fetchGroupChildren, type GroupChild } from '../../utils/fetchGroupChildren'






// Pfad anpassen



const props = defineProps<{ user: Person; KEY?: string }>()

const fullName = computed(() =>
  [props.user.firstName, props.user.lastName].filter(Boolean).join(' ')
)


const { canSeeAdminFeatures } = usePermissions(props.user)


const goHome = () =>
  (window.location.href = `${window.location.origin}/#HomeView/`)



const expandedSections = ref<Record<string, boolean>>({})

function toggleSection(key: string) {
  expandedSections.value[key] = !expandedSections.value[key]
}





// Zustand
const aufgabeData = ref<any[]>([])
const saveMessage = ref('')
const hasError = ref(false)
const kategorien = ref<string[]>([])
const aktiveKategorie = ref('Alle')
const uploadJsonRef = ref<InstanceType<typeof UploadJson> | null>(null)

const showRawDataModal = ref(false)
// speichert pro Aufgaben-ID, wann und wie viele verteilt wurden
const verteilInfo = ref<
  Record<string, { timestamp: string; count: number; gruppen: string[] }>
>({})







// Spalten + Statusoptionen
const columnConfig = {
  Alle: ['Titel', 'Kategorie', 'Abgabedatum', 'Anwendungsbereich', 'Status', 'Note', 'Aktionen'],
  Aktuell: ['Titel', 'Kategorie', 'Abgabedatum', 'Anwendungsbereich', 'Status', 'Note', 'Aktionen'],
  Aufgaben: ['Titel', 'Abgabedatum', 'Status', 'Note', 'Aktionen'],
  Vorlesung: ['Titel', 'Dozent', 'Status', 'Note', 'Aktionen'],
  Fachbereich: ['Titel', 'Status', 'Aktionen']
}
const aktiveSpalten = computed(
  () => (columnConfig as Record<string, string[]>)[aktiveKategorie.value] || columnConfig['Alle']
)

// Aufgabenfilter je Reiter
const gefilterteAufgaben = computed(() => {
  let base = aufgabeData.value

  // Kategorie-Filter für spezifische Kategorien (Aufgaben/Vorlesung/…)
  if (aktiveKategorie.value !== 'Alle' && aktiveKategorie.value !== 'Aktuell') {
    base = base.filter(
      (a) => a.properties['Kategorie']?.select?.name === aktiveKategorie.value
    )
  }

  // Reiter "Aktuell": nur Aufgaben mit Abgabedatum >= heute
  if (aktiveKategorie.value === 'Aktuell') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    base = base.filter((task) => {
      const dateStr = task.properties['Abgabedatum']?.date?.start
      if (!dateStr) return false
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return false
      date.setHours(0, 0, 0, 0)
      return date.getTime() >= today.getTime()
    })
  }

  // "Alle" oder andere Reiter → base so zurückgeben
  return base
})

const statusOptions = [
  'nachgehoert',
  'teilgenommen',
  'nicht teilgenommen',
  'nicht erfuellt',
  'rechtzeitig und vollstaendig erfuellt',
  'verspaetet aber vollstaendig erfuellt',
  'Note 1',
  'Note 2',
  'Note 3',
  'Note 4',
  'mehr als 95% gelesen',
  'mehr als 75% gelesen',
  'mehr als 50% gelesen',
  'weniger als 50% gelesen'
]

// Monats-Gruppierung für Reiter "Alle"
type MonatsGruppe = {
  key: string
  label: string
  info: string
  isPast: boolean
  tasks: any[]
}

const gruppierteAufgaben = computed<MonatsGruppe[]>(() => {
  if (!gefilterteAufgaben.value.length) return []

  // Nur bei "Alle" wirklich gruppieren
  if (aktiveKategorie.value !== 'Alle') {
    return [
      {
        key: 'alle',
        label: '',
        info: '',
        isPast: false,
        tasks: gefilterteAufgaben.value
      }
    ]
  }

  const groups = new Map<string, MonatsGruppe>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const task of gefilterteAufgaben.value) {
    const dateStr = task.properties['Abgabedatum']?.date?.start
    if (!dateStr) continue

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) continue

    const year = date.getFullYear()
    const monthIndex = date.getMonth() // 0–11
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

    const monthName = date.toLocaleString('de-DE', { month: 'long' })
    const label =
      monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + year

    if (!groups.has(key)) {
      groups.set(key, { key, label, info: '', isPast: false, tasks: [] })
    }

    groups.get(key)!.tasks.push(task)
  }

  const msPerDay = 1000 * 60 * 60 * 24
  for (const group of groups.values()) {
    if (!group.tasks.length) continue

    const dates: Date[] = group.tasks
      .map((t) => new Date(t.properties['Abgabedatum']?.date?.start))
      .filter((d) => !isNaN(d.getTime()))
    if (!dates.length) continue

    const earliest = new Date(
      Math.min.apply(
        null,
        dates.map((d) => d.getTime())
      )
    )
    earliest.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((earliest.getTime() - today.getTime()) / msPerDay)

    if (diffDays > 0) {
      group.info = `– noch ${diffDays} Tage`
      group.isPast = false
    } else {
      group.info = '– Abgabedatum ist bereits vorbei'
      group.isPast = true
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key))
})

function toggleDropdown(task: any) {
  const id = task.properties?.['AufgabenID']?.number?.toString()
  if (!id) return

  // Nur dieses Dropdown öffnen, andere schließen
  for (const key in showGroupDropdown.value) {
    showGroupDropdown.value[key] = false
  }

  showGroupDropdown.value[id] = !showGroupDropdown.value[id]

  // Wenn noch keine Auswahlstruktur existiert, initialisieren
  if (!aufgabenGruppen.value[id]) {
    aufgabenGruppen.value[id] = []
  }
}



function calculateNoteFromStatus(status: string | undefined | null): number | null {
  if (!status || status === 'kein Status') return null

  if (
    status === 'teilgenommen' ||
    status === 'nachgehoert' ||
    status === 'rechtzeitig und vollstaendig erfuellt' ||
    status === 'mehr als 95% gelesen' ||
    status === 'Note 1'
  ) {
    return 1
  }

  if (
    status === 'verspaetet aber vollstaendig erfuellt' ||
    status === 'mehr als 75% gelesen' ||
    status === 'Note 2'
  ) {
    return 2
  }

  if (status === 'mehr als 50% gelesen' || status === 'Note 3') {
    return 3
  }

  if (
    status === 'nicht teilgenommen' ||
    status === 'nicht erfuellt' ||
    status === 'weniger als 50% gelesen' ||
    status === 'Note 4'
  ) {
    return 4
  }

  return null
}

// Helper
async function showSaveMessage(text: string) {
  saveMessage.value = text
  await nextTick()
  setTimeout(() => (saveMessage.value = ''), 2500)
}
const statusColor = (status: string) => {
  if (status.includes('nicht') || status.includes('Note 4'))
    return 'bg-red-50 text-red-700'
  if (
    status.includes('erfuellt') ||
    status.includes('teilgenommen') ||
    status.includes('Note 1')
  )
    return 'bg-green-50 text-green-700'
  if (
    status.includes('mehr als 75%') ||
    status.includes('mehr als 50%') ||
    status.includes('Note 3')
  )
    return 'bg-yellow-50 text-yellow-700'
  if (status.includes('95%')) return 'bg-green-50 text-green-700'
  return 'bg-slate-50 text-slate-700'
}

// JSON Import
function openJsonImport() {
  uploadJsonRef.value?.openModal()
}

// Speichern + Laden der Aufgaben
async function saveSingleAufgabeToStore(task: any) {
  const { module, category } = await useKvStore(props.KEY)


  const userIdentifier =
    props.user.id?.toString() ||
    [props.user.firstName, props.user.lastName].filter(Boolean).join('-') ||
    'unknown'
  const churchToolsId =
    task.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
  const dataKey = `ct-${churchToolsId}-${userIdentifier}`
  const dataValue = JSON.stringify({ key: dataKey, user: userIdentifier, value: task })
  const allValues = await getCustomDataValues<{ key: string; value: any }>(
    category!.id,
    module.id
  )
  const existing = allValues.find((v) => v.key === dataKey)
  if (existing) {
    await updateCustomDataValue(
      category!.id,
      existing.id,
      { value: dataValue },
      module.id
    )
  } else {
    await createCustomDataValue(
      { dataCategoryId: category!.id, value: dataValue },
      module.id
    )
  }
  await showSaveMessage('✅ Aufgabe gespeichert.')
}
async function verteileAufgabe(task: any) {
  const aufgabenId = task.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
  const selectedIds = aufgabenGruppen.value[aufgabenId] || []
  if (!selectedIds.length) {
    await showSaveMessage('⚠️ Keine Gruppen für diese Aufgabe ausgewählt.')
    return
  }

  await showSaveMessage('📡 Aufgabe wird an die ausgewählten Gruppen verteilt …')

  // 🧩 Übergabe der ausgewählten Gruppen an initKvStore
  const result = await initKvStore(props.KEY, task, selectedIds)
  const total = result?.count ?? 0

  const timeNow = new Date().toLocaleString('de-DE')
  const selectedNames = gruppenOptions.value
    .filter((g) => selectedIds.includes(g.domainIdentifier))
    .map((g) => g.title)

  verteilInfo.value[aufgabenId] = { timestamp: timeNow, count: total, gruppen: selectedNames }
  task.verteilMeta = { timestamp: timeNow, count: total, gruppen: selectedNames }
  // 🧩 auch die ausgewählten Gruppen speichern
  task.selectedGroupIds = selectedIds

  await saveSingleAufgabeToStore(task)
  await showSaveMessage(`✅ Aufgabe an ${total} Teilnehmer in ${selectedNames.length} Gruppen verteilt.`)
}






async function saveAufgabeToStore() {
  for (const aufgabe of aufgabeData.value) await saveSingleAufgabeToStore(aufgabe)
  await showSaveMessage('✅ Alle Datensätze gespeichert.')
}
async function loadAufgabeFromStore() {
  try {
    hasError.value = false
    const { module, category } = await useKvStore(props.KEY)

    //const category = await getCustomDataCategory<object>('aufgaben')
    if (!category) {
      aufgabeData.value = []
      return
    }
    const userIdentifier =
      props.user.id?.toString() ||
      [props.user.firstName, props.user.lastName].filter(Boolean).join('-') ||
      'unknown'
    const stored = await getCustomDataValues<any>(category.id, module.id)
    const userValues = stored.filter((v) => v.user === userIdentifier)
    aufgabeData.value = userValues.map((v) => v.value)

    // 🧩 Verteilinformationen aus KV-Store übernehmen
    verteilInfo.value = {}
    for (const task of aufgabeData.value) {
      const churchToolsId = task.properties?.['AufgabenID']?.number?.toString()
      if (task.verteilMeta && churchToolsId) {
        verteilInfo.value[churchToolsId] = {
          timestamp: task.verteilMeta.timestamp ?? '',
          count: task.verteilMeta.count ?? 0,
          gruppen: Array.isArray(task.verteilMeta.gruppen)
            ? task.verteilMeta.gruppen
            : [],
        }
      }
    }
    // 🧩 gespeicherte Gruppen-Auswahl wiederherstellen
    aufgabenGruppen.value = {}
    for (const task of aufgabeData.value) {
      const id = task.properties?.['AufgabenID']?.number?.toString()
      if (id && Array.isArray(task.selectedGroupIds)) {
        aufgabenGruppen.value[id] = task.selectedGroupIds
      }
    }



  } catch (err) {
    hasError.value = true
    console.error('❌ Fehler beim Laden aus KV-Store:', err)
  }
  const alleKategorien = [
    ...new Set(
      aufgabeData.value
        .map((a) => a.properties['Kategorie']?.select?.name)
        .filter(Boolean)
    )
  ]
  // Reiter: Alle, Aktuell, dann Kategorien aus Daten
  kategorien.value = ['Alle', 'Aktuell', ...alleKategorien]
}

// Status-Update
async function updateTaskStatus(task: any) {
  const statusName = task.properties?.['Status']?.select?.name ?? 'kein Status'

  if (!task.properties['Status'])
    task.properties['Status'] = { select: { name: statusName } }
  else if (!task.properties['Status'].select)
    task.properties['Status'].select = { name: statusName }

  if (!task.properties['Status'].select.name)
    task.properties['Status'].select.name = 'kein Status'

  const calculatedNote = calculateNoteFromStatus(task.properties['Status'].select.name)

  if (!task.properties['Note Aufgabe zur Vorlesung'])
    task.properties['Note Aufgabe zur Vorlesung'] = { formula: { number: calculatedNote } }
  else {
    if (!task.properties['Note Aufgabe zur Vorlesung'].formula)
      task.properties['Note Aufgabe zur Vorlesung'].formula = {}
    task.properties['Note Aufgabe zur Vorlesung'].formula.number = calculatedNote
  }

  await saveSingleAufgabeToStore(task)
  await nextTick()
}

function updateStatusValue(task: any, event: Event) {
  const newValue = (event.target as HTMLSelectElement).value
  if (!task.properties['Status'])
    task.properties['Status'] = { select: { name: newValue } }
  else if (!task.properties['Status'].select)
    task.properties['Status'].select = { name: newValue }
  else task.properties['Status'].select.name = newValue
  updateTaskStatus(task)
}

// Löschen
async function deleteTask(task: any) {
  const confirmed = confirm('❗ Willst du diese Aufgabe wirklich löschen?')
  if (!confirmed) return
  const { module, category } = await useKvStore(props.KEY)

  //const category = await getCustomDataCategory<object>('aufgaben')
  if (!category) return
  const allValues = await getCustomDataValues<{ id: number; key: string; value: any }>(
    category.id,
    module.id
  )
  const churchToolsId =
    task.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
  const userIdentifier =
    props.user.id?.toString() ||
    [props.user.firstName, props.user.lastName].filter(Boolean).join('-') ||
    'unknown'
  const dataKey = `ct-${churchToolsId}-${userIdentifier}`
  const existing = allValues.find((v) => v.key === dataKey)
  if (existing) {
    await deleteCustomDataValue(category.id, existing.id, module.id)
    aufgabeData.value = aufgabeData.value.filter(
      (a) => a.properties?.['AufgabenID']?.number?.toString() !== churchToolsId
    )
    await showSaveMessage('🗑️ Aufgabe gelöscht.')
  }
}
async function deleteAllData() {
  const confirmed = confirm('⚠️ Willst du die Kategorie «aufgaben» wirklich löschen?')
  if (!confirmed) return
  const { module, category } = await useKvStore(props.KEY)

  // const category = await getCustomDataCategory<object>('aufgaben')
  if (!category) return
  await deleteCustomDataCategory(category.id, module.id)
  aufgabeData.value = []
  hasError.value = false
  await showSaveMessage('🗑️ Kategorie gelöscht.')
}

const rawData = ref<Record<string, any>>({}) // sammelt alles
// const formattedRawData = computed(() =>
//   JSON.stringify(rawData.value, null, 2)
// )

// Gruppen-Auswahl verwalten


const showGroupDropdown = ref<Record<string, boolean>>({})  // offenen Zustand pro Aufgabe
const aufgabenGruppen = ref<Record<string, string[]>>({})   // ausgewählte IDs pro Aufgabe
const gruppenOptions = ref<GroupChild[]>([])                // verfügbare Gruppen


function closeGroupDropdownOnOutsideClick(event: MouseEvent) {
  const dropdowns = document.querySelectorAll('.relative.inline-block')
  let clickedInsideAny = false

  // prüfen, ob der Klick in eines der Dropdown-Container gefallen ist
  dropdowns.forEach((el) => {
    if (el.contains(event.target as Node)) {
      clickedInsideAny = true
    }
  })

  // wenn außerhalb aller Dropdowns -> alle schließen
  if (!clickedInsideAny) {
    for (const id in showGroupDropdown.value) {
      showGroupDropdown.value[id] = false
    }
  }
}


onMounted(async () => {
  try {
    await loadAufgabeFromStore()
    rawData.value = await fetchChurchToolsData()

    // neue Gruppendaten holen
    gruppenOptions.value = await fetchGroupChildren('566')

    // Event‑Listener für Klick außerhalb des Dropdowns
    document.addEventListener('click', closeGroupDropdownOnOutsideClick)
  } catch (err) {
    console.error('❌ Fehler beim Laden der Daten:', err)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeGroupDropdownOnOutsideClick)
})






</script>

<style scoped>
/* #navigation {
  display: none !important;
} */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}



</style>
