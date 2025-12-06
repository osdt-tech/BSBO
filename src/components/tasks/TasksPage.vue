<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <TaskHeader :user="props.user" :KEY="props.KEY" :canSeeAdminFeatures="canSeeAdminFeatures"
      :showCreateForm="showCreateForm" @show-raw-data="showRawDataModal = true" @save-all="saveAufgabeToStore"
      @toggle-form="toggleCreateForm" />

    <!-- Benachrichtigungsmeldung -->
    <transition name="fade">
      <div v-if="saveMessage"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-md text-sm z-40">
        {{ saveMessage }}
      </div>
    </transition>

    <!-- Formular mit Fade-Transition -->
    <transition name="fade">
      <TaskCreateForm v-if="showCreateForm" :user="props.user" :KEY="props.KEY"
        @task-created="() => { showCreateForm = false; loadAufgabeFromStore() }" />
    </transition>

    <!-- Hauptinhalt -->
    <main class="flex-1 pb-10 px-4 sm:px-8">
      <TaskList :tasks="gefilterteAufgaben" :kategorien="kategorien" :aktivKategorie="aktiveKategorie"
        :visibleColumns="aktiveSpalten" :statusOptions="statusOptions" :canSeeAdminFeatures="canSeeAdminFeatures"
        :gruppenOptions="gruppenOptions" :selectedGroups="aufgabenGruppen" :openDropdown="showGroupDropdown"
        :verteilInfo="verteilInfo" :hasError="hasError" :gruppierteAufgaben="gruppierteAufgaben"
        @category-change="aktiveKategorie = $event" @task-status-change="updateStatusValue"
        @task-toggle-dropdown="toggleDropdown" @task-group-selected="handleGroupSelected"
        @task-distribute="verteileAufgabe" @task-delete="deleteTask" @delete-all-data="deleteAllData" />
    </main>

    <!-- Rohdaten Modal -->
    <RawDataModal :isOpen="showRawDataModal" :rawData="rawData" @close="showRawDataModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Person } from '../../utils/ct-types'
import TaskHeader from './TaskHeader.vue'
import TaskCreateForm from './TaskCreateForm.vue'
import TaskList from './TaskList.vue'
import RawDataModal from './RawDataModal.vue'
import { usePermissions } from '../../composables/usePermissions'
import { fetchChurchToolsData } from '../../utils/fetchChurchToolsData'
import { fetchGroupChildren, type GroupChild } from '../../utils/fetchGroupChildren'
import {
  getCustomDataValues,
  createCustomDataValue,
  updateCustomDataValue,
  deleteCustomDataValue,
  deleteCustomDataCategory
} from '../../utils/kv-store'
import { useKvStore } from '../../composables/useModule'
import { initKvStore } from '../../data/initKvStore'

// Props
const props = defineProps<{ user: Person; KEY?: string }>()

// Permissions
const { canSeeAdminFeatures } = usePermissions(props.user)

// UI State
const showCreateForm = ref(false)
const saveMessage = ref('')
const hasError = ref(false)
const showRawDataModal = ref(false)

// Daten
const aufgabeData = ref<any[]>([])
const kategorien = ref<string[]>([])
const aktiveKategorie = ref('Alle')
const rawData = ref<Record<string, any>>({})

// Gruppen-Management
const gruppenOptions = ref<GroupChild[]>([])
const showGroupDropdown = ref<Record<string, boolean>>({})
const aufgabenGruppen = ref<Record<string, string[]>>({})
const verteilInfo = ref<Record<string, { timestamp: string; count: number; gruppen: string[] }>>({})

// Spalten-Konfiguration
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

// Status Options
const statusOptions = [
  'nachgehoert', 'teilgenommen', 'nicht teilgenommen', 'nicht erfuellt',
  'rechtzeitig und vollstaendig erfuellt', 'verspaetet aber vollstaendig erfuellt',
  'Note 1', 'Note 2', 'Note 3', 'Note 4',
  'mehr als 95% gelesen', 'mehr als 75% gelesen', 'mehr als 50% gelesen', 'weniger als 50% gelesen'
]

// Aufgaben-Filterung
const gefilterteAufgaben = computed(() => {
  let base = aufgabeData.value

  if (aktiveKategorie.value !== 'Alle' && aktiveKategorie.value !== 'Aktuell') {
    base = base.filter(a => a.properties['Kategorie']?.select?.name === aktiveKategorie.value)
  }

  if (aktiveKategorie.value === 'Aktuell') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    base = base.filter(task => {
      const dateStr = task.properties['Abgabedatum']?.date?.start
      if (!dateStr) return false
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return false
      date.setHours(0, 0, 0, 0)
      return date.getTime() >= today.getTime()
    })
  }

  return base
})

// Monats-Gruppierung
type MonatsGruppe = {
  key: string
  label: string
  info: string
  isPast: boolean
  tasks: any[]
}

const gruppierteAufgaben = computed<MonatsGruppe[]>(() => {
  if (!gefilterteAufgaben.value.length) return []
  if (aktiveKategorie.value !== 'Alle') {
    return [{
      key: 'alle',
      label: '',
      info: '',
      isPast: false,
      tasks: gefilterteAufgaben.value
    }]
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
    const monthIndex = date.getMonth()
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    const monthName = date.toLocaleString('de-DE', { month: 'long' })
    const label = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + year

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

    const earliest = new Date(Math.min.apply(null, dates.map((d) => d.getTime())))
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

// Helper-Funktionen
function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value
}

function toggleDropdown(task: any) {
  const id = task.properties?.['AufgabenID']?.number?.toString()
  if (!id) return
  for (const key in showGroupDropdown.value) {
    showGroupDropdown.value[key] = false
  }
  showGroupDropdown.value[id] = !showGroupDropdown.value[id]
  if (!aufgabenGruppen.value[id]) {
    aufgabenGruppen.value[id] = []
  }
}

function handleGroupSelected(task: any, groupId: string) {
  const id = task.properties?.['AufgabenID']?.number?.toString()
  if (!id) return
  if (!aufgabenGruppen.value[id]) aufgabenGruppen.value[id] = []
  const idx = aufgabenGruppen.value[id].indexOf(groupId)
  if (idx > -1) {
    aufgabenGruppen.value[id].splice(idx, 1)
  } else {
    aufgabenGruppen.value[id].push(groupId)
  }
}

function calculateNoteFromStatus(status: string | undefined | null): number | null {
  if (!status || status === 'kein Status') return null
  if (status === 'teilgenommen' || status === 'nachgehoert' || status === 'rechtzeitig und vollstaendig erfuellt' || 
      status === 'mehr als 95% gelesen' || status === 'Note 1') return 1
  if (status === 'verspaetet aber vollstaendig erfuellt' || status === 'mehr als 75% gelesen' || status === 'Note 2') return 2
  if (status === 'mehr als 50% gelesen' || status === 'Note 3') return 3
  if (status === 'nicht teilgenommen' || status === 'nicht erfuellt' || status === 'weniger als 50% gelesen' || status === 'Note 4') return 4
  return null
}

async function showSaveMessage(text: string) {
  saveMessage.value = text
  await nextTick()
  setTimeout(() => (saveMessage.value = ''), 2500)
}

async function saveSingleAufgabeToStore(task: any) {
  const { module, category } = await useKvStore(props.KEY)
  const userIdentifier = props.user.id?.toString() || [props.user.firstName, props.user.lastName].filter(Boolean).join('-') || 'unknown'
  const churchToolsId = task.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
  const dataKey = `ct-${churchToolsId}-${userIdentifier}`
  const dataValue = JSON.stringify({ key: dataKey, user: userIdentifier, value: task })
  const allValues = await getCustomDataValues<{ key: string; value: any }>(category!.id, module.id)
  const existing = allValues.find((v) => v.key === dataKey)
  if (existing) {
    await updateCustomDataValue(category!.id, existing.id, { value: dataValue }, module.id)
  } else {
    await createCustomDataValue({ dataCategoryId: category!.id, value: dataValue }, module.id)
  }
  await showSaveMessage('✅ Aufgabe gespeichert.')
}

async function saveAufgabeToStore() {
  for (const aufgabe of aufgabeData.value) await saveSingleAufgabeToStore(aufgabe)
  await showSaveMessage('✅ Alle Datensätze gespeichert.')
}

async function loadAufgabeFromStore() {
  try {
    hasError.value = false
    const { module, category } = await useKvStore(props.KEY)
    if (!category) {
      aufgabeData.value = []
      return
    }
    const userIdentifier = props.user.id?.toString() || [props.user.firstName, props.user.lastName].filter(Boolean).join('-') || 'unknown'
    const stored = await getCustomDataValues<any>(category.id, module.id)
    const userValues = stored.filter((v) => v.user === userIdentifier)
    aufgabeData.value = userValues.map((v) => v.value)

    verteilInfo.value = {}
    for (const task of aufgabeData.value) {
      const churchToolsId = task.properties?.['AufgabenID']?.number?.toString()
      if (task.verteilMeta && churchToolsId) {
        verteilInfo.value[churchToolsId] = {
          timestamp: task.verteilMeta.timestamp ?? '',
          count: task.verteilMeta.count ?? 0,
          gruppen: Array.isArray(task.verteilMeta.gruppen) ? task.verteilMeta.gruppen : [],
        }
      }
    }

    aufgabenGruppen.value = {}
    for (const task of aufgabeData.value) {
      const id = task.properties?.['AufgabenID']?.number?.toString()
      if (id && Array.isArray(task.selectedGroupIds)) {
        aufgabenGruppen.value[id] = task.selectedGroupIds
      }
    }

    const alleKategorien = [...new Set(aufgabeData.value.map((a) => a.properties['Kategorie']?.select?.name).filter(Boolean))]
    kategorien.value = ['Alle', 'Aktuell', ...alleKategorien]
  } catch (err) {
    hasError.value = true
    console.error('❌ Fehler beim Laden aus KV-Store:', err)
  }
}

async function updateTaskStatus(task: any) {
  const statusName = task.properties?.['Status']?.select?.name ?? 'kein Status'
  if (!task.properties['Status']) task.properties['Status'] = { select: { name: statusName } }
  else if (!task.properties['Status'].select) task.properties['Status'].select = { name: statusName }
  if (!task.properties['Status'].select.name) task.properties['Status'].select.name = 'kein Status'

  const calculatedNote = calculateNoteFromStatus(task.properties['Status'].select.name)
  if (!task.properties['Note Aufgabe zur Vorlesung']) task.properties['Note Aufgabe zur Vorlesung'] = { formula: { number: calculatedNote } }
  else {
    if (!task.properties['Note Aufgabe zur Vorlesung'].formula) task.properties['Note Aufgabe zur Vorlesung'].formula = {}
    task.properties['Note Aufgabe zur Vorlesung'].formula.number = calculatedNote
  }

  await saveSingleAufgabeToStore(task)
  await nextTick()
}

function updateStatusValue(task: any, newValue: string) {
  if (!task.properties['Status']) task.properties['Status'] = { select: { name: newValue } }
  else if (!task.properties['Status'].select) task.properties['Status'].select = { name: newValue }
  else task.properties['Status'].select.name = newValue
  updateTaskStatus(task)
}

async function verteileAufgabe(task: any) {
  const aufgabenId = task.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
  const selectedIds = aufgabenGruppen.value[aufgabenId] || []
  if (!selectedIds.length) {
    await showSaveMessage('⚠️ Keine Gruppen für diese Aufgabe ausgewählt.')
    return
  }

  await showSaveMessage('📡 Aufgabe wird an die ausgewählten Gruppen verteilt …')
  const result = await initKvStore(props.KEY, task, selectedIds)
  const total = result?.count ?? 0
  const timeNow = new Date().toLocaleString('de-DE')
  const selectedNames = gruppenOptions.value.filter((g) => selectedIds.includes(g.domainIdentifier)).map((g) => g.title)

  verteilInfo.value[aufgabenId] = { timestamp: timeNow, count: total, gruppen: selectedNames }
  task.verteilMeta = { timestamp: timeNow, count: total, gruppen: selectedNames }
  task.selectedGroupIds = selectedIds

  await saveSingleAufgabeToStore(task)
  await showSaveMessage(`✅ Aufgabe an ${total} Teilnehmer in ${selectedNames.length} Gruppen verteilt.`)
}

async function deleteTask(task: any) {
  const confirmed = confirm('❗ Willst du diese Aufgabe wirklich löschen?')
  if (!confirmed) return
  const { module, category } = await useKvStore(props.KEY)
  if (!category) return
  const allValues = await getCustomDataValues<{ id: number; key: string; value: any }>(category.id, module.id)
  const churchToolsId = task.properties?.['AufgabenID']?.number?.toString() ?? 'unknown'
  const userIdentifier = props.user.id?.toString() || [props.user.firstName, props.user.lastName].filter(Boolean).join('-') || 'unknown'
  const dataKey = `ct-${churchToolsId}-${userIdentifier}`
  const existing = allValues.find((v) => v.key === dataKey)
  if (existing) {
    await deleteCustomDataValue(category.id, existing.id, module.id)
    aufgabeData.value = aufgabeData.value.filter((a) => a.properties?.['AufgabenID']?.number?.toString() !== churchToolsId)
    await showSaveMessage('🗑️ Aufgabe gelöscht.')
  }
}

async function deleteAllData() {
  const confirmed = confirm('⚠️ Willst du die Kategorie «aufgaben» wirklich löschen?')
  if (!confirmed) return
  const { module, category } = await useKvStore(props.KEY)
  if (!category) return
  await deleteCustomDataCategory(category.id, module.id)
  aufgabeData.value = []
  hasError.value = false
  await showSaveMessage('🗑️ Kategorie gelöscht.')
}

function closeGroupDropdownOnOutsideClick(event: MouseEvent) {
  const dropdowns = document.querySelectorAll('.relative.inline-block')
  let clickedInsideAny = false
  dropdowns.forEach((el) => {
    if (el.contains(event.target as Node)) {
      clickedInsideAny = true
    }
  })
  if (!clickedInsideAny) {
    for (const id in showGroupDropdown.value) {
      showGroupDropdown.value[id] = false
    }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await loadAufgabeFromStore()
    rawData.value = await fetchChurchToolsData()
    gruppenOptions.value = await fetchGroupChildren('566')
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
